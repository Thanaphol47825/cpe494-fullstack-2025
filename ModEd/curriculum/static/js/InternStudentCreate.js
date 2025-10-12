if (typeof window !== 'undefined' && !window.InternStudentCreate) {
    class InternStudentCreate {
        constructor(application) {
            this.application = application;
        }

        async render() {
            console.log("Create Intern Student Form");
            console.log(this.application);

            // Clear the container
            this.application.mainContainer.innerHTML = '';

            // Create form wrapper
            const formWrapper = this.application.create(`
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Create Intern Student
                </h1>
                <form id="intern-student-form" class="form-container">
                    <div id="form-fields"></div>
                    <button type="submit" class="form-submit-btn">
                      Create Intern Student
                    </button>
                </form>
            </div>
        `);

            this.application.mainContainer.appendChild(formWrapper);

            // Get form fields container
            const fieldsContainer = document.getElementById('form-fields');

            // Add each input field using Mustache templates
            const fields = [
                { 
                    Id: "intern_status", 
                    Label: "Intern Status", 
                    Type: "select", 
                    Name: "intern_status",
                    options: [
                        { value: "NOT_STARTED", label: "Not Started" },
                        { value: "ACTIVE", label: "Active" },
                        { value: "COMPLETED", label: "Completed" }
                    ],
                    required: true,
                    default: "NOT_STARTED"
                },
                { 
                    Id: "student_code", 
                    Label: "Student Code", 
                    Type: "number", 
                    Name: "student_code", 
                    Required: true, 
                    Placeholder: "Enter Student ID" 
                },
                { 
                    Id: "overview", 
                    Label: "Overview", 
                    Type: "textarea", 
                    Name: "overview", 
                    Placeholder: "Enter internship overview/description",
                    rows: 4
                }
            ];

            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select" && this.application.template && this.application.template.SelectInput) {
                    inputHTML = Mustache.render(this.application.template.SelectInput, field);
                } else if (field.Type === "textarea" && this.application.template && this.application.template.TextareaInput) {
                    inputHTML = Mustache.render(this.application.template.TextareaInput, field);
                } else if (this.application.template && this.application.template.Input) {
                    inputHTML = Mustache.render(this.application.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            // Add event listener for form submission
            const form = document.getElementById('intern-student-form');
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            
            // Convert FormData to JSON object
            const jsonData = {};
            for (let [key, value] of formData.entries()) {
                if (key === 'student_id') {
                    jsonData[key] = parseInt(value);
                } else {
                    jsonData[key] = value;
                }
            }
            
            try {
                const response = await fetch('/curriculum/CreateInternStudent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Success:', result);
                    
                    // Show success message
                    const successMessage = this.application.create(`
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            <strong>Success!</strong> Intern student created successfully.
                        </div>
                    `);
                    form.parentNode.insertBefore(successMessage, form);
                    
                    // Reset form after a delay
                    setTimeout(() => {
                        form.reset();
                        successMessage.remove();
                    }, 3000);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create intern student');
                }
            } catch (error) {
                console.error('Error:', error);
                
                // Show error message
                const errorMessage = this.application.create(`
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error!</strong> ${error.message}
                    </div>
                `);
                form.parentNode.insertBefore(errorMessage, form);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            }
        }
    }
    
    window.InternStudentCreate = InternStudentCreate;
}