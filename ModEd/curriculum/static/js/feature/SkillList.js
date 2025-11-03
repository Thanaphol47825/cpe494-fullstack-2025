if (typeof window !== 'undefined' && !window.SkillList) {
  class SkillList {
    constructor(application) {
      this.application = application;
      window._deleteSkill = this.handleDelete.bind(this);
      window._editSkill = this.handleEdit.bind(this);
    }

    async getAllSkills() {
      const res = await fetch(`${RootURL}/curriculum/Skill/getSkills`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      return data.result || [];
    }

    async handleSubmit(formData) {
      try {
        formData.ID = parseInt(this.skillData.ID);

        const resp = await fetch(
          RootURL + `/curriculum/Skill/updateSkill/${formData.ID}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Skill updated!");
          await this.refreshTable();
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }

    async handleEdit(skillId) {
      if (!skillId) return;

      try {
        if (!window.EditModalTemplate) {
          await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
        }

        const res = await fetch(`${RootURL}/curriculum/Skill/getSkills/${skillId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        this.skillData = data.result || {};

        const modalId = `skill-${skillId}`;
        
        await EditModalTemplate.createModalWithForm({
          modalType: 'Skill',
          modalId,
          application: this.application,
          modelPath: 'curriculum/skill',
          data: this.skillData,
          submitHandler: async (formData) => {
            formData.ID = parseInt(skillId);
            await this.handleSubmit(formData);
              return { success: true, message: "Skill updated!" };
          },
        });

      } catch (err) {
        console.error('Error opening edit modal:', err);
        alert('Error opening edit modal: ' + (err?.message || err));
      }
    }

    async handleDelete(skillId) {
      if (!skillId) return;
      if (!confirm('Delete Skill?')) return;

      try {
        const resp = await fetch(`${RootURL}/curriculum/Skill/deleteSkill/${skillId}`, {
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
      const skills = await this.getAllSkills();
      this.table.setData(skills);
      this.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('SkillList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      const skills = await this.getAllSkills();
      this.setupTable();
      this.table.setData(skills);
      await this.table.render();

      this.setupForm();
    }

    setupTable() {
      this.table = new AdvanceTableRender(this.application.templateEngine, {
        modelPath: "curriculum/skill",
        data: [],
        targetSelector: "#skill-table",
        schema: [
          { name: "ID", label: "No.", type: "number" },
          { name: "Name", label: "Name", type: "text" },
          { name: "Description", label: "Description", type: "text" },
        ],
        customColumns: [
          {
            name: "actions",
            label: "Actions",
            template: `
              <div class="flex space-x-2">
                  <button onclick="_editSkill({ID})" 
                      class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      Edit
                  </button>
                  <button onclick="_deleteSkill({ID})" 
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
        modelPath: "curriculum/skill",
        targetSelector: "#skill-form",
        submitHandler: this.handleSubmit.bind(this),
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.SkillList = SkillList;
  }
}
