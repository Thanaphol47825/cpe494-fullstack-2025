if (typeof window !== "undefined" && !window.InternshipAttendanceCreate) {
  class InternshipAttendanceCreate {
    constructor(application) {
      this.application = application;
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

    preparePageConfig() {
      return {
        title: "Record Internship Attendance",
        description: "Record daily attendance for intern students",
        showBackButton: true,
        backButtonText: "Back to Attendance",
        backButtonRoute: "/#curriculum/internshipattendance",
        pageClass: "attendance-create-page",
        headerClass: "attendance-header",
        contentClass: "attendance-content",
      };
    }

    async generateFormFields() {
      const fields = [
        {
          Id: "date",
          Label: "Date",
          Type: "date",
          Name: "date",
          Required: true,
        },
        {
          Id: "check_in_time",
          Label: "Check-In Time",
          Type: "time",
          Name: "check_in_time",
          Required: true,
        },
        {
          Id: "check_out_time",
          Label: "Check-Out Time",
          Type: "time",
          Name: "check_out_time",
          Required: true,
        },
        {
          Id: "check_in_status",
          Label: "Check-In Status",
          Type: "select",
          Name: "check_in_status",
          options: [
            { value: "", label: "Select status..." },
            { value: "true", label: "Present" },
            { value: "false", label: "Absent" },
          ],
          Required: true,
        },
        {
          Id: "assing_work",
          Label: "Assigned Work",
          Type: "text",
          Name: "assing_work",
          Placeholder: "Enter assigned work description...",
          Required: false,
        },
        {
          Id: "student_info_id",
          Label: "Student Info ID",
          Type: "number",
          Name: "student_info_id",
          Placeholder: "Enter student info ID...",
          Required: true,
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
          const template = this.application.template[templateName];

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

    async createFormContent() {
      const formFields = await this.generateFormFields();

      return `
        <form id="attendance-form" class="space-y-6">
          <div id="form-fields" class="space-y-4">
            ${formFields}
          </div>
          
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Record Attendance
            </button>
          </div>
        </form>
      `;
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

      const form = document.getElementById("attendance-form");
      if (form) {
        form.addEventListener("submit", this.handleSubmit.bind(this));
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log("Form Data:", data);

      // Validate required fields
      if (
        !data.date ||
        !data.check_in_time ||
        !data.check_out_time ||
        !data.student_info_id ||
        data.check_in_status === ""
      ) {
        console.error("Validation failed:", data);
        alert("Please fill in all required fields");
        return;
      }

      // Convert to proper datetime format
      const jsonData = {
        date: `${data.date}T00:00:00Z`,
        check_in_time: `${data.date}T${data.check_in_time}:00Z`,
        check_out_time: `${data.date}T${data.check_out_time}:00Z`,
        check_in_status: data.check_in_status === "true",
        assing_work: data.assing_work || "",
        student_info_id: parseInt(data.student_info_id) || 0,
      };

      console.log("Submitting:", jsonData);

      try {
        const response = await fetch(
          "/curriculum/InternshipAttendance/CreateInternshipAttendance",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData),
          }
        );

        const result = await response.json();
        console.log("Response:", result);

        if (!response.ok || !result.isSuccess) {
          throw new Error(result.error || "Failed to record attendance");
        }

        alert("Attendance recorded successfully!");
        form.reset();
        setTimeout(() => this.goBackToList(), 1500);
      } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
      }
    }

    async render() {
      console.log("Create Internship Attendance Form");
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
        console.error("Error rendering InternshipAttendanceCreate:", error);
        this.showError("Failed to load form: " + error.message);
      }
    }

    goBackToList() {
      if (this.application.navigate) {
        this.application.navigate("/internshipattendance");
      } else {
        window.location.hash = "#internship/internshipattendance";
      }
    }

    showError(message) {
      if (window.InternshipPageTemplate) {
        window.InternshipPageTemplate.showError(
          message,
          this.application.mainContainer
        );
      } else {
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
        errorDiv.textContent = message;
        this.application.mainContainer.prepend(errorDiv);
      }
    }
  }

  if (typeof window !== "undefined") {
    window.InternshipAttendanceCreate = InternshipAttendanceCreate;
  }
}
