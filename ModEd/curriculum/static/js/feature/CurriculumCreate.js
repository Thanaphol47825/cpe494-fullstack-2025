if (typeof window !== 'undefined' && !window.CurriculumCreate) {
  class CurriculumCreate {
    constructor(application) {
      this.application = application;
    }

    async handleSubmitCurriculum(formData) {

      try {
        console.log("Submitting form data:", formData);
        if (!formData.DepartmentId) {
          alert("Please select a department.");
          return;
        }
        formData.DepartmentId = parseInt(formData.DepartmentId);

        if (formData.ProgramType != 0 && formData.ProgramType != 1) {
          alert("Please select a program type.");
          return;
        }
        formData.ProgramType = parseInt(formData.ProgramType);

        const resp = await fetch(RootURL + "/curriculum/Curriculum/createCurriculum", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await resp.json();
        if (data.isSuccess) {
          alert("Curriculum saved!");
        } else {
          alert("Error: " + (data.result || "Failed to save"));
        }
      } catch (error) {
        alert("Error: " + (error || "Failed to save"));
      }

      return false;
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = ""
      const formElement = await FormTemplate.getForm('CurriculumForm', 'create');
      this.application.templateEngine.mainContainer.appendChild(formElement);

      this.form = new AdvanceFormRender(this.application.templateEngine, {
        modelPath: "curriculum/curriculum",
        targetSelector: "#curriculum-form",
        submitHandler: this.handleSubmitCurriculum.bind(this),

      });

      await this.form.render();
    }


  }

  if (typeof window !== 'undefined') {
    window.CurriculumCreate = CurriculumCreate;
  }
}