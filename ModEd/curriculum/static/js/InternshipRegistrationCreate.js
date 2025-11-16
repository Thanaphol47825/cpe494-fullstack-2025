if (typeof window !== "undefined" && !window.InternshipRegistrationCreate) {
  class InternshipRegistrationCreate {
    constructor(application) {
      this.application = application;
      this.userRole = localStorage.getItem('role') || 'Student';
      this.currentUserId = parseInt(localStorage.getItem('userId')) || null;
      this.approvalStatusOptions = []; // Will be loaded from API
    }

    async loadApprovalStatusOptions() {
      try {
        const response = await fetch('/curriculum/approvedStatus/options');
        const data = await response.json();
        
        if (data.isSuccess) {
          this.approvalStatusOptions = data.result;
        } else {
          console.error('Failed to load approval status options');
          // Fallback to hardcoded values
          this.approvalStatusOptions = [
            { label: "Not Started", value: "Not Started" },
            { label: "In Progress", value: "In Progress" },
            { label: "Approved", value: "Approved" },
            { label: "Rejected", value: "Rejected" }
          ];
        }
      } catch (error) {
        console.error('Error loading approval status options:', error);
        // Fallback to hardcoded values
        this.approvalStatusOptions = [
          { label: "Not Started", value: "Not Started" },
          { label: "In Progress", value: "In Progress" },
          { label: "Approved", value: "Approved" },
          { label: "Rejected", value: "Rejected" }
        ];
      }
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = () => {
            if (window.InternshipPageTemplate) {
              resolve();
            } else {
              reject(new Error("InternshipPageTemplate failed to load"));
            }
          };
          script.onerror = () =>
            reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    async render() {
      console.log("Create Internship Registration Form");
      
      // Check role permissions
      if (this.userRole === 'Instructor') {
        this.showError('Access Denied: Instructors can only view registrations, not create them.');
        setTimeout(() => {
          window.location.hash = '#internship/internshipregistration';
        }, 2000);
        return;
      }
      
      try {
        await this.loadInternshipPageTemplate();
        await this.loadApprovalStatusOptions(); // Load options from API

        this.application.templateEngine.mainContainer.innerHTML = "";

        const pageConfig = this.preparePageConfig();
        const formContent = await this.createFormContent();

        // Use the template to render the entire page structure
        const pageElement = await window.InternshipPageTemplate.render(
          pageConfig,
          formContent,
          this.application.templateEngine
        );

        this.application.templateEngine.mainContainer.appendChild(pageElement);

        this.setupEventListeners();
      } catch (error) {
        console.error("Error rendering InternshipRegistrationCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    preparePageConfig() {
      return {
        title: "Create New Internship Registration",
        description: "Register a new student internship application.",
        showBackButton: true,
        backButtonText: "Back to Registration List",
        backButtonRoute: "/#internship/internshipregistration",
        pageClass: "registration-create-page",
        headerClass: "registration-header",
        contentClass: "registration-content",
      };
    }

    async createFormContent() {
      const formFields = await this.generateFormFields();

      // This HTML is now just the form itself, to be injected into the template
      return `
        <form id="registration-form" class="space-y-6">
            <div id="form-fields" class="space-y-4">
                ${formFields}
            </div>
            
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Create Registration
                </button>
            </div>
        </form>
      `;
    }

    async generateFormFields() {
      const fields = [
        {
          Id: "student_id",
          Label: "Student ID",
          Type: "number",
          Name: "student_id",
          Required: true,
          Placeholder: "Enter Student ID",
          Value: this.userRole === 'Student' ? this.currentUserId : '',
          Readonly: this.userRole === 'Student' ? true : false, // Students can't change their own ID
        },
        {
          Id: "company_id",
          Label: "Company ID",
          Type: "number",
          Name: "company_id",
          Required: true,
          Placeholder: "Enter Company ID",
        },
        {
          Id: "turnin_date",
          Label: "Turn-in Date",
          Type: "date",
          Name: "turnin_date",
          Required: true,
        },
        {
          Id: "approval_university_status",
          Label: "University Approval Status",
          Type: this.userRole === 'Student' ? "text" : "select",
          Name: "approval_university_status",
          Required: true,
          Value: this.userRole === 'Student' ? 'In Progress' : '',
          Readonly: this.userRole === 'Student' ? true : false,
          data: this.approvalStatusOptions
        },
        {
          Id: "approval_company_status",
          Label: "Company Approval Status",
          Type: this.userRole === 'Student' ? "text" : "select",
          Name: "approval_company_status",
          Required: true,
          Value: this.userRole === 'Student' ? 'In Progress' : '',
          Readonly: this.userRole === 'Student' ? true : false,
          data: this.approvalStatusOptions
        },
      ];

      let fieldsHTML = "";
      fields.forEach((field) => {
        let inputHTML = "";
        try {
          const templateName =
            field.Type === "select"
              ? "SelectInput"
              : field.Type === "textarea"
              ? "TextareaInput"
              : "Input";
          const template =
            this.application.templateEngine.template[templateName];

          // For select fields, rename 'data' to 'options' for the template
          if (field.Type === "select" && field.data) {
            field.options = field.data;
          }

          if (template) {
            inputHTML = Mustache.render(template, field);
          }

          if (inputHTML) {
            fieldsHTML += `<div class="form-field">${inputHTML}</div>`;
          }
        } catch (error) {
          console.error("Error creating field:", field.Label, error);
        }
      });
      return fieldsHTML;
    }

    setupEventListeners() {
      const backButton = document.querySelector("[data-back-button]");
      if (backButton) {
        backButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goBackToList();
        });
      }

      const cancelButton = document.getElementById("cancel-btn");
      if (cancelButton) {
        cancelButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goBackToList();
        });
      }

      const form = document.getElementById("registration-form");
      if (form) {
        form.addEventListener("submit", this.handleSubmit.bind(this));
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const jsonData = Object.fromEntries(formData.entries());

      // Convert to proper format
      jsonData.student_id = parseInt(jsonData.student_id);
      jsonData.company_id = parseInt(jsonData.company_id);
      jsonData.turnin_date = new Date(jsonData.turnin_date).toISOString();
      
      // For Students, always set approval status to 'In Progress'
      if (this.userRole === 'Student') {
        jsonData.approval_university_status = 'In Progress';
        jsonData.approval_company_status = 'In Progress';
      }

      window.InternshipPageTemplate.showLoading(form, "Creating...");

      try {
        const response = await fetch("/curriculum/internshipRegistration/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to create registration");
        }

        window.InternshipPageTemplate.showSuccess(
          "Registration created successfully!",
          this.application.templateEngine.mainContainer
        );
        setTimeout(() => form.reset(), 2000);
      } catch (error) {
        console.error("Error:", error);
        window.InternshipPageTemplate.showError(
          error.message,
          this.application.templateEngine.mainContainer
        );
      } finally {
        window.InternshipPageTemplate.hideLoading(form, "Create Registration");
      }
    }

    goBackToList() {
      if (this.application.navigate) {
        this.application.navigate("/internshipregistration");
      } else {
        window.location.hash = "#internship/internshipregistration";
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(
          message,
          this.application.templateEngine.mainContainer
        );
      } else {
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
        errorDiv.textContent = message;
        this.application.templateEngine.mainContainer.prepend(errorDiv);
      }
    }
  }

  if (typeof window !== "undefined") {
    window.InternshipRegistrationCreate = InternshipRegistrationCreate;
  }
}
