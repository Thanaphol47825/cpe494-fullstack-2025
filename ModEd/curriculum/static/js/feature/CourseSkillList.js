if (typeof window !== 'undefined' && !window.CourseSkillList) {
  class CourseSkillList {
    constructor(application) {
      this.application = application;
      this.rawCourseSkills = []; // Store raw data for edit modal
      window._deleteCourseSkill = this.handleDelete.bind(this);
      window._editCourseSkill = this.handleEdit.bind(this);
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
      this.table.setData(courseSkills);
      this.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('CourseSkillList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

    //   const courseSkills = await this.getAllCourseSkills();
      await this.setupTable();
    //   this.table.setData(courseSkills);
      await this.table.render();

      this.setupForm();
    }

    async setupTable() {
        const courseSkills = await this.getAllCourseSkills();
        this.table = new AdvanceTableRender(this.application.templateEngine, {
            // modelPath: "curriculum/courseskill",
            data: courseSkills,
            targetSelector: "#courseskill-table",
            schema: [
                { name: "ID", label: "No.", type: "number" },
                { name: "CourseName", label: "Course", type: "text" },
                { name: "SkillName", label: "Skill", type: "text" },
            ],
            customColumns: [
            {
                name: "actions",
                label: "Actions",
                template: `
                <div class="flex space-x-2">
                    <button onclick="_editCourseSkill({ID})" 
                        class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        Edit
                    </button>
                    <button onclick="_deleteCourseSkill({ID})" 
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
        modelPath: "curriculum/courseskill",
        targetSelector: "#courseskill-form",
        submitHandler: this.handleSubmit.bind(this),
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.CourseSkillList = CourseSkillList;
  }
}
