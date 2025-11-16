if (typeof window !== 'undefined' && !window.InternshipRegistrationEdit) {
  class InternshipRegistrationEdit {
    constructor(application, registrationId) {
      this.application = application;
      this.registrationId = registrationId;
      this.registrationData = null;
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
      console.log("Edit Internship Registration Form");
      try {
        await this.loadInternshipPageTemplate();
        await this.loadApprovalStatusOptions(); // Load options from API
        await this.loadRegistrationData();

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
        console.error("Error rendering InternshipRegistrationEdit:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    async loadRegistrationData() {
      try {
        const response = await fetch(`/curriculum/internshipRegistration/get/${this.registrationId}`);
        const data = await response.json();
        
        if (!data.isSuccess) {
          throw new Error('Failed to fetch registration');
        }
        
        this.registrationData = data.result;
        console.log('Loaded registration data:', this.registrationData);
        
        // Check permissions after loading data
        if (this.userRole === 'Instructor') {
          throw new Error('Access Denied: Instructors can only view registrations, not edit them.');
        }
        
        if (this.userRole === 'Student') {
          const registrationStudentId = this.registrationData.StudentId || this.registrationData.student_id;
          if (registrationStudentId !== this.currentUserId) {
            throw new Error('Access Denied: You can only edit your own registrations.');
          }
        }
        
      } catch (error) {
        console.error('Error loading registration data:', error);
        throw error;
      }
    }

    preparePageConfig() {
      const studentName = this.registrationData?.Student?.Student?.first_name && this.registrationData?.Student?.Student?.last_name
        ? `${this.registrationData.Student.Student.first_name} ${this.registrationData.Student.Student.last_name}`
        : `ID: ${this.registrationId}`;
      
      return {
        title: "Edit Internship Registration",
        description: `Update registration information for: ${studentName}`,
        showBackButton: true,
        backButtonText: "Back to Registration List",
        backButtonRoute: "/#internship/internshipregistration",
        pageClass: "registration-edit-page",
        headerClass: "registration-header",
        contentClass: "registration-content",
      };
    }

    async createFormContent() {
      const formFields = await this.generateFormFields();

      // This HTML is now just the form itself, to be injected into the template
      return `
        <form id="registration-edit-form" class="space-y-6">
            <div id="form-fields" class="space-y-4">
                ${formFields}
            </div>
            
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Update Registration
                </button>
            </div>
        </form>
      `;
    }

    async generateFormFields() {
      // Format the date for input type="date"
      const turninDate = this.registrationData?.turnin_date 
        ? new Date(this.registrationData.turnin_date).toISOString().split('T')[0]
        : '';

      const fields = [
        {
          Id: "student_id",
          Label: "Student ID",
          Type: "number",
          Name: "student_id",
          Required: true,
          Placeholder: "Enter Student ID",
          Value: this.registrationData?.student_id || this.registrationData?.StudentId || '',
          Readonly: this.userRole === 'Student' ? true : false, // Students can't change their own ID
        },
        {
          Id: "company_id",
          Label: "Company ID",
          Type: "number",
          Name: "company_id",
          Required: true,
          Placeholder: "Enter Company ID",
          Value: this.registrationData?.company_id || this.registrationData?.CompanyId || '',
        },
        {
          Id: "turnin_date",
          Label: "Turn-in Date",
          Type: "date",
          Name: "turnin_date",
          Required: true,
          Value: turninDate,
        },
        {
          Id: "approval_university_status",
          Label: "University Approval Status",
          Type: this.userRole === 'Student' ? "text" : "select",
          Name: "approval_university_status",
          Required: true,
          Value: this.registrationData?.approval_university_status || 'Not Started',
          Readonly: this.userRole === 'Student' ? true : false,
          data: this.approvalStatusOptions
        },
        {
          Id: "approval_company_status",
          Label: "Company Approval Status",
          Type: this.userRole === 'Student' ? "text" : "select",
          Name: "approval_company_status",
          Required: true,
          Value: this.registrationData?.approval_company_status || 'Not Started',
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
          const template = this.application.templateEngine.template[templateName];

          // For select fields, rename 'data' to 'options' and mark selected option
          if (field.Type === "select" && field.data) {
            field.options = field.data.map(option => ({
              ...option,
              selected: option.value === field.Value
            }));
          }

          console.log(`Rendering field ${field.Name}:`, field);

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
          if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            this.goBackToList();
          }
        });
      }

      const form = document.getElementById("registration-edit-form");
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
      
      // For Students, preserve existing approval status (don't send changes)
      if (this.userRole === 'Student') {
        jsonData.approval_university_status = this.registrationData.approval_university_status;
        jsonData.approval_company_status = this.registrationData.approval_company_status;
      }

      window.InternshipPageTemplate.showLoading(form, "Updating...");

      try {
        const response = await fetch(`/curriculum/internshipRegistration/update/${this.registrationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to update registration");
        }

        window.InternshipPageTemplate.showSuccess(
          "Registration updated successfully!",
          this.application.templateEngine.mainContainer
        );
        setTimeout(() => {
          window.location.hash = "#internship/internshipregistration";
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        window.InternshipPageTemplate.showError(
          error.message,
          this.application.templateEngine.mainContainer
        );
      } finally {
        window.InternshipPageTemplate.hideLoading(form, "Update Registration");
      }
    }

    goBackToList() {
      if (this.application.navigate) {
        this.application.navigate("/registration");
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
    window.InternshipRegistrationEdit = InternshipRegistrationEdit;
  }
}
