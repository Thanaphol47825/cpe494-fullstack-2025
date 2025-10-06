if (typeof window !== 'undefined' && !window.InternshipReportCreate) {
  class InternshipReportCreate {
    constructor(application) {
      this.application = application;
    }

    async render() {
      console.log("Create Internship Report Form");
      console.log(this.application);

      this.application.mainContainer.innerHTML = '';

      const formWrapper = this.application.create(`
      <div class="bg-gray-100 min-h-screen py-8">
        <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
          Create Internship Report
        </h1>
        <form method="POST" action="/curriculum/CreateInternshipReport" class="form-container">
          <div id="form-fields"></div>
          <button type="submit" class="form-submit-btn">
            Create Report
          </button>
        </form>
      </div>
    `);

      this.application.mainContainer.appendChild(formWrapper);

      const fieldsContainer = document.getElementById('form-fields');

      const fields = [
        { Id: "ReportScore", Label: "Report Score", Type: "number", Name: "ReportScore", Min: 0, Max: 100, Step: 1, Placeholder: "0-100" }

      ];

      fields.forEach(field => {
        if (this.application.template && this.application.template.Input) {
          const inputHTML = Mustache.render(this.application.template.Input, field);
          const inputElement = this.application.create(inputHTML);
          fieldsContainer.appendChild(inputElement);
        }
      });
    }
  }
  window.InternshipReportCreate = InternshipReportCreate;
}