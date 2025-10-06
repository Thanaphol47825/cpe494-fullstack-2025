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
        <form id="internship-report-form" class="form-container">
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

      const form = document.getElementById('internship-report-form');
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
      event.preventDefault();
      
      const form = event.target;
      const formData = new FormData(form);
      
      try {
        const response = await fetch('/curriculum/CreateInternshipReport', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Success:', result);
          form.reset();
        } else {
          throw new Error('Failed to create report');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to create report. Please try again.');
      }
    }
  }
  window.InternshipReportCreate = InternshipReportCreate;
}