// curriculum/static/js/InternStudentEdit.js
if (typeof window !== 'undefined' && !window.InternStudentEdit) {
  class InternStudentEdit {
    constructor(application, internId) {
      this.application = application;
      this.internId = internId;
      this.internData = null;
      this.students = [];
      this.workExperiences = [];
      this.skills = [];
      this.certificates = [];
      this.projects = [];
      this.template = {
        Main: null,
        InfoCard: null,
        StatusMessage: null,
      };

      // ----- ROLE -----
      const rawRole =
        localStorage.getItem("internstudentedit_role") ||
        localStorage.getItem("role") ||
        "student";

      this.userRole = String(rawRole).toLowerCase();
      console.log("[InternStudentEdit] userRole =", this.userRole);
    }

    // ----- role helpers -----
    isAdmin() {
      return this.userRole === "admin";
    }

    isStudent() {
      return this.userRole === "student";
    }

    isInstructor() {
      return this.userRole === "instructor";
    }

    // Student + Admin = CRUD, Instructor = Read only
    canWriteStudentSkill() {
      return this.isAdmin() || this.isStudent();
    }

    canWriteCertificate() {
      return this.isAdmin() || this.isStudent();
    }

    // ----- template loader -----
    async loadTemplate() {
      const templates = {
        Main: "/curriculum/static/view/InternStudentEditTemplate.tpl",
        InfoCard: "/curriculum/static/view/InfoCardTemplate.tpl",
        StatusMessage: "/curriculum/static/view/StatusMessageTemplate.tpl",
      };

      try {
        await Promise.all(
          Object.entries(templates).map(async ([key, path]) => {
            const response = await fetch(path);
            if (!response.ok) {
              throw new Error(`Failed to load ${key}: ${response.statusText}`);
            }
            this.template[key] = await response.text();
          })
        );
      } catch (err) {
        console.error("Error loading templates:", err);
        throw err;
      }
    }

    // ----- render main page -----
    async render() {
      console.log("Rendering Intern Student Edit Form for ID:", this.internId);

      // global pointer for onclick handlers
      window.internStudentEdit = this;

      // clear container
      this.application.mainContainer.innerHTML = "";

      // load templates + data
      await this.loadTemplate();
      await this.loadData();

      const sections = [
        {
          id: "work-experience",
          title: "Work Experiences",
          emptyMessage: "work experiences",
          singularName: "work experience",
        },
        {
          id: "project",
          title: "Projects",
          emptyMessage: "projects",
          singularName: "project",
        },
        {
          id: "skill",
          title: "Skills",
          emptyMessage: "skills",
          singularName: "skill",
        },
        {
          id: "certificate",
          title: "Certificates",
          emptyMessage: "certificates",
          singularName: "certificate",
        },
      ];

      const sectionsHTML = sections.map((s) => this.renderSection(s)).join("");

      const pageHTML = Mustache.render(this.template.Main, { sectionsHTML });
      const pageWrapper = this.application.create(pageHTML);
      this.application.mainContainer.appendChild(pageWrapper);

      this.setupEventListeners();
      this.populateForm();
    }

    // ----- data loading -----
    async loadData() {
      try {
        const internResponse = await fetch(
          `/curriculum/InternStudent/${this.internId}`
        );
        const internData = await internResponse.json();

        if (!internData.isSuccess) {
          throw new Error(internData.error || "Failed to load intern student");
        }

        this.internData = internData.result;
        this.students = this.internData.Student ? [this.internData.Student] : [];

        await this.loadWorkExperiences();
        await this.loadSkills();
        await this.loadCertificates();
        await this.loadProjects();
      } catch (err) {
        console.error("Error loading data:", err);
        throw err;
      }
    }

    async loadRelatedData(type, endpoint) {
      try {
        const studentId = this.internData.ID;
        if (!studentId) {
          this[type] = [];
          return;
        }

        const response = await fetch(
          `/curriculum/${endpoint}/getByStudentID/${studentId}`
        );
        const data = await response.json();

        if (!data.isSuccess) {
          console.warn(`Failed to load ${type}:`, data.error);
          this[type] = [];
          return;
        }

        this[type] = data.result || [];
      } catch (err) {
        console.error(`Error loading ${type}:`, err);
        this[type] = [];
      }
    }

    async loadWorkExperiences() {
      await this.loadRelatedData("workExperiences", "internWorkExperience");
    }

    async loadSkills() {
      await this.loadRelatedData("skills", "internSkill");
    }

    async loadCertificates() {
      try {
        const studentId = this.internData?.ID;
        if (!studentId) {
          this.certificates = [];
          return;
        }

        const res = await fetch("/curriculum/InternCertificate");
        const data = await res.json();

        if (!data.isSuccess) {
          console.warn("Failed to load certificates:", data.error);
          this.certificates = [];
          return;
        }

        const all = data.result || [];
        this.certificates = all.filter((c) => {
          const sid = c.intern_student_id ?? c.InternStudentId;
          return Number(sid) === Number(studentId);
        });
      } catch (err) {
        console.error("Error loading certificates:", err);
        this.certificates = [];
      }
    }

    async loadProjects() {
      await this.loadRelatedData("projects", "internProject");
    }

    // ----- sections / templates -----
    renderSection({ id, title, emptyMessage, singularName }) {
      if (!this.template.InfoCard) {
        console.error("Section template not loaded");
        return "";
      }

      return Mustache.render(this.template.InfoCard, {
        sectionId: id,
        sectionTitle: title,
        emptyMessage,
        singularName,
      });
    }

    renderStatusMessage(isSuccess, isError) {
      if (!this.template.StatusMessage) {
        console.error("Status message template not loaded");
        return "";
      }

      return Mustache.render(this.template.StatusMessage, {
        isError,
        isSuccess,
      });
    }

    // ----- event listeners -----
    setupEventListeners() {
      const listeners = {
        "back-to-list": () => this.goBackToList(),
        "cancel-btn": () => this.goBackToList(),
        "intern-student-edit-form": (e) => this.handleSubmit(e),
        "add-work-experience-btn": () => this.navigateToCreateWorkExperience(),
        "add-first-experience-btn": () =>
          this.navigateToCreateWorkExperience(),
        "add-project-btn": () => this.navigateToCreateProject(),
        "add-first-project-btn": () => this.navigateToCreateProject(),
        "add-skill-btn": () => this.navigateToCreateSkill(),
        "add-first-skill-btn": () => this.navigateToCreateSkill(),
        "add-certificate-btn": () => this.navigateToCreateCertificate(),
        "add-first-certificate-btn": () =>
          this.navigateToCreateCertificate(),
      };

      // lock Add Skill / Certificate สำหรับ Instructor (อ่านอย่างเดียว)
      if (!this.canWriteStudentSkill()) {
        delete listeners["add-skill-btn"];
        delete listeners["add-first-skill-btn"];
      }
      if (!this.canWriteCertificate()) {
        delete listeners["add-certificate-btn"];
        delete listeners["add-first-certificate-btn"];
      }

      Object.entries(listeners).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (!element) return;
        const event = id === "intern-student-edit-form" ? "submit" : "click";
        element.addEventListener(event, handler);
      });
    }

    // ----- populate form -----
    populateForm() {
      if (!this.internData) {
        this.showError("No intern data available");
        return;
      }

      try {
        if (this.internData.Student) {
          const student = this.internData.Student;
          const studentInfo = {
            "current-student-code": student.student_code || "N/A",
            "current-student-name": `${student.first_name || ""} ${
              student.last_name || ""
            }`.trim() || "N/A",
            "current-student-email": student.email || "N/A",
            "current-student-phone": student.phone || "N/A",
          };

          Object.entries(studentInfo).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
          });
        }

        const statusEl = document.getElementById("intern_status");
        if (statusEl) {
          statusEl.value = this.internData.intern_status || "NOT_STARTED";
        }

        const overviewEl = document.getElementById("overview");
        if (overviewEl) {
          overviewEl.value = this.internData.overview || "";
        }

        // show form sections
        const hideIds = ["loading-form"];
        hideIds.forEach((id) =>
          document.getElementById(id)?.classList.add("hidden")
        );
        [
          "edit-form-container",
          "work-experience-section",
          "project-section",
          "skill-section",
          "certificate-section",
        ].forEach((id) =>
          document.getElementById(id)?.classList.remove("hidden")
        );

        ["WorkExperiences", "Skills", "Certificates", "Projects"].forEach(
          (type) => this[`render${type}`]()
        );

        // ซ่อนปุ่ม Add สำหรับ Instructor
        if (!this.canWriteStudentSkill()) {
          ["add-skill-btn", "add-first-skill-btn"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
          });
        }
        if (!this.canWriteCertificate()) {
          ["add-certificate-btn", "add-first-certificate-btn"].forEach(
            (id) => {
              const el = document.getElementById(id);
              if (el) el.classList.add("hidden");
            }
          );
        }
      } catch (err) {
        console.error("Error populating form:", err);
        this.showError("Failed to populate form data");
      }
    }

    // ----- generic list renderer -----
    renderList(type) {
      const listContainer = document.getElementById(`${type}-list`);
      const emptyState = document.getElementById(`${type}-empty`);
      const items = this[`${type}s`] || [];

      if (!listContainer || !emptyState) return;

      if (!items || items.length === 0) {
        emptyState.classList.remove("hidden");
        // clear old
        const existingItems = listContainer.querySelectorAll(
          `.${type}-item`
        );
        existingItems.forEach((item) => item.remove());
        return;
      }

      emptyState.classList.add("hidden");

      const existingItems = listContainer.querySelectorAll(`.${type}-item`);
      existingItems.forEach((item) => item.remove());

      const creatorFn = this[`create${this.capitalize(type)}Item`];
      if (typeof creatorFn === "function") {
        items.forEach((item) => {
          const element = creatorFn.call(this, item);
          listContainer.appendChild(element);
        });
      }
    }

    capitalize(str) {
      const map = {
        "work-experience": "WorkExperience",
        skill: "Skill",
        certificate: "Certificate",
        project: "Project",
      };
      return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
    }

    renderWorkExperiences() {
      this.renderList("work-experience");
    }

    renderSkills() {
      this.renderList("skill");
    }

    renderCertificates() {
      this.renderList("certificate");
    }

    renderProjects() {
      this.renderList("project");
    }

    // ----- item cards -----
    createItemCard(config) {
      const div = document.createElement("div");
      div.className = `${config.type}-item bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3`;

      const showEdit = config.canEdit !== false;
      const showDelete = config.canDelete === true;

      const actions = [];

      if (showEdit && config.editHandler) {
        actions.push(`
          <button
            type="button"
            onclick="window.internStudentEdit.navigateTo${config.editHandler}(${config.id})"
            class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors mb-1"
          >
            Edit
          </button>
        `);
      }

      if (showDelete && config.deleteHandler) {
        actions.push(`
          <button
            type="button"
            onclick="window.internStudentEdit.${config.deleteHandler}(${config.id})"
            class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            Delete
          </button>
        `);
      }

      div.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="mb-2">
              <h4 class="text-sm font-semibold text-gray-900">
                ${config.title}
              </h4>
              ${
                config.subtitle
                  ? `<p class="text-xs text-gray-600">${config.subtitle}</p>`
                  : ""
              }
              ${
                config.meta
                  ? `<p class="text-xs text-gray-500">${config.meta}</p>`
                  : ""
              }
            </div>
            <div class="text-sm text-gray-700">
              <p class="line-clamp-2">${
                config.description || "No description provided"
              }</p>
            </div>
          </div>
          <div class="ml-4 flex flex-col items-end">
            ${actions.join("")}
          </div>
        </div>
      `;

      return div;
    }

    createWorkExperienceItem(experience) {
      const startDate = experience.start_date
        ? new Date(experience.start_date).toLocaleDateString()
        : "N/A";
      const endDate = experience.end_date
        ? new Date(experience.end_date).toLocaleDateString()
        : "Present";

      return this.createItemCard({
        type: "work-experience",
        id: experience.ID,
        title:
          (experience.Company && experience.Company.company_name) ||
          `Company ID: ${experience.company_id}`,
        subtitle: `${startDate} - ${endDate}`,
        description: experience.detail,
        editHandler: "EditWorkExperience",
        // ยังไม่ได้เปิด delete ให้ WorkExperience (ถ้าต้องการค่อยเพิ่ม pattern เดียวกับ skill/cert)
      });
    }

    createSkillItem(skill) {
      return this.createItemCard({
        type: "skill",
        id: skill.ID,
        title:
          (skill.Skill && skill.Skill.skill_name) || "Unnamed Skill",
        subtitle: `Level: ${skill.level ?? "N/A"}`,
        description: skill.description,
        editHandler: "EditSkill",
        deleteHandler: "deleteSkill",
        canEdit: this.canWriteStudentSkill(),
        canDelete: this.canWriteStudentSkill(),
      });
    }

    createCertificateItem(certificate) {
      const issueDate = certificate.date_of_issue
        ? new Date(certificate.date_of_issue).toLocaleDateString()
        : "N/A";

      const title =
        (certificate.Certificate &&
          certificate.Certificate.certificate_name) ||
        `Certificate #${certificate.ID}`;

      const issuer =
        certificate.Certificate &&
        certificate.Certificate.Company &&
        certificate.Certificate.Company.company_name
          ? certificate.Certificate.Company.company_name
          : "N/A";

      const number = certificate.certificate_number || "N/A";

      return this.createItemCard({
        type: "certificate",
        id: certificate.ID,
        title,
        subtitle: `Issued: ${issueDate}`,
        meta: `Certificate No: ${number} | Company: ${issuer}`,
        description: "",
        editHandler: "EditCertificate",
        deleteHandler: "deleteCertificate",
        canEdit: this.canWriteCertificate(),
        canDelete: this.canWriteCertificate(),
      });
    }

    createProjectItem(project) {
      const startDate = project.start_date
        ? new Date(project.start_date).toLocaleDateString()
        : "N/A";
      const endDate = project.end_date
        ? new Date(project.end_date).toLocaleDateString()
        : "Ongoing";

      return this.createItemCard({
        type: "project",
        id: project.ID,
        title: project.project_name || "Unnamed Project",
        subtitle: `${startDate} - ${endDate}`,
        description: project.project_detail,
        editHandler: "EditProject",
      });
    }

    // ----- navigation helpers -----
    async navigateToForm(config) {
      try {
        // propagate role to sub-modules if needed
        if (config.roleKey && this.userRole) {
          localStorage.setItem(config.roleKey, this.userRole);
        }

        await this.application.fetchModule(config.modulePath);

        const FormClass = window[config.className];
        if (!FormClass) {
          console.error(`${config.className} class not found`);
          this.showError(`Failed to load ${config.formType} form`);
          return;
        }

        const id = config.isEdit
          ? this.internData.StudentID || this.internData.student_id
          : this.internId;

        const formInstance = config.isEdit
          ? new FormClass(this.application, id, config.itemId)
          : new FormClass(this.application, id);

        await formInstance.render();
      } catch (err) {
        console.error(`Error loading ${config.formType} form:`, err);
        this.showError(
          `Failed to load ${config.formType} form: ${err.message}`
        );
      }
    }

    async navigateToCreateWorkExperience() {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternWorkExperienceCreate.js",
        className: "InternWorkExperienceCreate",
        formType: "work experience",
        isEdit: false,
      });
    }

    async navigateToEditWorkExperience(experienceId) {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternWorkExperienceCreate.js",
        className: "InternWorkExperienceCreate",
        formType: "work experience",
        isEdit: true,
        itemId: experienceId,
      });
    }

    async navigateToCreateProject() {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternProjectCreate.js",
        className: "InternProjectCreate",
        formType: "project",
        isEdit: false,
      });
    }

    async navigateToEditProject(projectId) {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternProjectCreate.js",
        className: "InternProjectCreate",
        formType: "project",
        isEdit: true,
        itemId: projectId,
      });
    }

    async navigateToCreateSkill() {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternStudentSkillCreate.js",
        className: "InternStudentSkillCreate",
        formType: "skill",
        isEdit: false,
        roleKey: "internstudentskill_role",
      });
    }

    async navigateToEditSkill(skillId) {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternStudentSkillCreate.js",
        className: "InternStudentSkillCreate",
        formType: "skill",
        isEdit: true,
        itemId: skillId,
        roleKey: "internstudentskill_role",
      });
    }

    async navigateToCreateCertificate() {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternStudentCertificateCreate.js",
        className: "InternStudentCertificateCreate",
        formType: "certificate",
        isEdit: false,
        roleKey: "internstudentcertificate_role",
      });
    }

    async navigateToEditCertificate(certificateId) {
      await this.navigateToForm({
        modulePath: "/curriculum/static/js/InternStudentCertificateCreate.js",
        className: "InternStudentCertificateCreate",
        formType: "certificate",
        isEdit: true,
        itemId: certificateId,
        roleKey: "internstudentcertificate_role",
      });
    }

    // ----- DELETE: Skill / Certificate -----
    async deleteSkill(skillId) {
      if (!this.canWriteStudentSkill()) return;
      if (!window.confirm("Are you sure you want to delete this skill?")) {
        return;
      }

      try {
        const res = await fetch(
          `/curriculum/DeleteInternStudentSkill/${skillId}`,
          {
            method: "POST",
          }
        );
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to delete student skill");
        }

        await this.loadSkills();
        this.renderSkills();
      } catch (err) {
        console.error("Error deleting student skill:", err);
        alert(err.message || "Error deleting student skill");
      }
    }

    async deleteCertificate(certificateId) {
      if (!this.canWriteCertificate()) return;
      if (
        !window.confirm("Are you sure you want to delete this certificate?")
      ) {
        return;
      }

      try {
        const res = await fetch(
          `/curriculum/DeleteInternCertificate/${certificateId}`,
          {
            method: "POST",
          }
        );
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to delete certificate");
        }

        await this.loadCertificates();
        this.renderCertificates();
      } catch (err) {
        console.error("Error deleting certificate:", err);
        alert(err.message || "Error deleting certificate");
      }
    }

    // ----- other helpers -----
    handleStudentChange(event) {
      const selectedId = parseInt(event.target.value, 10);
      const selectedStudent = this.students.find(
        (s) => s.ID === selectedId
      );
      if (!selectedStudent) return;

      const studentInfo = {
        "current-student-code": selectedStudent.student_code || "N/A",
        "current-student-name": `${selectedStudent.first_name || ""} ${
          selectedStudent.last_name || ""
        }`.trim() || "N/A",
        "current-student-email": selectedStudent.email || "N/A",
        "current-student-phone": selectedStudent.phone || "N/A",
      };
      Object.entries(studentInfo).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      });
    }

    async handleSubmit(event) {
      event.preventDefault();

      const updateBtn = document.getElementById("update-btn");
      const updateBtnText = document.getElementById("update-btn-text");
      const updateBtnSpinner =
        document.getElementById("update-btn-spinner");

      this.toggleButtonState(
        updateBtn,
        updateBtnText,
        updateBtnSpinner,
        true
      );

      try {
        const formData = new FormData(event.target);
        const updateData = Object.fromEntries(
          [...formData.entries()].filter(
            ([, value]) => value !== "" && value !== null
          )
        );

        const response = await fetch(
          `/curriculum/UpdateInternStudent/${this.internId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          }
        );

        const result = await response.json();

        if (!result.isSuccess) {
          throw new Error(result.error || "Failed to update intern student");
        }

        this.showSuccess("Intern student updated successfully!");

        await Promise.all([
          this.loadWorkExperiences(),
          this.loadSkills(),
          this.loadCertificates(),
          this.loadProjects(),
        ]);

        ["WorkExperiences", "Skills", "Certificates", "Projects"].forEach(
          (type) => this[`render${type}`]()
        );
      } catch (err) {
        console.error("Error updating intern student:", err);
        this.showError(err.message);
      } finally {
        this.toggleButtonState(
          updateBtn,
          updateBtnText,
          updateBtnSpinner,
          false
        );
      }
    }

    toggleButtonState(btn, textEl, spinnerEl, isLoading) {
      if (!btn || !textEl || !spinnerEl) return;
      btn.disabled = isLoading;
      textEl.textContent = isLoading
        ? "Updating..."
        : "Update Intern Student";
      spinnerEl.classList.toggle("hidden", !isLoading);
    }

    async goBackToList() {
      if (this.application.navigate) {
        this.application.navigate("/internship/internstudent");
      } else {
        window.location.hash = "#internship/internstudent";
      }
    }

    showMessage(message, isSuccess) {
      const statusContainer = document.getElementById("status-container");
      if (statusContainer) {
        statusContainer.innerHTML = this.renderStatusMessage(
          isSuccess,
          !isSuccess
        );
      }

      const messageType = isSuccess ? "success" : "error";
      const messageEl = document.getElementById(`${messageType}-message`);
      const textEl = document.getElementById(`${messageType}-text`);

      if (textEl) textEl.textContent = message;
      if (messageEl) messageEl.classList.remove("hidden");

      const hideIds = isSuccess
        ? ["loading-form", "error-message"]
        : ["loading-form", "success-message"];
      hideIds.forEach((id) =>
        document.getElementById(id)?.classList.add("hidden")
      );
    }

    showError(message) {
      this.showMessage(message, false);
    }

    showSuccess(message) {
      this.showMessage(message, true);
    }

    async showWorkExperienceForm() {
      try {
        await this.application.fetchModule(
          "/curriculum/static/js/InternWorkExperienceCreate.js"
        );
        if (!window.InternWorkExperienceCreate) {
          throw new Error("InternWorkExperienceCreate class not found");
        }
        this.workExpForm = new window.InternWorkExperienceCreate(
          this.application,
          this.internId
        );
        await this.workExpForm.render();
      } catch (err) {
        console.error("Error loading work experience form:", err);
        this.showError("Failed to load work experience form: " + err.message);
      }
    }
  }

  window.InternStudentEdit = InternStudentEdit;
}
