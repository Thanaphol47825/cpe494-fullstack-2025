if (typeof window !== 'undefined' && !window.CourseList) {
  class CourseList {
    constructor(application) {
      this.application = application;
      this.extensions = [];
      this.rawCourses = [];
      window._deleteCourse = this.handleDelete.bind(this);
      window._editCourse = this.handleEdit.bind(this);
      window._viewCourse = this.handleViewDetail.bind(this);
    }

    appendExtension(extension) {
      if (extension instanceof CourseExtension) {
        this.extensions.push(extension);
        extension.setHost(this);
      }
    }

    async getAllCourses() {
      const res = await fetch(`${RootURL}/curriculum/Course/getCourses`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      return data.result || [];
    }

    async getSkillsByCourse(courseId) {
      const res = await fetch(`${RootURL}/curriculum/CourseSkill/getSkillsByCourse/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));
      const label = data?.result?.SkillLabel || "";
      return label;
    }

    async getAllCoursesWithSkills() {
      const courses = await this.getAllCourses();
      this.rawCourses = courses;
      if (!Array.isArray(courses) || courses.length === 0) return [];

      const ids = courses.map(c => Number(c.ID ?? c.Id ?? c.id));
      const labels = await Promise.all(
        ids.map(id => Number.isFinite(id)
          ? this.getSkillsByCourse(id).catch(() => "")
          : Promise.resolve(""))
      );

      return courses.map((c, i) => ({
        ...c,
        Skills: labels[i] || ""
      }));
    }

    async handleSubmit(formData) {
      try {
        formData.ID = parseInt(this.courseData.ID);
        formData.CurriculumId = parseInt(formData.CurriculumId);
        formData.CourseStatus = parseInt(formData.CourseStatus);
        formData.Optional = !!formData.Optional;

        const resp = await fetch(
          RootURL + `/curriculum/Course/updateCourse/${formData.ID}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Course updated!");
          await this.refreshTable();
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }

    async getActionTemplate() {
      if (!CourseList.actionTemplateHtml) {
        const response = await fetch(`${RootURL}/curriculum/static/view/CourseActionButtons.tpl`);
        CourseList.actionTemplateHtml = (await response.text()).trim();
      }
      return CourseList.actionTemplateHtml;
    }

    async handleViewDetail(courseId) {
      if (!courseId) return;

      try {
        if (!window.ViewDetailModalTemplate) {
          await this.application.loadSubModule('template/CurriculumViewDetailModalTemplate.js');
        }

        const courseData = this.rawCourses.find(item => item.ID === courseId);

        if (!courseData) {
          alert('Course not found');
          return;
        }

        const modalId = `course-view-${courseId}`;

        await ViewDetailModalTemplate.createModal({
          modalType: 'Course',
          modalId: modalId,
          data: courseData
        });

      } catch (error) {
        console.error('Error opening view detail modal:', error);
        alert('Error opening view detail modal: ' + error.message);
      }
    }

    async handleEdit(courseId) {
      if (!courseId) return;

      try {
        if (!window.EditModalTemplate) {
          await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
        }

        const res = await fetch(`${RootURL}/curriculum/Course/getCourses/${courseId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        this.courseData = data.result || {};

        if (this.courseData?.CurriculumId !== undefined) {
          this.courseData.CurriculumId = this.courseData.CurriculumId.toString();
        }
        if (this.courseData?.CourseStatus !== undefined) {
          this.courseData.CourseStatus = this.courseData.CourseStatus.toString();
        }

        const modalId = `course-${courseId}`;

        await EditModalTemplate.createModalWithForm({
          modalType: 'Course',
          modalId,
          application: this.application,
          modelPath: 'curriculum/course',
          data: this.courseData,
          submitHandler: async (formData) => {
            formData.ID = parseInt(courseId);
            await this.handleSubmit(formData);
            return { success: true, message: "Course updated!" };
          },
        });

      } catch (err) {
        console.error('Error opening edit modal:', err);
        alert('Error opening edit modal: ' + (err?.message || err));
      }
    }

    async handleDelete(courseId) {
      if (!courseId) return;
      if (!confirm('Delete Course?')) return;

      try {
        const resp = await fetch(`${RootURL}/curriculum/Course/deleteCourse/${courseId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const resJson = await resp.json().catch(() => ({}));
        if (!resp.ok || resJson.isSuccess === false) {
          throw new Error(resJson.result || `HTTP ${resp.status}`);
        }

        await this.refreshTable();
      } catch (err) {
        alert(`Delete failed: ${err?.message || err}`);
      }
    }

    async refreshTable() {
      const courses = await this.getAllCoursesWithSkills();
      this.table.setData(courses);
      this.table.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('CourseList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      if (this.extensions && this.extensions.length > 0) {
        await Promise.all(this.extensions.map(ext => ext.initialize()));
      }

      const [courses, actionTemplate] = await Promise.all([
        this.getAllCoursesWithSkills(),
        this.getActionTemplate(),
      ]);

      const currentRole = localStorage.getItem('userRole');
      const isStudent = currentRole === 'Student';
      const isInstructor = currentRole === 'Instructor';

      this.setupTable(!(isStudent || isInstructor) ? actionTemplate : null);
      this.table.setData(courses);
      await this.table.render();

      this.setupForm();
    }

    setupTable(actionTemplate) {
      let extensionColumns = [];
      for (const ext of this.extensions) {
        extensionColumns = extensionColumns.concat(ext.getCustomColumns());
      }
      const customColumns = [];
      if (actionTemplate) {
        customColumns.push({
          name: "actions",
          label: "Action",
          template: actionTemplate
        });
      }
      const allColumns = customColumns.concat(extensionColumns);
      this.table = new AdvanceTableRender(this.application.templateEngine, {
        modelPath: "curriculum/course",
        data: [],
        targetSelector: "#course-table",
        schema: [
          { name: "ID", label: "No.", type: "number" },
          { name: "Name", label: "Name", type: "text" },
          { name: "Description", label: "Description", type: "text" },
          { name: "CurriculumId", label: "Curriculum", type: "text" },
          { name: "Optional", label: "Optional", type: "checkbox" },
          { name: "CourseStatus", label: "Status", type: "text" },
          { name: "Skills", label: "Skills", type: "text" },
        ],

        // Use the dynamic list
        customColumns: allColumns,

        enableSearch: true,
        searchConfig: {
          placeholder: "Search courses...",
          fields: [
            { value: "all", label: "All" },
            { value: "Name", label: "Name" },
            { value: "Description", label: "Description" },
            { value: "CurriculumId", label: "Curriculum" },
            { value: "CourseStatus", label: "Status" },
            { value: "Skills", label: "Skills" },
          ]
        },
        enableSorting: true,
        sortConfig: {
          defaultField: "ID",
          defaultDirection: "asc"
        },

        enablePagination: true,
        pageSize: 10
      });
    }

    setupForm() {
      this.form = new AdvanceFormRender(this.application.templateEngine, {
        modelPath: "curriculum/course",
        targetSelector: "#course-form",
        submitHandler: this.handleSubmit.bind(this),
      });
    }

  }

  if (typeof window !== 'undefined') {
    window.CourseList = CourseList;
  }
}
