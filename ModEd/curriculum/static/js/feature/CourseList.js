if (typeof window !== 'undefined' && !window.CourseList) {
  class CourseList {
    constructor(application) {
      this.application = application;
      window._deleteCourse = this.handleDelete.bind(this);
      window._editCourse = this.handleEdit.bind(this);
    }

    async getAllCourses() {
      const res = await fetch(`${RootURL}/curriculum/Course/getCourses`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      return data.result || [];
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

    async handleEdit(courseId) {
      if (!courseId) return;

      const res = await fetch(`${RootURL}/curriculum/Course/getCourses/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      this.courseData = data.result;

      await this.renderFormEdit();
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
      const courses = await this.getAllCourses();
      this.table.setData(courses);
      this.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('CourseList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      const courses = await this.getAllCourses();
      this.setupTable();
      this.table.setData(courses);
      await this.table.render();

      this.setupForm();
    }

    async renderFormEdit() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const formElement = await FormTemplate.getForm('CourseForm', 'create');
      this.application.templateEngine.mainContainer.appendChild(formElement);

      this.courseData.CurriculumId = this.courseData.CurriculumId.toString();
      this.courseData.CourseStatus = this.courseData.CourseStatus.toString();
      await this.form.setData(this.courseData);
    }

    setupTable() {
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
        ],
        customColumns: [
          {
            name: "actions",
            label: "Actions",
            template: `
              <div class="flex space-x-2">
                  <button onclick="_editCourse({ID})" 
                      class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      Edit
                  </button>
                  <button onclick="_deleteCourse({ID})" 
                      class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                       Delete
                   </button>
              </div>
            `
          },
        ],
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