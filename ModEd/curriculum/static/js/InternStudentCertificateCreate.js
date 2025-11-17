// curriculum/static/js/InternStudentCertificateCreate.js
if (typeof window !== "undefined" && !window.InternStudentCertificateCreate) {
  class InternStudentCertificateCreate {
    constructor(application, internStudentId = null, internCertificateId = null) {
      this.application = application;
      this.internStudentId = internStudentId;
      this.internCertificateId = internCertificateId;
      this.isEditMode = internCertificateId !== null && internCertificateId !== undefined;

      this.internStudentData = null;
      this.internCertificateData = null;
      this.lookups = { students: [], certificates: [] };

      this.rootURL =
        (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) ||
        "";

      this.endpoints = {
        listStudents: this.rootURL + "/curriculum/InternStudent",
        listCertificates: this.rootURL + "/curriculum/Certificate",
        getOne: (id) => this.rootURL + `/curriculum/InternCertificate/${id}`,
        create: this.rootURL + "/curriculum/CreateInternCertificate",
        update: (id) => this.rootURL + `/curriculum/UpdateInternCertificate/${id}`,
      };

      // -------- ROLE ----------
      const rawRole =
        localStorage.getItem("internstudentcertificate_role") ||
        localStorage.getItem("role") ||
        "student";

      this.userRole = String(rawRole).toLowerCase();
      console.log("[InternStudentCertificateCreate] role =", this.userRole);
    }

    // ===== role helpers =====
    isAdmin() {
      return this.userRole === "admin";
    }
    isStudent() {
      return this.userRole === "student";
    }
    isInstructor() {
      return this.userRole === "instructor";
    }
    canRead() {
      return true;
    }
    canWrite() {
      // Student + Admin = CRUD, Instructor = R
      return this.isAdmin() || this.isStudent();
    }

    // ===== โหลด template กลาง =====
    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src =
          this.rootURL +
          "/curriculum/static/js/template/InternshipPageTemplate.js";
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = () =>
            window.InternshipPageTemplate
              ? resolve()
              : reject(new Error("InternshipPageTemplate failed to load"));
          script.onerror = () =>
            reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    // ===== render หลัก =====
    async render() {
      if (!this.canRead()) {
        alert("Access denied");
        return;
      }

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
        console.error(
          "Error rendering InternStudentCertificateCreate:",
          error
        );
        this.showError("Failed to load form: " + error.message);
      }
    }

    preparePageConfig() {
      const title = this.isEditMode
        ? "Edit Student Certificate"
        : "Add Student Certificate";

      const descName = this.internStudentData
        ? `${this.internStudentData.Student?.first_name || ""} ${
            this.internStudentData.Student?.last_name || ""
          }`.trim()
        : "";
      const description = descName
        ? `For: ${descName}`
        : "Link a student with a certificate, issue date, and certificate number.";

      return {
        title,
        description,
        showBackButton: true,
        backButtonText: "Back",
        backButtonRoute: this.internStudentId
          ? `/#internship/internstudent/edit/${this.internStudentId}`
          : "/#internship/internstudent",
        pageClass: "internship-student-certificate-page",
      };
    }

    // ===== โหลดข้อมูลจาก backend =====
    async loadData() {
      try {
        const [stuRes, certRes] = await Promise.all([
          fetch(this.endpoints.listStudents),
          fetch(this.endpoints.listCertificates),
        ]);
        const stuData = await stuRes.json();
        const certData = await certRes.json();

        if (stuData.isSuccess) this.lookups.students = stuData.result || [];
        if (certData.isSuccess) this.lookups.certificates = certData.result || [];

        if (this.internStudentId) {
          const r = await fetch(
            `${this.rootURL}/curriculum/InternStudent/${this.internStudentId}`
          );
          const d = await r.json();
          if (d.isSuccess) this.internStudentData = d.result;
        }

        if (this.isEditMode && this.internCertificateId) {
          const r = await fetch(this.endpoints.getOne(this.internCertificateId));
          const d = await r.json();
          if (d.isSuccess) {
            this.internCertificateData = d.result;
            console.log("[Load Edit Data]", this.internCertificateData);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        throw error;
      }
    }

    // ===== util =====
    _escape(v) {
      return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, '&quot;');
    }

    _toCertificateOptions(list) {
      return (list || []).map((c) => {
        const id = c?.ID ?? c?.id ?? c?.Id;
        const name = c?.certificate_name ?? c?.name ?? `Certificate #${id}`;
        return { value: String(id), label: name };
      });
    }

    // ===== generate ฟอร์ม =====
    async generateFormFields() {
      const isReadonly = !this.canWrite();

      const studentFullName = this.internStudentData
        ? `${this.internStudentData.Student?.first_name || ""} ${
            this.internStudentData.Student?.last_name || ""
          }`.trim()
        : "";
      const studentIdValue =
        this.internStudentData?.StudentID || 
        this.internStudentData?.student_id ||
        this.internStudentId || "";

      // Student field (locked and hidden)
      const studentFieldHTML = `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Student ${
              studentFullName ? `(${this._escape(studentFullName)})` : ""
            }
          </label>
          <input
            type="text"
            class="form-input bg-gray-100 cursor-not-allowed text-gray-700"
            value="${this._escape(String(studentIdValue))}"
            disabled
            readonly
            tabindex="-1"
          />
          <input
            type="hidden"
            id="student_id"
            name="student_id"
            value="${this._escape(String(studentIdValue))}"
          />
        </div>
      `;

      const certOptions = this._toCertificateOptions(this.lookups.certificates);
      const editCertId = this.internCertificateData?.certificate_id
        ? String(this.internCertificateData.certificate_id)
        : certOptions[0]?.value || "";

      const certificateFieldHTML = `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Certificate <span class="text-red-500">*</span>
          </label>
          <select
            id="certificate_id"
            name="certificate_id"
            class="form-select ${
              isReadonly ? "bg-gray-100 cursor-not-allowed" : ""
            }"
            ${isReadonly ? "disabled" : ""}
            required
          >
            ${certOptions
              .map(
                (o) =>
                  `<option value="${o.value}" ${
                    String(editCertId) === o.value ? "selected" : ""
                  }>${this._escape(o.label)}</option>`
              )
              .join("")}
          </select>
        </div>
      `;

      const certificateNumber =
        this.internCertificateData?.certificate_number || "";
      const certificateNumberFieldHTML = `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Certificate Number <span class="text-red-500">*</span>
          </label>
          <input
            id="certificate_number"
            name="certificate_number"
            type="text"
            class="form-input ${
              isReadonly ? "bg-gray-100 cursor-not-allowed" : ""
            }"
            value="${this._escape(certificateNumber)}"
            placeholder="Enter unique certificate number..."
            ${isReadonly ? "disabled" : ""}
            required
          />
        </div>
      `;

      const dateOfIssue =
        this.internCertificateData?.date_of_issue?.split("T")[0] || "";
      const dateFieldHTML = `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date of Issue <span class="text-red-500">*</span>
          </label>
          <input
            id="date_issue"
            name="date_issue"
            type="date"
            class="form-input ${
              isReadonly ? "bg-gray-100 cursor-not-allowed" : ""
            }"
            value="${this._escape(dateOfIssue)}"
            ${isReadonly ? "disabled" : ""}
            required
          />
        </div>
      `;

      return `
        <form id="intern-student-certificate-form" class="space-y-6">
          <div class="space-y-4">
            ${studentFieldHTML}
            ${certificateFieldHTML}
            ${certificateNumberFieldHTML}
            ${dateFieldHTML}
          </div>
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              id="cancel-btn"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              ${isReadonly ? "Back" : "Cancel"}
            </button>
            ${
              isReadonly
                ? ""
                : `
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              ${this.isEditMode ? "Update" : "Create"} Certificate
            </button>
            `
            }
          </div>
        </form>
      `;
    }

    // ===== event =====
    setupEventListeners() {
      document
        .getElementById("cancel-btn")
        ?.addEventListener("click", () => this.goBack());

      const form = document.getElementById("intern-student-certificate-form");
      if (form && this.canWrite()) {
        form.addEventListener("submit", this.handleSubmit.bind(this));
      }
    }

    // ===== submit =====
    async handleSubmit(e) {
      e.preventDefault();
      if (!this.canWrite()) return;

      const form = e.target;
      const fd = new FormData(form);

      // Validate certificate number
      const certificateNumber = fd.get("certificate_number")?.trim();
      if (!certificateNumber) {
        this.showError("Certificate Number is required.");
        return;
      }

      // Validate date
      const rawDate = fd.get("date_issue");
      if (!rawDate) {
        this.showError("Date of Issue is required.");
        return;
      }

      // Convert date to ISO format
      let dateISO = null;
      try {
        dateISO = new Date(rawDate + "T00:00:00Z").toISOString();
      } catch (err) {
        this.showError("Invalid date format.");
        return;
      }

      // Get student ID
      const studentId = this.internStudentId || fd.get("student_id");
      if (!studentId) {
        this.showError("Student ID is missing.");
        return;
      }

      // Get certificate ID
      const certificateId = fd.get("certificate_id");
      if (!certificateId) {
        this.showError("Certificate is required.");
        return;
      }

      // Build payload
      const payload = {
        intern_student_id: parseInt(studentId, 10),
        certificate_id: parseInt(certificateId, 10),
        certificate_number: certificateNumber,
        date_of_issue: dateISO,
      };

      // Add ID for update mode
      if (this.isEditMode && this.internCertificateId) {
        payload.ID = parseInt(this.internCertificateId, 10);
      }

      console.log("[Submit Payload]", payload);

      const url = this.isEditMode
        ? this.endpoints.update(this.internCertificateId)
        : this.endpoints.create;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = this.isEditMode ? "Updating..." : "Creating...";
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("[Submit Response]", data);

        if (!res.ok || !data.isSuccess) {
          if (data.error && data.error.toLowerCase().includes("duplicate")) {
            throw new Error("Certificate number already exists. Please use a unique number.");
          }
          throw new Error(data.error || data.message || "Failed to save certificate");
        }

        // Show success message
        if (window.InternshipPageTemplate) {
          window.InternshipPageTemplate.showSuccess(
            `Certificate ${this.isEditMode ? "updated" : "created"} successfully!`,
            this.application.mainContainer
          );
        } else {
          alert(`Certificate ${this.isEditMode ? "updated" : "created"} successfully!`);
        }

        setTimeout(() => this.goBack(), 1000);

      } catch (err) {
        console.error("[Submit Error]", err);
        this.showError(err.message || "An error occurred while saving");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    }

    // ===== back & error =====
    goBack() {
      if (this.application.navigate) {
        this.application.navigate(
          `/internship/internstudent/edit/${this.internStudentId}`
        );
      } else {
        window.location.hash = `#internship/internstudent/edit/${this.internStudentId}`;
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(
          message,
          this.application.mainContainer
        );
      } else {
        alert(message);
      }
    }
  }

  window.InternStudentCertificateCreate = InternStudentCertificateCreate;
}