// curriculum/static/js/module/InternStudentCertificateCreate.js
if (typeof window !== "undefined" && !window.InternStudentCertificateCreate) {
  class InternStudentCertificateCreate {
    constructor(application, internStudentId = null, internCertificateId = null) {
      this.application = application;
      this.internStudentId = internStudentId;
      this.internCertificateId = internCertificateId;
      this.isEditMode = internCertificateId !== null;

      this.internStudentData = null;
      this.internCertificateData = null;
      this.lookups = { students: [], certificates: [] };

      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || "";
      this.endpoints = {
        listStudents: this.rootURL + "/curriculum/InternStudent",
        listCertificates: this.rootURL + "/curriculum/Certificate",
        getOne: (id) => this.rootURL + `/curriculum/InternCertificate/${id}`,
        create: this.rootURL + "/curriculum/CreateInternCertificate",
        update: (id) => this.rootURL + `/curriculum/UpdateInternCertificate/${id}`,
      };
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        const root = this.rootURL || "";
        script.src = root + "/curriculum/static/js/template/InternshipPageTemplate.js";
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = () =>
            window.InternshipPageTemplate
              ? resolve()
              : reject(new Error("InternshipPageTemplate failed to load"));
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
        console.error("Error rendering InternStudentCertificateCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    preparePageConfig() {
      const title = this.isEditMode ? "Edit Student Certificate" : "Add Student Certificate";
      const descName = this.internStudentData
        ? `${this.internStudentData.Student?.first_name || ""} ${this.internStudentData.Student?.last_name || ""}`.trim()
        : "";
      const description = descName ? `For: ${descName}` : "Add certificate record for intern student.";
      return {
        title,
        description,
        showBackButton: true,
        backButtonText: "Back",
        backButtonRoute: this.internStudentId
          ? `/#internship/internstudent/edit/${this.internStudentId}`
          : "/#internship/internstudent",
      };
    }

    async loadData() {
      const [stuRes, certRes] = await Promise.all([
        fetch(this.endpoints.listStudents),
        fetch(this.endpoints.listCertificates),
      ]);
      const stuData = await stuRes.json();
      const certData = await certRes.json();

      if (stuData.isSuccess) this.lookups.students = stuData.result;
      if (certData.isSuccess) this.lookups.certificates = certData.result;

      if (this.internStudentId) {
        const internResponse = await fetch(`/curriculum/InternStudent/${this.internStudentId}`);
        const internData = await internResponse.json();
        if (internData.isSuccess) this.internStudentData = internData.result;
      }

      if (this.isEditMode && this.internCertificateId) {
        const certRes = await fetch(this.endpoints.getOne(this.internCertificateId));
        const certData = await certRes.json();
        if (certData.isSuccess) this.internCertificateData = certData.result;
      }
    }

    _escape(v) {
      return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    async generateFormFields() {
      const student = this.internStudentData?.Student || {};
      const studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim();

      const certificateOptions = this.lookups.certificates
        .map((c) => {
          const id = c.ID || c.id;
          const name = c.certificate_name || c.name || `Certificate #${id}`;
          return `<option value="${id}" ${
            this.internCertificateData?.certificate_id == id ? "selected" : ""
          }>${name}</option>`;
        })
        .join("");

      const certificateNumber =
        this.internCertificateData?.certificate_number || "";
      const dateOfIssue =
        this.internCertificateData?.date_of_issue?.split("T")[0] || "";

      return `
        <form id="intern-student-certificate-form" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <input type="text" class="form-input bg-gray-100 text-gray-700" value="${this._escape(
                studentName
              )}" readonly />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
              <select id="certificate_id" name="certificate_id" class="form-select" required>
                ${certificateOptions}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
              <input id="certificate_number" name="certificate_number" type="text" class="form-input" value="${this._escape(
                certificateNumber
              )}" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
              <input id="date_issue" name="date_issue" type="date" class="form-input" value="${this._escape(
                dateOfIssue
              )}" required />
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancel-btn"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              class="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              ${this.isEditMode ? "Update" : "Create"} Certificate
            </button>
          </div>
        </form>
      `;
    }

    setupEventListeners() {
      document
        .getElementById("cancel-btn")
        ?.addEventListener("click", () => this.goBack());
      document
        .getElementById("intern-student-certificate-form")
        ?.addEventListener("submit", this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
      e.preventDefault();
      const fd = new FormData(e.target);

      const payload = {
        intern_student_id: parseInt(this.internStudentId, 10),
        certificate_id: parseInt(fd.get("certificate_id"), 10),
        certificate_number: fd.get("certificate_number"),
        date_of_issue: fd.get("date_issue"),
      };

      const url = this.isEditMode
        ? this.endpoints.update(this.internCertificateId)
        : this.endpoints.create;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!data.isSuccess) throw new Error(data.error || "Save failed");

        window.InternshipPageTemplate.showSuccess(
          `Certificate ${this.isEditMode ? "updated" : "created"} successfully!`,
          this.application.mainContainer
        );
        setTimeout(() => this.goBack(), 1000);
      } catch (err) {
        this.showError(err.message);
      }
    }

    goBack() {
      if (this.application.navigate) {
        this.application.navigate(`/internship/internstudent/edit/${this.internStudentId}`);
      } else {
        window.location.hash = `#internship/internstudent/edit/${this.internStudentId}`;
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(message, this.application.mainContainer);
      } else {
        alert(message);
      }
    }
  }

  window.InternStudentCertificateCreate = InternStudentCertificateCreate;
}
