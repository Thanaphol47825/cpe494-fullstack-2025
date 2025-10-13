if (typeof window !== "undefined" && !window.InternSkillCreate) {
  class InternSkillCreate {
    constructor(application) {
      this.application = application;
      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || "";
      this.endpoints = {
        create: this.rootURL + "/curriculum/CreateInternSkill",
      };
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = () => window.InternshipPageTemplate ? resolve() : reject(new Error("InternshipPageTemplate failed to load"));
          script.onerror = () => reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    preparePageConfig() {
      return {
        title: "Create Intern Skill",
        description: "Add a new skill to the internship system.",
        showBackButton: true,
        backButtonText: "Back to Skill List",
        backButtonRoute: "/#curriculum/internskill",
        pageClass: "internship-create-page",
        headerClass: "internship-header",
        contentClass: "internship-content",
      };
    }

    async createFormContent() {
      const fieldsHTML = await this.generateFormFields();
      return `
        <form id="intern-skill-form" class="space-y-6">
          <div id="form-fields" class="space-y-4">
            ${fieldsHTML}
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button id="submit-btn" type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Create Intern Skill
            </button>
          </div>
        </form>
      `;
    }

    async generateFormFields() {
      const field = {
        Id: "skill_name",
        Label: "Skill Name",
        Type: "text",
        Name: "skill_name",
         Required: true,
        Placeholder: "Enter Skill Name",
      };

      let inputHTML = "";
      try {
        const template = this.application.template?.Input;
        if (template && window.Mustache) {
          inputHTML = Mustache.render(template, field);
        } else {
          inputHTML = `
            <div class="form-field">
              <label for="${field.Id}" class="block text-sm font-medium text-gray-700 mb-1">${field.Label}</label>
              <input id="${field.Id}" name="${field.Name}" type="text" required placeholder="${field.Placeholder}" class="form-input" />
            </div>
          `;
        }
      } catch (err) {
        console.error("Error creating field:", err);
      }
      return inputHTML;
    }

    setupEventListeners() {
      const backButton = document.querySelector("[data-back-button]");
      if (backButton) backButton.addEventListener("click", (e) => { e.preventDefault(); this.goBack(); });

      const cancelButton = document.getElementById("cancel-btn");
      if (cancelButton) cancelButton.addEventListener("click", (e) => { e.preventDefault(); this.goBack(); });

      const form = document.getElementById("intern-skill-form");
      if (form) form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    goBack() {
      if (this.application.navigate) {
        this.application.navigate("/curriculum/internskill");
      } else {
        window.location.hash = "#/curriculum/internskill";
      }
    }

    async render() {
      console.log("Create Intern Skill Form");
      try {
        await this.loadInternshipPageTemplate();
        this.application.mainContainer.innerHTML = "";

        const pageConfig = this.preparePageConfig();
        const formContent = await this.createFormContent();

        const pageElement = await window.InternshipPageTemplate.render(
          pageConfig,
          formContent,
          this.application
        );

        this.application.mainContainer.appendChild(pageElement);
        this.setupEventListeners();
      } catch (error) {
        console.error("Error rendering InternSkillCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      window.InternshipPageTemplate.showLoading(form, "Creating...");

      try {
        const res = await fetch(this.endpoints.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.isSuccess) throw new Error(result.error || "Failed to create skill");

        window.InternshipPageTemplate.showSuccess("Skill created successfully!", this.application.mainContainer);
        setTimeout(() => form.reset(), 1200);
      } catch (err) {
        window.InternshipPageTemplate.showError(err.message || "Request error", this.application.mainContainer);
      } finally {
        window.InternshipPageTemplate.hideLoading(form, "Create Intern Skill");
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

  window.InternSkillCreate = InternSkillCreate;
}
