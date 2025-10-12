if (typeof window !== 'undefined' && !window.InternWorkExperienceCreate) {
    class InternWorkExperienceCreate {
        constructor(application) {
            this.application = application;
        }

        async render() {
            console.log("Create Intern Work Experience Form");
            console.log(this.application);

            this.application.mainContainer.innerHTML = '';

            const formWrapper = this.application.create(`
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Create Intern Work Experience Form
                </h1>
                <form id="internWorkExperienceForm" class="form-container">
                    <div id="form-fields"></div>
                    <button type="submit" class="form-submit-btn">
                      Create Intern Work Experience
                    </button>
                </form>
                <div id="response-message" class="mt-4 hidden"></div> 
            </div>
        `
            );

            this.application.mainContainer.appendChild(formWrapper)

            const fieldsContainer = document.getElementById('form-fields');
            const form = document.getElementById('internWorkExperienceForm');

            const fields = [
                { Id: "student_id", Label: "Student ID", Type: "number", Name: "student_id" },
                { Id: "company_id", Label: "Company ID", Type: "number", Name: "company_id" },
                { Id: "detail", Label: "Detail", Type: "text", Name: "detail" },
                { Id: "start_date", Label: "Start Date", Type: "date", Name: "start_date" },
                { Id: "end_date", Label: "End Date", Type: "date", Name: "end_date" }
            ];

            fields.forEach(field => {
                if (this.application.template && this.application.template.Input) {
                    const inputHTML = Mustache.render(this.application.template.Input, field);
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        async handleFormSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);
            const responseDiv = document.getElementById('response-message');

            const jsonData = {};
            formData.forEach((value, key) => {
                console.log(key + ' : ' + value);
                if (key === 'student_id' || key === 'company_id') {
                    jsonData[key] = parseInt(value, 10);
                }
                else if((key === 'start_date' || key === 'end_date') && value){
                    jsonData[key] = new Date(value + 'T00:00:00Z').toISOString();
                } else {
                    jsonData[key] = value;
                }
            });

            console.log(jsonData);

            console.log(JSON.stringify(jsonData));

            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating...';
                submitBtn.disabled = true;

                const response = await fetch('/curriculum/internWorkExperience/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                // Handle response
                if (response.ok && result.isSuccess) {
                    this.showMessage('Intern Work Experience created successfully!', 'success');
                    form.reset(); // Clear form
                } else {
                    this.showMessage(result.error || 'Failed to create Intern Work Experience', 'error');
                }

                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                console.error('Error:', error);
                this.showMessage('Network error occurred', 'error');

                // Restore button
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Create Intern Work Experience';
                submitBtn.disabled = false;
            }

        }

        showMessage(message, type) {
            const responseDiv = document.getElementById('response-message');
            responseDiv.className = `mt-4 p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
            responseDiv.textContent = message;
            responseDiv.classList.remove('hidden');

            // Hide message after 5 seconds
            setTimeout(() => {
                responseDiv.classList.add('hidden');
            }, 5000);
        }
    }
    window.InternWorkExperienceCreate = InternWorkExperienceCreate;
}