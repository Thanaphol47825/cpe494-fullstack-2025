class InternshipMentorCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        console.log("Create Internship Mentor Form");
        console.log(this.application);

        // Clear the container
        this.application.mainContainer.innerHTML = '';

        // Create form wrapper
        const formWrapper = this.application.create(`
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Create Internship Mentor
                </h1>
                <form method="POST" action="/curriculum/CreateInternshipMentor"
                      class="form-container">
                    <div id="form-fields"></div>
                    <button type="submit" class="form-submit-btn">
                      Create Mentor
                    </button>
                </form>
            </div>
        `);

        this.application.mainContainer.appendChild(formWrapper);

        // Get form fields container
        const fieldsContainer = document.getElementById('form-fields');

        // Add each input field using Mustache templates
        const fields = [
            { Id: "MentorFirstName", Label: "First Name", Type: "text", Name: "MentorFirstName" },
            { Id: "MentorLastName", Label: "Last Name", Type: "text", Name: "MentorLastName" },
            { Id: "MentorEmail", Label: "Email", Type: "email", Name: "MentorEmail" },
            { Id: "MentorPhone", Label: "Phone", Type: "text", Name: "MentorPhone" },
            { Id: "CompanyId", Label: "Company ID", Type: "number", Name: "CompanyId" }
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
