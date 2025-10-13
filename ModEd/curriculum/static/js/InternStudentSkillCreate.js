// curriculum/static/js/module/InternStudentSkillCreate.js
if (typeof window !== "undefined" && !window.InternStudentSkillCreate) {
  class InternStudentSkillCreate {
    constructor(application, internStudentId = null, studentSkillId = null) {
      this.application = application;
      this.internStudentId = internStudentId;   // lock student when provided
      this.studentSkillId = studentSkillId;     // for edit mode (optional)
      this.isEditMode = studentSkillId !== null;

      this.internStudentData = null;            // details for the locked student (name to show)
      this.studentSkillData = null;             // record to edit
      this.lookups = { students: [], skills: [] };

      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || "";
      this.endpoints = {
        listStudents: this.rootURL + "/curriculum/InternStudent",
        listSkills:   this.rootURL + "/curriculum/InternSkill",
        getOne:       (id) => this.rootURL + `/curriculum/InternStudentSkill/${id}`,
        create:             this.rootURL + "/curriculum/CreateInternStudentSkill",
        update:       (id) => this.rootURL + `/curriculum/UpdateInternStudentSkill/${id}`,
      };
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = () =>
            window.InternshipPageTemplate ? resolve() : reject(new Error("InternshipPageTemplate failed to load"));
          script.onerror = () => reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    async render() {
      try {
        await this.loadInternshipPageTemplate();
        await this.loadData();

        this.application.mainContainer.innerHTML = "";

        const pageConfig = this.preparePageConfig();
        const formContent = await this.generateFormFields();

        const pageElement = await window.InternshipPageTemplate.render(
          pageConfig,
          formContent,
          this.application
        );
        this.application.mainContainer.appendChild(pageElement);
        this.setupEventListeners();
      } catch (error) {
        console.error("Error rendering InternStudentSkillCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    preparePageConfig() {
      const title = this.isEditMode ? "Edit Student Skill" : "Add Student Skill";
      const descName = this.internStudentData
        ? `${this.internStudentData.Student?.first_name || ""} ${this.internStudentData.Student?.last_name || ""}`.trim()
        : "";
      const description = descName ? `For: ${descName}` : "Link a student with a skill and set the level.";

      return {
        title,
        description,
        showBackButton: true,
        backButtonText: "Back",
        backButtonRoute: this.internStudentId
          ? `/#internship/internstudent/edit/${this.internStudentId}`
          : "/#internship/internstudent",
        pageClass: "internship-student-skill-page",
        headerClass: "internship-header",
        contentClass: "internship-content",
      };
    }

    async loadData() {
      // lookups
      const [stuRes, sklRes] = await Promise.all([
        fetch(this.endpoints.listStudents),
        fetch(this.endpoints.listSkills),
      ]);
      const stuData = await stuRes.json();
      const sklData = await sklRes.json();

      if (!stuRes.ok || !stuData.isSuccess || !Array.isArray(stuData.result)) {
        throw new Error(stuData.error || "Failed to load students");
      }
      if (!sklRes.ok || !sklData.isSuccess || !Array.isArray(sklData.result)) {
        throw new Error(sklData.error || "Failed to load skills");
      }
      this.lookups.students = stuData.result;
      this.lookups.skills = sklData.result;

      // locked student details
      if (this.internStudentId) {
        const internResponse = await fetch(`/curriculum/InternStudent/${this.internStudentId}`);
        const internData = await internResponse.json();
        if (internResponse.ok && internData.isSuccess) {
          this.internStudentData = internData.result;
        }
      }

      // edit record
      if (this.isEditMode && this.studentSkillId) {
        const ssRes = await fetch(this.endpoints.getOne(this.studentSkillId));
        const ssData = await ssRes.json();
        if (!ssRes.ok || !ssData.isSuccess) {
          throw new Error(ssData.error || "Failed to load student skill");
        }
        this.studentSkillData = ssData.result;
      }
    }

    _toStudentOptions(list) {
      return list.map((s) => {
        const id = s?.ID ?? s?.id ?? s?.Id;
        const code = s?.Student?.StudentCode ?? s?.StudentCode ?? s?.student_code ?? "";
        const first = s?.Student?.FirstName ?? s?.Student?.first_name ?? "";
        const last  = s?.Student?.LastName  ?? s?.Student?.last_name  ?? "";
        const name = [first, last].filter(Boolean).join(" ").trim();
        const label = name ? `${code ? code + " - " : ""}${name}` : (code || `#${id}`);
        return { value: String(id), label: label || String(id) };
      });
    }

    _toSkillOptions(list) {
      return list.map((k) => {
        const id = k?.ID ?? k?.id ?? k?.Id;
        const name = k?.skill_name ?? k?.SkillName ?? `Skill #${id}`;
        return { value: String(id), label: name };
      });
    }

    async generateFormFields() {
      const studentOptions = this._toStudentOptions(this.lookups.students);
      const skillOptions   = this._toSkillOptions(this.lookups.skills);
      const levelOptions = [
        { value: "1", label: "1 - Beginner" },
        { value: "2", label: "2 - Intermediate" },
        { value: "3", label: "3 - Advanced" },
        { value: "4", label: "4 - Expert" },
        { value: "5", label: "5 - Master" },
      ];

      const editStudentId = this.studentSkillData?.student_id ? String(this.studentSkillData.student_id) : "";
      const editSkillId   = this.studentSkillData?.skill_id   ? String(this.studentSkillData.skill_id)   : "";
      const editLevel     = this.studentSkillData?.level      ? String(this.studentSkillData.level)      : "1";

      const lockedStudentId = this.internStudentId ? String(this.internStudentId) : "";
      const studentFullName = this.internStudentData
        ? `${this.internStudentData.Student?.first_name || ""} ${this.internStudentData.Student?.last_name || ""}`.trim()
        : "";

      // --- Student (LOCKED: grey, not editable; UNLOCKED: dropdown) ---
      let studentFieldHTML = "";
      if (lockedStudentId) {
        const idValue = this.internStudentData?.StudentID || lockedStudentId;
        const labelText = studentFullName ? `Student (${studentFullName})` : "Student";
        // show disabled display + hidden real value to submit
        studentFieldHTML = `
          <div class="form-field">
            <label class="block text-sm font-medium text-gray-700 mb-1">${labelText}</label>
            <input
              id="student_id_display"
              type="text"
              class="form-input bg-gray-100 cursor-not-allowed text-gray-700"
              value="${idValue}"
              disabled
              readonly
              tabindex="-1"
              aria-readonly="true"
            />
            <input type="hidden" id="student_id" name="student_id" value="${idValue}" />
          </div>
        `;
      } else {
        const opts = studentOptions
          .map(o => `<option value="${o.value}" ${String(editStudentId || studentOptions[0]?.value || "")===o.value?'selected':''}>${o.label}</option>`)
          .join('');
        studentFieldHTML = `
          <div class="form-field">
            <label for="student_id" class="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select id="student_id" name="student_id" class="form-select" required>${opts}</select>
          </div>
        `;
      }

      // --- Skill field ---
      const skillOpts = skillOptions
        .map(o => `<option value="${o.value}" ${String(editSkillId || skillOptions[0]?.value || "")===o.value?'selected':''}>${o.label}</option>`)
        .join('');
      const skillFieldHTML = `
        <div class="form-field">
          <label for="skill_id" class="block text-sm font-medium text-gray-700 mb-1">Skill</label>
          <select id="skill_id" name="skill_id" class="form-select" required>${skillOpts}</select>
        </div>
      `;

      // --- Level field ---
      const levelOpts = levelOptions
        .map(o => `<option value="${o.value}" ${String(editLevel || "1")===o.value?'selected':''}>${o.label}</option>`)
        .join('');
      const levelFieldHTML = `
        <div class="form-field">
          <label for="level" class="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
          <select id="level" name="level" class="form-select" required>${levelOpts}</select>
        </div>
      `;

      // wrap as form content (InternshipPageTemplate will inject inside page)
      return `
        <form id="intern-student-skill-form" class="space-y-6">
          <div id="form-fields" class="space-y-4">
            ${studentFieldHTML}
            ${skillFieldHTML}
            ${levelFieldHTML}
          </div>
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              ${this.isEditMode ? "Update" : "Create"} Student Skill
            </button>
          </div>
        </form>
      `;
    }

    setupEventListeners() {
      const cancelButton = document.getElementById("cancel-btn");
      if (cancelButton) {
        cancelButton.addEventListener("click", (e) => { e.preventDefault(); this.goBack(); });
      }

      // prevent typing/focus on the locked display field (extra safety)
      if (this.internStudentId) {
        const disp = document.getElementById("student_id_display");
        if (disp) {
          const block = (e) => e.preventDefault();
          disp.addEventListener("keydown", block);
          disp.addEventListener("beforeinput", block);
          disp.addEventListener("paste", block);
          disp.addEventListener("focus", () => disp.blur());
        }
      }

      const form = document.getElementById("intern-student-skill-form");
      if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);

      const payload = {
        student_id: this.internStudentId
          ? parseInt(this.internStudentId, 10)
          : parseInt(fd.get("student_id"), 10),
        skill_id: parseInt(fd.get("skill_id"), 10),
        level:    parseInt(fd.get("level"), 10),
      };

      if (!payload.student_id || !payload.skill_id || !payload.level) {
        window.InternshipPageTemplate?.showError("Missing required fields", this.application.mainContainer);
        return;
      }

      const url = this.isEditMode ? this.endpoints.update(this.studentSkillId) : this.endpoints.create;
      window.InternshipPageTemplate.showLoading(form, this.isEditMode ? "Updating..." : "Creating...");

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (!res.ok || !result.isSuccess) {
          throw new Error(result.error || `Failed to ${this.isEditMode ? "update" : "create"} student skill`);
        }

        window.InternshipPageTemplate.showSuccess(
          `Student Skill ${this.isEditMode ? "updated" : "created"} successfully!`,
          this.application.mainContainer
        );
        setTimeout(() => this.goBack(), 1000);
      } catch (err) {
        window.InternshipPageTemplate.showError(err.message || "Request error", this.application.mainContainer);
      } finally {
        window.InternshipPageTemplate.hideLoading(
          form,
          `${this.isEditMode ? "Update" : "Create"} Student Skill`
        );
      }
    }

    goBack() {
      if (this.internStudentId) {
        if (this.application.navigate) {
          this.application.navigate(`/internship/internstudent/edit/${this.internStudentId}`);
        } else {
          window.location.hash = `#internship/internstudent/edit/${this.internStudentId}`;
        }
      } else {
        if (this.application.navigate) {
          this.application.navigate("/internship/internstudent");
        } else {
          window.location.hash = "#internship/internstudent";
        }
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(message, this.application.mainContainer);
      } else {
        const errorDiv = document.createElement("div");
        errorDiv.className = "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
        errorDiv.textContent = message;
        this.application.mainContainer.prepend(errorDiv);
      }
    }
  }

  window.InternStudentSkillCreate = InternStudentSkillCreate;
}
