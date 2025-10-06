class InternshipCriteriaCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        this.application.mainContainer.innerHTML = '';

        const formWrapper = this.application.create(`
          <div class="bg-gray-100 min-h-screen py-8">
              <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                  Internship Criteria
              </h1>
              <form method="POST" 
                    action="/curriculum/InternshipCriteria/CreateInternshipCriteria"
                    class="form-container">
                  <div id="form-fields"></div>
                  <button type="submit" class="form-submit-btn">
                      Create Criteria
                  </button>
              </form>
          </div>
      `);
        this.application.mainContainer.appendChild(formWrapper);

        const fieldsContainer = document.getElementById('form-fields');

        const fields = [
            { Id: "title", Label: "Title", Type: "text", Name: "title", Required: true, Placeholder: "Enter Criteria Title" },
            { Id: "description", Label: "Description", Type: "text", Name: "description", Required: true, Placeholder: "Enter Description" },
            { Id: "score", Label: "Score", Type: "number", Name: "score", Required: true, Placeholder: "Enter Score" },
            { Id: "internship_application_id", Label: "Internship Application ID", Type: "select", Name: "internship_application_id", Required: true, Placeholder: "Enter Application ID" },
        ];

        fields.forEach(field => {
            let inputHTML = '';

            if (field.Type === "select" && this.application.template && this.application.template.Select) {
                inputHTML = Mustache.render(this.application.template.Select, field);
            }
            else if (this.application.template && this.application.template.Input) {
                inputHTML = Mustache.render(this.application.template.Input, field);
            }

            if (inputHTML) {
                const inputElement = this.application.create(inputHTML);
                fieldsContainer.appendChild(inputElement);
            }
        });
    }
}