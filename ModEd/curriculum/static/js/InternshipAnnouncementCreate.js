// curriculum/static/js/InternshipAnnouncementCreate.js
if (typeof window !== "undefined" && !window.InternshipAnnouncementCreate) {
  class InternshipAnnouncementCreate {
    constructor(application) {
      this.application = application;
      this.rootURL =
        (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || "";
      this.endpoints = {
        create: this.rootURL + "/curriculum/CreateInternshipAnnouncement",
      };
    }

    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
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

    preparePageConfig() {
      return {
        title: "Create Internship Announcement",
        description: "Publish a new internship announcement.",
        showBackButton: true,
        backButtonText: "Back to Announcements",
        backButtonRoute: "/#curriculum/internshipannouncement",
        pageClass: "internship-create-page",
        headerClass: "internship-header",
        contentClass: "internship-content",
      };
    }

    async render() {
      console.log("Create Internship Announcement Form");
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
        console.error("Error rendering InternshipAnnouncementCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    async createFormContent() {
      const fieldsHTML = await this.generateFormFields();
      return `
        <form id="internship-announcement-form" class="space-y-6">
          <div id="form-fields" class="space-y-4">
            ${fieldsHTML}
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancel-btn"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button id="submit-btn" type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Create Announcement
            </button>
          </div>
        </form>
      `;
    }

    /**
     * Render inputs via Mustache template if provided (this.application.template?.Input),
     * otherwise fallback to basic HTML.
     */
    async generateFormFields() {
      const items = [
        {
          Id: "topic",
          Label: "Topic",
          Type: "text",
          Name: "topic",
          Required: true,
          Placeholder: "Enter announcement topic",
        },
        {
          Id: "description",
          Label: "Description",
          Type: "textarea",
          Name: "description",
          Required: false,
          Placeholder: "Add details about the announcement",
          Rows: 4,
        },
        {
          Id: "date_start",
          Label: "Start Date",
          Type: "date",
          Name: "date_start",
          Required: true,
        },
        {
          Id: "date_end",
          Label: "End Date",
          Type: "date",
          Name: "date_end",
          Required: true,
        },
        {
          Id: "author_id",
          Label: "Author ID",
          Type: "number",
          Name: "author_id",
          Required: true,
          Placeholder: "Enter author id (number)",
          Min: 1,
        },
      ];

      const parts = await Promise.all(items.map((f) => this.renderField(f)));
      return parts.join("\n");
    }

    renderField(field) {
      try {
        const template = this.application.template?.Input;
        if (template && window.Mustache && field.Type !== "textarea") {
          // Use shared Input template for standard inputs
          return Promise.resolve(Mustache.render(template, field));
        }
      } catch (err) {
        console.error("Error using Input template:", err);
      }

      // Fallback HTML
      const requiredAttr = field.Required ? "required" : "";
      const common =
        'class="form-input w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"';

      if (field.Type === "textarea") {
        const rows = field.Rows || 4;
        return Promise.resolve(`
          <div class="form-field">
            <label for="${field.Id}" class="block text-sm font-medium text-gray-700 mb-1">
              ${field.Label}${field.Required ? ' <span class="text-red-500">*</span>' : ""}
            </label>
            <textarea id="${field.Id}" name="${field.Name}" rows="${rows}" ${requiredAttr}
              placeholder="${field.Placeholder || ""}"
              ${common}></textarea>
          </div>
        `);
      }

      const min = field.Min != null ? `min="${field.Min}"` : "";
      return Promise.resolve(`
        <div class="form-field">
          <label for="${field.Id}" class="block text-sm font-medium text-gray-700 mb-1">
            ${field.Label}${field.Required ? ' <span class="text-red-500">*</span>' : ""}
          </label>
          <input id="${field.Id}" name="${field.Name}" type="${field.Type}" ${requiredAttr}
            placeholder="${field.Placeholder || ""}" ${min} ${common} />
        </div>
      `);
    }

    setupEventListeners() {
      const backButton = document.querySelector("[data-back-button]");
      if (backButton)
        backButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goBack();
        });

      const cancelButton = document.getElementById("cancel-btn");
      if (cancelButton)
        cancelButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goBack();
        });

      const form = document.getElementById("internship-announcement-form");
      if (form) form.addEventListener("submit", this.handleSubmit.bind(this));

      // UX: enforce date_end >= date_start on client-side
      const dateStart = document.getElementById("date_start");
      const dateEnd = document.getElementById("date_end");
      if (dateStart && dateEnd) {
        dateStart.addEventListener("change", () => {
          if (dateStart.value) dateEnd.min = dateStart.value;
        });
      }
    }

    goBack() {
      if (this.application.navigate) {
        this.application.navigate("/curriculum/internshipannouncement");
      } else {
        window.location.hash = "#/curriculum/internshipannouncement";
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      const form = event.target;

      // Collect & normalize payload names to match backend JSON tags
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Extra client-side checks
      if (!payload.topic || !payload.date_start || !payload.date_end || !payload.author_id) {
        this.showError("Please fill in all required fields.");
        return;
      }

      // Convert author_id to number
      payload.author_id = Number(payload.author_id);

      window.InternshipPageTemplate.showLoading(form, "Creating...");

      try {
        const res = await fetch(this.endpoints.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to create announcement");
        }

        window.InternshipPageTemplate.showSuccess(
          "Announcement created successfully!",
          this.application.mainContainer
        );
        setTimeout(() => form.reset(), 900);
      } catch (err) {
        window.InternshipPageTemplate.showError(
          err.message || "Request error",
          this.application.mainContainer
        );
      } finally {
        window.InternshipPageTemplate.hideLoading(form, "Create Announcement");
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(message, this.application.mainContainer);
      } else {
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
        errorDiv.textContent = message;
        this.application.mainContainer.prepend(errorDiv);
      }
    }
  }

  window.InternshipAnnouncementCreate = InternshipAnnouncementCreate;
}