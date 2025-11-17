if (typeof window !== 'undefined' && !window.CourseSkillList) {
  class CourseSkillList extends CourseExtension {
    constructor(application) {
      super(application);
      this.application = application;
      this.rawCourseSkills = []; // Store raw data for edit modal
      window._deleteCourseSkill = this.handleDelete.bind(this);
      window._editCourseSkill = this.handleEdit.bind(this);
      window._addSkillToCourse = this.handleAddSkills.bind(this);
    }

    getCustomColumns() {
      const currentRole = localStorage.getItem('userRole');
      const isStudent = currentRole === 'Student';

      // hide Add Skill  button for Student
      if (isStudent) {
        return [];
      }

      return [
        {
          name: "skill-actions",
          label: "Skill Actions",
          template: `
                    <button onclick="_addSkillToCourse({ID})" 
                            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg ...">
                        Add Skill
                    </button>
                `
        }
      ];
    }

    async handleSubmitCreateNew(formData) {
      try {
        const resp = await fetch(
          RootURL + `/curriculum/CourseSkill/createCourseSkills`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Course Skill created!");
          if (this.host && typeof this.host.refreshTable === 'function') {
            await this.host.refreshTable();
          } else {
            alert("Error: " + (data.result || "Failed to refresh"));
          }
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }

    async handleAddSkills(courseId) {
      if (!courseId) return;

      try {
        if (!window.CreateRelatedModalTemplate) {
          await this.application.loadSubModule('template/CurriculumCreateRelatedModalTemplate.js');
        }

        const modalId = `courseskill-create-${courseId}`;

        const courseData = this.host.rawCourses.find(item => item.ID === courseId);
        const newCourseSkill = {
          CourseId: courseId,
          Name: courseData.Name
        }
        const allSkills = await this.getAllSkills()
        await CreateRelatedModalTemplate.createModalWithForm({
          modalType: 'CourseSkill',
          modalId,
          choiceData: allSkills,
          data: newCourseSkill,
          modelPath: 'curriculum/courseskill',
          submitHandler: async (formData) => {
            await this.handleSubmitCreateNew(formData);
            return { success: true, message: "Course Skill created!" };
          },
        });

      } catch (err) {
        console.error('Error opening create course skill modal:', err);
        alert('Error opening create course skill modal: ' + (err?.message || err));
      }
    }

    async getAllSkills() {
      const res = await fetch(`${RootURL}/curriculum/Skill/getSkills`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      return data.result || [];
    }

    getCourseSkills = async () => {
      const res = await fetch(`${RootURL}/curriculum/CourseSkill/getCourseSkills`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      return data.result || [];
    }

    async getAllCourseSkills() {
      const rawData = await this.getCourseSkills();
      this.rawCourseSkills = rawData; // Store raw data for edit modal

      let courseSkills = [];
      rawData.forEach(item => {
        courseSkills.push({
          ID: item.ID,
          CourseName: item.Course && item.Course.Name ? item.Course.Name : 'N/A',
          SkillName: item.Skill && item.Skill.Name ? item.Skill.Name : 'N/A'
        });
      });

      return courseSkills;
    }

    //load action tpl for CourseSkill
    async getActionTemplate() {
      if (!CourseSkillList.actionTemplateHtml) {
        try {
          const response = await fetch(`${RootURL}/curriculum/static/view/CourseSkillActionButtons.tpl`);
          CourseSkillList.actionTemplateHtml = (await response.text()).trim();
        } catch (err) {
          console.warn('Failed to load CourseSkillActionButtons.tpl', err);
          CourseSkillList.actionTemplateHtml = null;
        }
      }
      return CourseSkillList.actionTemplateHtml;
    }

    async handleSubmit(formData) {
      try {
        formData.ID = parseInt(this.courseSkillData.ID);
        formData.CourseId = parseInt(formData.CourseId);

        // Check if SkillId is array (multiple selection)
        if (Array.isArray(formData.SkillId)) {
          if (formData.SkillId.length > 3) {
            alert("You can select maximum 3 skills only.");
            return false;
          }
          if (formData.SkillId.length === 0) {
            alert("Please select at least one skill.");
            return false;
          }
          formData.SkillId = formData.SkillId.map(id => parseInt(id));
        } else {
          formData.SkillId = parseInt(formData.SkillId);
        }

        const resp = await fetch(
          RootURL + `/curriculum/CourseSkill/updateCourseSkill/${formData.ID}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Course Skill updated!");
          await this.refreshTable();
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }

    async handleEdit(courseSkillId) {
      if (!courseSkillId) return;

      try {
        if (!window.EditModalTemplate) {
          await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
        }

        // Find the course skill data from rawCourseSkills
        const courseSkillData = this.rawCourseSkills.find(item => item.ID === courseSkillId);
        if (!courseSkillData) {
          alert('Course Skill not found');
          return;
        }

        this.courseSkillData = courseSkillData;

        if (this.courseSkillData?.CourseId !== undefined) {
          this.courseSkillData.CourseId = this.courseSkillData.CourseId.toString();
        }
        if (this.courseSkillData?.SkillId !== undefined) {
          this.courseSkillData.SkillId = this.courseSkillData.SkillId.toString();
        }

        const modalId = `courseskill-${courseSkillId}`;

        await EditModalTemplate.createModalWithForm({
          modalType: 'CourseSkill',
          modalId,
          application: this.application,
          modelPath: 'curriculum/courseskill',
          data: this.courseSkillData,
          submitHandler: async (formData) => {
            formData.ID = parseInt(courseSkillId);
            await this.handleSubmit(formData);
            return { success: true, message: "Course Skill updated!" };
          },
        });

      } catch (err) {
        console.error('Error opening edit modal:', err);
        alert('Error opening edit modal: ' + (err?.message || err));
      }
    }

    async handleDelete(courseSkillId) {
      if (!courseSkillId) return;
      if (!confirm('Delete Course Skill?')) return;

      try {
        const resp = await fetch(`${RootURL}/curriculum/CourseSkill/deleteCourseSkill/${courseSkillId}`, {
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
      const courseSkills = await this.getAllCourseSkills();
      if (this.table && typeof this.table.setData === 'function') {
        this.table.setData(courseSkills);
        await this.table.render();
        return;
      }
      // fallback to full render
      await this.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('CourseSkillList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      const currentRole = localStorage.getItem('userRole');
      const isStudent = currentRole === 'Student';

      const [courseSkills, actionTemplate] = await Promise.all([
        this.getAllCourseSkills(),
        // Student role does not get action template
        isStudent ? Promise.resolve(null) : this.getActionTemplate(),
      ]);

      await this.setupTable(actionTemplate, courseSkills);
      await this.table.render();

      this.setupForm();
    }

    async setupTable(actionTemplate, courseSkills = []) {
      const customCols = [];
      if (actionTemplate) {
        customCols.push({
          name: "actions",
          label: "Actions",
          template: actionTemplate
        });
      }

      this.table = new AdvanceTableRender(this.application.templateEngine, {
        // modelPath: "curriculum/courseskill",
        data: courseSkills,
        targetSelector: "#courseskill-table",
        schema: [
          { name: "ID", label: "No.", type: "number" },
          { name: "CourseName", label: "Course", type: "text" },
          { name: "SkillName", label: "Skill", type: "text" },
        ],
        customColumns: customCols,
        enableSearch: true,
        searchConfig: {
          placeholder: "Search course skills...",
          fields: [
            { value: "all", label: "All" },
            { value: "CourseName", label: "Course" },
            { value: "SkillName", label: "Skill" },
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
        modelPath: "curriculum/courseskill",
        targetSelector: "#courseskill-form",
        submitHandler: this.handleSubmit.bind(this),
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.CourseSkillList = CourseSkillList;
  }
  CourseSkillList.actionTemplateHtml = null;
}
