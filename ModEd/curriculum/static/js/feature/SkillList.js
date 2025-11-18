if (typeof window !== 'undefined' && !window.SkillList) {
  class SkillList {
    constructor(application) {
      this.application = application;
      this.rawSkills = []; // Store raw data for edit modal
      window._deleteSkill = this.handleDelete.bind(this);
      window._editSkill = this.handleEdit.bind(this);
    }

    async getActionTemplate() {
      if (!SkillList.actionTemplateHtml) {
        const response = await fetch(`${RootURL}/curriculum/static/view/SkillActionButtons.tpl`);
        SkillList.actionTemplateHtml = (await response.text()).trim();
      }
      return SkillList.actionTemplateHtml;
    }

    async getAllSkills() {
      const res = await fetch(`${RootURL}/curriculum/Skill/getSkills`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => []);
      this.rawSkills = data.result || []; // Store raw data for edit modal
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
      if (this.table && typeof this.table.setData === 'function') {
        this.table.setData(skills);
      }
      // follow ClassList pattern: re-render the view after updating data
      await this.render();
    }

    async render() {
      // เคลียร์ main container
      this.application.templateEngine.mainContainer.innerHTML = "";
      const listWrapper = await ListTemplate.getList('SkillList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      // โหลดข้อมูลและ template ของปุ่ม
      const [skills, actionTemplate] = await Promise.all([
        this.getAllSkills(),
        this.getActionTemplate(),
      ]);

      // Check current user role
      const currentRole = localStorage.getItem('userRole');
      const isStudent = currentRole === 'Student';

      this.setupTable(actionTemplate, isStudent);
      this.table.setData(skills);
      await this.table.render();

      // ensure routerLink bindings are applied to newly injected action buttons
      const routerLinks = this.application?.templateEngine?.routerLinks;
      if (routerLinks && typeof routerLinks.initializeRouterLinks === 'function') {
        routerLinks.initializeRouterLinks();
      }

      this.setupForm();
    }

    setupTable(actionTemplate, isStudent) {
      // Prepare custom columns - only include Actions if not Student
      const customColumns = [];
      if (!isStudent) {
        customColumns.push({
          name: "actions",
          label: "Actions",
          template: actionTemplate
        });
      }

      this.table = new AdvanceTableRender(this.application.templateEngine, {
        modelPath: "curriculum/skill",
        data: [],
        targetSelector: "#skill-table",
        schema: [
          { name: "ID", label: "No.", type: "number" },
          { name: "Name", label: "Name", type: "text" },
          { name: "Description", label: "Description", type: "text" },
        ],
        // คอลัมน์เสริมสำหรับปุ่มแอ็คชัน - แสดงเฉพาะ Admin
        customColumns: customColumns,
        // เปิดใช้งาน Search และ Sorting
        enableSearch: true,
        searchConfig: {
          placeholder: "Search skills...",
          fields: [
            { value: "all", label: "All" },
            { value: "Name", label: "Name" },
            { value: "Description", label: "Description" },
          ]
        },
        enableSorting: true,
        sortConfig: {
          defaultField: "ID",
          defaultDirection: "asc"
        },
        // เปิด Pagination (optional)
        enablePagination: true,
        pageSize: 10
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
  SkillList.actionTemplateHtml = null;
}
