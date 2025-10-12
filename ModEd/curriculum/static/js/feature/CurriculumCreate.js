if (typeof window !== 'undefined' && !window.CurriculumCreate) {
  class CurriculumCreate {
    constructor(application) {
      this.application = application;
    }

    async render() {
      this.application.mainContainer.innerHTML = ""
      const formWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                        Curriculum
                    </h1>
                    <form method="POST" id="curriculum-form">
                        <div id="form-fields"></div>
                        <button type="submit" class="form-submit-btn">
                            Create Curriculum
                        </button>
                    </form>
                    <div style="margin-top: 20px;">
                        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
      this.application.mainContainer.appendChild(formWrapper);

      this.form = new AdvanceFormRender(this.application, {
        modelPath: "curriculum/curriculum",
        targetSelector: "#curriculum-form",
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
        if (!formData.DepartmentId) {
          alert("Please select a department.");
          return;
        }
        formData.DepartmentId = parseInt(formData.DepartmentId);

        formData.ProgramType = 1
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
  }

  if (typeof window !== 'undefined') {
    window.CurriculumCreate = CurriculumCreate;
  }
}