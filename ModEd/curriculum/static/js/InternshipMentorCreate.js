if (typeof window !== 'undefined' && !window.InternshipMentorCreate) {
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
                <form id="internship-mentor-form" class="form-container">
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

            // Add event listener for form submission
            const form = document.getElementById('internship-mentor-form');
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/curriculum/CreateInternshipMentor', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Success:', result);
                    form.reset();
                } else {
                    throw new Error('Failed to create mentor');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to create mentor. Please try again.');
            }
        }
    }
    window.InternshipMentorCreate = InternshipMentorCreate;
}
