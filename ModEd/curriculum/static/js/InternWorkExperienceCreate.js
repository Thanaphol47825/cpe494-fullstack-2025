if (typeof window !== 'undefined' && !window.InternWorkExperienceCreate) {
    class InternWorkExperienceCreate {
        constructor(application, internStudentId = null, experienceId = null) {
            this.application = application;
            this.internStudentId = internStudentId;
            this.experienceId = experienceId;
            this.isEditMode = experienceId !== null;
            this.internStudentData = null;
            this.experienceData = null;
        }

        async loadInternshipPageTemplate() {
            if (!window.InternshipPageTemplate) {
                const script = document.createElement("script");
                script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
                document.head.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        if (window.InternshipPageTemplate) {
                            resolve();
                        } else {
                            reject(new Error("InternshipPageTemplate failed to load"));
                        }
                    };
                    script.onerror = () =>
                        reject(new Error("Failed to load InternshipPageTemplate script"));
                });
            }
        }

        async render() {
            console.log(this.isEditMode ? "Edit Intern Work Experience Form" : "Create Intern Work Experience Form");
            console.log("InternStudent ID:", this.internStudentId);
            console.log("Experience ID:", this.experienceId);

            try {
                await this.loadInternshipPageTemplate();
                await this.loadData();

                this.application.mainContainer.innerHTML = "";

                const pageConfig = this.preparePageConfig();
                const formContent = await this.createFormContent();

                const pageElement = await window.InternshipPageTemplate.render(
                    pageConfig,
                    formContent,
                    this.application
                );

                this.application.mainContainer.appendChild(pageElement);

                this.setupEventListeners();
            } catch (error) {
                console.error("Error rendering InternWorkExperienceCreate:", error);
                this.showError("Failed to load form: " + error.message);
            }
        }

        preparePageConfig() {
            const title = this.isEditMode ? "Edit Work Experience" : "Add Work Experience";
            const description = this.internStudentData ? 
                `For: ${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''}` :
                "Add or edit internship work experience details.";
            
            return {
                title: title,
                description: description,
                showBackButton: true,
                backButtonText: "Back to Intern Student",
                backButtonRoute: this.internStudentId ? 
                    `/#internship/internstudent/edit/${this.internStudentId}` : 
                    "/#internship/internstudent/",
                pageClass: "internship-work-experience-page",
                headerClass: "internship-header",
                contentClass: "internship-content",
            };
        }

        async loadData() {
            try {
                // Load InternStudent data if provided
                if (this.internStudentId) {
                    const internResponse = await fetch(`/curriculum/InternStudent/${this.internStudentId}`);
                    const internData = await internResponse.json();
                    
                    if (internData.isSuccess) {
                        this.internStudentData = internData.result;
                    } else {
                        throw new Error('Failed to load intern student data');
                    }
                }

                // Load existing experience data if in edit mode
                if (this.isEditMode) {
                    const expResponse = await fetch(`/curriculum/internWorkExperience/get/${this.experienceId}`);
                    const expData = await expResponse.json();
                    
                    if (expData.isSuccess) {
                        this.experienceData = expData.result;
                    } else {
                        throw new Error('Failed to load work experience data');
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                throw error;
            }
        }

        async createFormContent() {
            const formFields = await this.generateFormFields();

            return `
                <form id="work-experience-form" class="space-y-6">
                    <div id="form-fields" class="space-y-4">
                        ${formFields}
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            ${this.isEditMode ? 'Update' : 'Create'} Work Experience
                        </button>
                    </div>
                </form>
            `;
        }

        async generateFormFields() {
            const fields = [
                {
                    Id: "student_id",
                    Label: this.internStudentData ? 
                        `Student (${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''})` : 
                        "Student ID",
                    Type: "number",
                    Name: "student_id",
                    Value: this.internStudentData?.StudentID || this.experienceData?.student_id || "",
                    Required: true,
                    Disabled: !!this.internStudentData,
                },
                {
                    Id: "company_name",
                    Label: "Company Name",
                    Type: "text",
                    Name: "company_name",
                    Value: this.experienceData?.Company?.company_name || "",
                    Required: true,
                    Placeholder: "Enter company name..."
                },
                {
                    Id: "detail",
                    Label: "Work Details",
                    Type: "text",
                    Name: "detail",
                    Value: this.experienceData?.detail || "",
                    Placeholder: "Describe the work experience, responsibilities, and achievements...",
                    Required: true,
                    rows: 4
                },
                {
                    Id: "start_date",
                    Label: "Start Date",
                    Type: "date",
                    Name: "start_date",
                    Value: this.experienceData?.start_date ? 
                        new Date(this.experienceData.start_date).toISOString().split('T')[0] : "",
                    Required: true
                },
                {
                    Id: "end_date",
                    Label: "End Date",
                    Type: "date",
                    Name: "end_date",
                    Value: this.experienceData?.end_date ? 
                        new Date(this.experienceData.end_date).toISOString().split('T')[0] : "",
                    Required: false
                }
            ];

            let fieldsHTML = "";
            fields.forEach((field) => {
                let inputHTML = "";
                try {
                    const templateName = field.Type === "textarea" ? "Textarea" : "Input";
                    const template = this.application.template[templateName];

                    if (template) {
                        inputHTML = Mustache.render(template, field);
                    }

                    if (inputHTML) {
                        fieldsHTML += `<div class="form-field">${inputHTML}</div>`;
                        
                        // Handle disabled state after rendering
                        if (field.Disabled) {
                            // This will be handled in setupEventListeners after DOM is ready
                        }
                    }
                } catch (error) {
                    console.error("Error creating field:", field.Label, error);
                }
            });
            return fieldsHTML;
        }

        setupEventListeners() {
            const backButton = document.querySelector("[data-back-button]");
            if (backButton) {
                backButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goBack();
                });
            }

            const cancelButton = document.getElementById("cancel-btn");
            if (cancelButton) {
                cancelButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goBack();
                });
            }

            const form = document.getElementById("work-experience-form");
            if (form) {
                form.addEventListener("submit", this.handleSubmit.bind(this));
            }

            // Handle disabled fields
            if (this.internStudentData) {
                const studentIdField = document.querySelector('[name="student_id"]');
                if (studentIdField) {
                    studentIdField.disabled = true;
                    studentIdField.classList.add('bg-gray-100', 'cursor-not-allowed');
                }
            }

            // Set field values for edit mode
            if (this.experienceData) {
                this.populateFormFields();
            }
        }

        populateFormFields() {
            const fields = ['student_id', 'company_name', 'detail', 'start_date', 'end_date'];
            
            fields.forEach(fieldName => {
                const field = document.querySelector(`[name="${fieldName}"]`);
                if (field && this.experienceData) {
                    let value = this.experienceData[fieldName];
                    
                    if (fieldName === 'company_name' && this.experienceData.Company) {
                        value = this.experienceData.Company.company_name;
                    } else if ((fieldName === 'start_date' || fieldName === 'end_date') && value) {
                        value = new Date(value).toISOString().split('T')[0];
                    }
                    
                    if (value) {
                        field.value = value;
                    }
                }
            });
        }

        async handleSubmit(event) {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);

            window.InternshipPageTemplate.showLoading(
                form, 
                this.isEditMode ? "Updating..." : "Creating..."
            );

            try {
                const jsonData = {};

                // Handle internStudentId if provided
                if (this.internStudentId) {
                    jsonData['student_id'] = parseInt(this.internStudentId, 10);
                }

                formData.forEach((value, key) => {
                    if (key === 'student_id') {
                        jsonData[key] = parseInt(value, 10);
                    } else if ((key === 'start_date' || key === 'end_date') && value) {
                        jsonData[key] = new Date(value + 'T00:00:00Z').toISOString();
                    } else {
                        jsonData[key] = value;
                    }
                });

                // Ensure student_id is always present
                if (!jsonData['student_id'] && this.internStudentData?.StudentID) {
                    jsonData['student_id'] = parseInt(this.internStudentData.StudentID, 10);
                }

                console.log('Submitting data:', jsonData);

                // Determine endpoint
                const url = this.isEditMode ? 
                    `/curriculum/internWorkExperience/update/${this.experienceId}` :
                    '/curriculum/internWorkExperience/create';

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                if (!response.ok || !result.isSuccess) {
                    throw new Error(result.error || `Failed to ${this.isEditMode ? 'update' : 'create'} work experience`);
                }

                window.InternshipPageTemplate.showSuccess(
                    `Work Experience ${this.isEditMode ? 'updated' : 'created'} successfully!`,
                    this.application.mainContainer
                );

                setTimeout(() => this.goBack(), 1500);

            } catch (error) {
                console.error('Error:', error);
                window.InternshipPageTemplate.showError(
                    error.message,
                    this.application.mainContainer
                );
            } finally {
                window.InternshipPageTemplate.hideLoading(
                    form,
                    `${this.isEditMode ? 'Update' : 'Create'} Work Experience`
                );
            }
        }

        async goBack() {
            try {
                if (this.internStudentId) {
                    // Go back to InternStudentEdit
                    if (this.application.navigate) {
                        this.application.navigate(`/internship/internstudent/edit/${this.internStudentId}`);
                    } else {
                        window.location.hash = `#internship/internstudent/edit/${this.internStudentId}`;
                    }
                } else {
                    // Go to list or main page
                    if (this.application.navigate) {
                        this.application.navigate("/internship/internstudent");
                    } else {
                        window.location.hash = "#internship/internstudent";
                    }
                }
            } catch (error) {
                console.error('Error navigating back:', error);
            }
        }

        showError(message) {
            if (window.InternshipPageTemplate) {
                window.InternshipPageTemplate.showError(
                    message,
                    this.application.mainContainer
                );
            } else {
                const errorDiv = document.createElement("div");
                errorDiv.className =
                    "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
                errorDiv.textContent = message;
                this.application.mainContainer.prepend(errorDiv);
            }
        }
    }

    if (typeof window !== "undefined") {
        window.InternWorkExperienceCreate = InternWorkExperienceCreate;
    }
}