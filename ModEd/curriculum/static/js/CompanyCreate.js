if (typeof window !== 'undefined' && !window.CompanyCreate) {
    class CompanyCreate {
        constructor(application) {
            this.application = application;
        }

        async render() {
            console.log("Create Company Form");
            console.log(this.application);

            this.application.mainContainer.innerHTML = '';

            const formWrapper = this.application.create(`
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Create Company Form
                </h1>
                <form id="companyForm" class="form-container">
                    <div id="form-fields"></div>
                    <button type="submit" class="form-submit-btn">
                      Create Company and other things
                    </button>
                </form>
                <div id="response-message" class="mt-4 hidden"></div> 
            </div>
        `
            );

            this.application.mainContainer.appendChild(formWrapper)

            const fieldsContainer = document.getElementById('form-fields');
            const form = document.getElementById('companyForm');

            const fields = [
                { Id: "company_name", Label: "Company Name", Type: "text", Name: "company_name" },
                { Id: "company_address", Label: "Company Address", Type: "text", Name: "company_address" }
                // { Id: "Other", Label: "Other", Type: "text", Name: "Other"}
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
                jsonData[key] = value;
            });

            console.log(jsonData);

            console.log(JSON.stringify(jsonData));

            try {
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating...';
                submitBtn.disabled = true;

                const response = await fetch('/curriculum/company/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                // Handle response
                if (response.ok && result.isSuccess) {
                    this.showMessage('Company created successfully!', 'success');
                    form.reset(); // Clear form
                } else {
                    this.showMessage(result.error || 'Failed to create company', 'error');
                }

                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                console.error('Error:', error);
                this.showMessage('Network error occurred', 'error');

                // Restore button
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Create Company and other things';
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
    window.CompanyCreate = CompanyCreate;
}