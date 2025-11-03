// Company Edit Feature
if (typeof window !== 'undefined' && !window.CompanyEdit) {
  class CompanyEdit {
    constructor(application, companyId) {
      this.application = application;
      this.companyId = companyId;
      this.companyData = null;
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
      console.log("Edit Company Form");
      try {
        await this.loadInternshipPageTemplate();
        await this.loadCompanyData();

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
        console.error("Error rendering CompanyEdit:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    async loadCompanyData() {
      try {
        const response = await fetch(`/curriculum/company/get/${this.companyId}`);
        const data = await response.json();
        
        if (!data.isSuccess) {
          throw new Error('Failed to fetch company');
        }
        
        this.companyData = data.result;
        console.log('Loaded company data:', this.companyData);
      } catch (error) {
        console.error('Error loading company data:', error);
        throw error;
      }
    }

    preparePageConfig() {
      return {
        title: "Edit Company",
        description: `Update company information: ${this.companyData?.company_name || this.companyData?.CompanyName || this.companyId}`,
        showBackButton: true,
        backButtonText: "Back to Company List",
        backButtonRoute: "/#internship/company",
        pageClass: "company-edit-page",
        headerClass: "company-header",
        contentClass: "company-content",
      };
    }

    async createFormContent() {
      const formFields = await this.generateFormFields();

      // This HTML is now just the form itself, to be injected into the template
      return `
        <form id="company-edit-form" class="space-y-6">
            <div id="form-fields" class="space-y-4">
                ${formFields}
            </div>
            
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Update Company
                </button>
            </div>
        </form>
      `;
    }

    async generateFormFields() {
      const fields = [
        {
          Id: "company_name",
          Label: "Company Name",
          Type: "text",
          Name: "company_name",
          Required: true,
          Placeholder: "Enter Company Name",
          Value: this.companyData?.company_name || this.companyData?.CompanyName || '',
        },
        {
          Id: "company_address",
          Label: "Company Address",
          Type: "text",
          Name: "company_address",
          Placeholder: "Enter company address",
          rows: 3,
          Value: this.companyData?.company_address || this.companyData?.CompanyAddress || '',
        },
      ];

      let fieldsHTML = "";
      fields.forEach((field) => {
        let inputHTML = "";
        try {
          const templateName =
            field.Type === "select"
              ? "Select"
              : field.Type === "textarea"
              ? "Textarea"
              : "Input";
          const template = this.application.templateEngine.template[templateName];

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

      const form = document.getElementById("company-edit-form");
      if (form) {
        form.addEventListener("submit", this.handleSubmit.bind(this));
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const jsonData = Object.fromEntries(formData.entries());

      window.InternshipPageTemplate.showLoading(form, "Updating...");

      try {
        const response = await fetch(`/curriculum/company/update/${this.companyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to update company");
        }

        window.InternshipPageTemplate.showSuccess(
          "Company updated successfully!",
          this.application.templateEngine.mainContainer
        );
        setTimeout(() => {
          window.location.hash = "#internship/company";
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        window.InternshipPageTemplate.showError(
          error.message,
          this.application.templateEngine.mainContainer
        );
      } finally {
        window.InternshipPageTemplate.hideLoading(form, "Update Company");
      }
    }

    goBackToList() {
      if (this.application.navigate) {
        this.application.navigate("/company");
      } else {
        window.location.hash = "#internship/company";
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
    window.CompanyEdit = CompanyEdit;
  }
}