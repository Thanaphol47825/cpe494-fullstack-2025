if (typeof window !== 'undefined' && !window.ClassCreate) {
  class ClassCreate {
    constructor(application) {
      this.application = application;
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = ""
      const formElement = await FormTemplate.getForm('ClassForm', 'create');
      this.application.templateEngine.mainContainer.appendChild(formElement);

      this.form = new AdvanceFormRender(this.application.templateEngine, {
        modelPath: "curriculum/Class",
        targetSelector: "#class-form",
        submitHandler: async (formData) => {
          console.log("Form submitted:", formData);
          await this.handleSubmit(formData);
        }

      });

      await this.form.render();
    }

    async handleSubmit(formData) {

      try {
        console.log("Submitting form data:", formData);
        if (!formData.CourseId) {
          alert("Please select a course.");
          return;
        }
        formData.CourseId = parseInt(formData.CourseId);
        formData.Section = parseInt(formData.Section);
        
        // Convert datetime-local to ISO string if Schedule exists
        if (formData.Schedule) {
          formData.Schedule = new Date(formData.Schedule).toISOString();
        }

        const resp = await fetch(RootURL + "/curriculum/Class/createClass", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Class saved!");
          // Redirect to class list page
          window.location.hash = "#curriculum/class";
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }
  }

  if (typeof window !== 'undefined') {
    window.ClassCreate = ClassCreate;
  }
}
