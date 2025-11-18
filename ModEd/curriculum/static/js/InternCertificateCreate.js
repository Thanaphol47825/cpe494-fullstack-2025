if (typeof window !== 'undefined' && !window.InternCertificateCreate) {
    class InternCertificateCreate {
        constructor(application, internStudentId = null) {
            this.application = application;
            this.internStudentId = internStudentId;
            this.isEditMode = false;
            this.internStudentData = null;
            this.certificateData = null;
            
            // Get user role from localStorage
            this.userRole = localStorage.getItem('role') || 'Student';
            this.currentUserId = parseInt(localStorage.getItem('userId')) || null;
            
            // Check permissions
            this.canCreate = this.userRole === 'Instructor' || this.userRole === 'Admin';
            this.canRead = true; // All roles can read
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
            console.log("Create Intern Certificate Form");
            console.log("InternStudent ID:", this.internStudentId);
            console.log("User Role:", this.userRole);
            console.log("Can Create:", this.canCreate);

            // Check permission before rendering
            if (!this.canCreate) {
                this.showError("You don't have permission to create certificates. Only Instructors and Admins can create certificates.");
                this.goBack();
                return;
            }

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
                console.error("Error rendering InternCertificateCreate:", error);
                this.showError("Failed to load form: " + error.message);
            }
        }

        preparePageConfig() {
            const title = "Add Certificate";
            const description = this.internStudentData ? 
                `For: ${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''}` :
                "Add internship certificate details.";

            return {
                title: title,
                description: description,
                showBackButton: true,
                backButtonText: "Back to Intern Student",
                backButtonRoute: this.internStudentId ? 
                    `/#internship/internstudent/edit/${this.internStudentId}` : 
                    "/#internship/internstudent/",
                pageClass: "internship-certificate-page",
                headerClass: "internship-header",
                contentClass: "internship-content",
            };
        }

        async loadData() {
            try {
                if (this.internStudentId) {
                    const internResponse = await fetch(`/curriculum/InternStudent/${this.internStudentId}`, {
                        headers: {
                            'X-User-Role': this.userRole,
                            'X-User-Id': this.currentUserId
                        }
                    });
                    const internData = await internResponse.json();
                    
                    if (internData.isSuccess) {
                        this.internStudentData = internData.result;
                    } else {
                        throw new Error('Failed to load intern student data');
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                throw error;
            }
        }

        async createFormContent() {
            const formFields = await this.generateFormFields();

            // Show role-based warning
            const roleWarning = this.userRole === 'Student' ? 
                `<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    <strong>Note:</strong> As a Student, you can only view certificates. Contact your Instructor or Admin to create new certificates.
                </div>` : '';

            return `
                ${roleWarning}
                <form id="certificate-form" class="space-y-6">
                    <div id="form-fields" class="space-y-4">
                        ${formFields}
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" ${!this.canCreate ? 'disabled' : ''}>
                            Create Certificate
                        </button>
                    </div>
                </form>
            `;
        }

        async generateFormFields() {
            const fields = [
                {
                    Id: "intern_student_id",
                    Label: this.internStudentData ? 
                        `Student (${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''})` : 
                        "Intern Student ID",
                    Type: "number",
                    Name: "intern_student_id",
                    Value: this.internStudentData?.ID || this.certificateData?.intern_student_id || "",
                    Required: true,
                    Disabled: !!this.internStudentData || !this.canCreate,
                },
                {
                    Id: "certificate_name",
                    Label: "Certificate Name",
                    Type: "text",
                    Name: "certificate_name",
                    Value: this.certificateData?.certificate_name || "",
                    Required: true,
                    Placeholder: "Enter certificate name...",
                    Disabled: !this.canCreate
                },
                {
                    Id: "company_id",
                    Label: "Company ID",
                    Type: "number",
                    Name: "company_id",
                    Value: this.certificateData?.company_id || "",
                    Placeholder: "Enter company ID...",
                    Required: true,
                    Disabled: !this.canCreate
                },
                {
                    Id: "certificate_number",
                    Label: "Certificate Number",
                    Type: "hidden",
                    Name: "certificate_number",
                    Value: this.certificateData?.certificate_number || "",
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

            const form = document.getElementById("certificate-form");
            if (form) {
                form.addEventListener("submit", this.handleSubmit.bind(this));
            }

            // Handle disabled fields based on role
            if (!this.canCreate) {
                const allInputs = form.querySelectorAll('input, textarea, select');
                allInputs.forEach(input => {
                    input.disabled = true;
                    input.classList.add('bg-gray-100', 'cursor-not-allowed');
                });
            } else if (this.internStudentData) {
                const studentIdField = document.querySelector('[name="intern_student_id"]');
                if (studentIdField) {
                    studentIdField.disabled = true;
                    studentIdField.classList.add('bg-gray-100', 'cursor-not-allowed');
                }
            }
        }

        async handleSubmit(event) {
            event.preventDefault();

            // Double-check permission
            if (!this.canCreate) {
                window.InternshipPageTemplate.showError(
                    'You do not have permission to create certificates.',
                    this.application.mainContainer
                );
                return;
            }

            const form = event.target;
            const formData = new FormData(form);

            window.InternshipPageTemplate.showLoading(form, "Creating...");

            try {
                const jsonData = {};

                if (this.internStudentId) {
                    jsonData['intern_student_id'] = parseInt(this.internStudentId, 10);
                }

                formData.forEach((value, key) => {
                    if (key === 'intern_student_id') {
                        jsonData[key] = parseInt(value, 10);
                    } else {
                        jsonData[key] = value;
                    }
                });

                if (!jsonData['intern_student_id'] && this.internStudentData?.ID) {
                    jsonData['intern_student_id'] = parseInt(this.internStudentData.ID, 10);
                }

                console.log('Submitting data:', jsonData);

                const url = '/curriculum/CreateInternCertificate';

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Role': this.userRole,
                        'X-User-Id': this.currentUserId
                    },
                    body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                if (!response.ok || !result.isSuccess) {
                    if (response.status === 403) {
                        throw new Error('Permission denied. Only Instructors and Admins can create certificates.');
                    }
                    throw new Error(result.error || 'Failed to create certificate');
                }

                window.InternshipPageTemplate.showSuccess(
                    'Certificate created successfully!',
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
                    'Create Certificate'
                );
            }
        }

        goBack() {
            if (this.internStudentId) {
                if (this.application.navigate) {
                    this.application.navigate(`/internship/internstudent/edit/${this.internStudentId}`);
                } else {
                    window.location.hash = `#/internship/internstudent/edit/${this.internStudentId}`;
                }
            } else {
                if (this.application.navigate) {
                    this.application.navigate("/internship/internstudent");
                } else {
                    window.location.hash = "#/internship/internstudent";
                }
            }
        }

        goBackToList() {
            if (this.application.navigate) {
                this.application.navigate("/internship");
            } else {
                window.location.hash = "#/internship";
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
        window.InternCertificateCreate = InternCertificateCreate;
    }
}