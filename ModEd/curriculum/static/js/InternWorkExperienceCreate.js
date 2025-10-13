if (typeof window !== 'undefined' && !window.InternWorkExperienceCreate) {
    class InternWorkExperienceCreate {
        constructor(application, internStudentId = null, experienceId = null) {
            this.application = application;
            this.internStudentId = internStudentId; // The InternStudent ID
            this.experienceId = experienceId; // For editing existing experience
            this.isEditMode = experienceId !== null;
            this.internStudentData = null;
            this.experienceData = null;
        }

        async render() {
            console.log(this.isEditMode ? "Edit Intern Work Experience Form" : "Create Intern Work Experience Form");
            console.log("InternStudent ID:", this.internStudentId);
            console.log("Experience ID:", this.experienceId);

            try {
                // Load required data
                await this.loadData();
                
                // Clear container and create form
                this.application.mainContainer.innerHTML = '';
                await this.createForm();
                
            } catch (error) {
                console.error('Error rendering form:', error);
                this.showError('Failed to load form: ' + error.message);
            }
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

        async createForm() {
            const formHTML = `
                <div class="bg-gray-100 min-h-screen py-8">
                    <div class="max-w-2xl mx-auto px-4">
                        <div class="mb-6">
                            <button id="back-btn" class="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                Back to Intern Student
                            </button>
                            <h1 class="text-2xl font-bold text-gray-700">
                                ${this.isEditMode ? 'Edit' : 'Add'} Work Experience
                            </h1>
                            ${this.internStudentData ? `
                                <p class="text-sm text-gray-600 mt-2">
                                    For: ${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''}
                                </p>
                            ` : ''}
                        </div>

                        <div class="bg-white rounded-lg shadow p-6">
                            <form id="workExperienceForm" class="space-y-6">
                                <div id="form-fields"></div>
                                
                                <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" id="submit-btn" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                        <span id="submit-text">${this.isEditMode ? 'Update' : 'Create'} Work Experience</span>
                                        <svg id="submit-spinner" class="hidden animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </form>
                            
                            <div id="response-message" class="mt-4 hidden"></div>
                        </div>
                    </div>
                </div>
            `;

            const formWrapper = this.application.create(formHTML);
            this.application.mainContainer.appendChild(formWrapper);

            // Create form fields
            await this.createFormFields();
            
            // Setup event listeners
            this.setupEventListeners();
        }

        async createFormFields() {
            const fieldsContainer = document.getElementById('form-fields');
            
            // Define form fields with conditional logic
            const fields = [
                {
                    Id: "student_id",
                    Label: this.internStudentData ? 
                        `Student (${this.internStudentData.Student?.first_name || ''} ${this.internStudentData.Student?.last_name || ''})` : 
                        "Student ID",
                    Type: "number",
                    Name: "student_id",
                    Value: this.internStudentData?.StudentID || this.experienceData?.student_id || "",
                    Disabled: !!this.internStudentData, // Lock if we have intern student data
                    Required: true
                },
                {
                    Id: "company_name",
                    Label: "Company Name",
                    Type: "text",
                    Name: "company_name",
                    Value: this.experienceData?.company_name || "",
                    Required: true
                },
                {
                    Id: "detail",
                    Label: "Work Details",
                    Type: "text",
                    Name: "detail",
                    Value: this.experienceData?.detail || "",
                    Placeholder: "Describe the work experience, responsibilities, and achievements...",
                    Required: true
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

            // Create each field using the template system
            fields.forEach(field => {
                if (this.application.template && this.application.template.Input) {
                    // Use textarea template for detail field
                    const templateName = field.Type === 'textarea' ? 'Textarea' : 'Input';
                    const template = this.application.template[templateName];
                    
                    if (template) {
                        const inputHTML = Mustache.render(template, field);
                        const inputElement = this.application.create(inputHTML);
                        fieldsContainer.appendChild(inputElement);
                        
                        // Set value and disabled state after creation
                        const inputField = inputElement.querySelector(`[name="${field.Name}"]`);
                        if (inputField) {
                            if (field.Value) inputField.value = field.Value;
                            if (field.Disabled) {
                                inputField.disabled = true;
                                inputField.classList.add('bg-gray-100', 'cursor-not-allowed');
                            }
                        }
                    }
                }
            });
        }

        setupEventListeners() {
            // Back button
            document.getElementById('back-btn')?.addEventListener('click', () => this.goBack());
            
            // Cancel button
            document.getElementById('cancel-btn')?.addEventListener('click', () => this.goBack());
            
            // Form submission
            document.getElementById('workExperienceForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        async handleFormSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const submitSpinner = document.getElementById('submit-spinner');

            // Show loading state
            submitBtn.disabled = true;
            submitText.textContent = this.isEditMode ? 'Updating...' : 'Creating...';
            submitSpinner.classList.remove('hidden');

            try {
                const jsonData = {};

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

                // Determine endpoint and method
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

                if (response.ok && result.isSuccess) {
                    this.showMessage(
                        `Work Experience ${this.isEditMode ? 'updated' : 'created'} successfully!`, 
                        'success'
                    );
                    
                    // Navigate back after a short delay
                    setTimeout(() => this.goBack(), 1500);
                } else {
                    throw new Error(result.error || `Failed to ${this.isEditMode ? 'update' : 'create'} work experience`);
                }

            } catch (error) {
                console.error('Error:', error);
                this.showMessage(error.message || 'Network error occurred', 'error');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitText.textContent = `${this.isEditMode ? 'Update' : 'Create'} Work Experience`;
                submitSpinner.classList.add('hidden');
            }
        }

        async goBack() {
            try {
                if (this.internStudentId) {
                    // Go back to InternStudentEdit
                    await this.application.fetchModule('/curriculum/static/js/InternStudentEdit.js');
                    
                    if (window.InternStudentEdit) {
                        const editView = new window.InternStudentEdit(this.application, this.internStudentId);
                        await editView.render();
                    }
                } else {
                    // Go to list or main page
                    await this.application.fetchModule('/curriculum/static/js/InternStudentList.js');
                    
                    if (window.InternStudentList) {
                        const listView = new window.InternStudentList(this.application);
                        await listView.render();
                    }
                }
            } catch (error) {
                console.error('Error navigating back:', error);
            }
        }

        showError(message) {
            this.application.mainContainer.innerHTML = `
                <div class="bg-gray-100 min-h-screen py-8">
                    <div class="max-w-2xl mx-auto px-4">
                        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <h3 class="font-medium">Error</h3>
                            <p class="mt-1 text-sm">${message}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        showMessage(message, type) {
            const responseDiv = document.getElementById('response-message');
            if (responseDiv) {
                responseDiv.className = `mt-4 p-3 rounded ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
                responseDiv.textContent = message;
                responseDiv.classList.remove('hidden');

                // Hide message after 5 seconds
                setTimeout(() => {
                    responseDiv.classList.add('hidden');
                }, 5000);
            }
        }
    }
    window.InternWorkExperienceCreate = InternWorkExperienceCreate;
}