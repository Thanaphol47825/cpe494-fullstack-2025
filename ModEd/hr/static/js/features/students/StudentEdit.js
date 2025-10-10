// Student Edit Feature using AdvanceFormRender (V2)
if (typeof HrStudentEditFeature === 'undefined') {
  class HrStudentEditFeature {
    constructor(templateEngine, rootURL, studentCode) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.studentCode = studentCode;
      this.api = new HrApiService(this.rootURL);
      this.studentData = null;
      this.formRender = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      this.templateEngine.mainContainer.innerHTML = "";
      await this.#loadStudentData();
      return true;
    }

    async #loadStudentData() {
      try {
        this.#showLoading();
        this.studentData = await this.api.fetchStudent(this.studentCode);
        await this.#createStudentEditForm();
      } catch (error) {
        console.error('Error loading student data:', error);
        this.#showError('Failed to load student data: ' + error.message);
      }
    }

    async #createStudentEditForm() {
      try {
        // Create page wrapper using shared UI components
        const pageWrapper = HrUiComponents.createEditFormPageWrapper({
          title: 'Edit Student',
          description: `Update student record: ${this.studentData?.student_code || this.studentCode}`,
          icon: HrUiComponents.iconPaths.student,
          gradientFrom: 'green-600',
          gradientTo: 'teal-600',
          bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
          formTitle: 'Student Information',
          containerSelector: '.student-edit-form-container',
          backLink: 'hr/students',
          backLabel: 'Back to Students List'
        });

        // Append page wrapper to main container
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        // Initialize AdvanceFormRender (V2)
        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/students',
          targetSelector: '.student-edit-form-container',
          submitHandler: this.#handleSubmit.bind(this),
          config: {
            autoFocus: true,
            showErrors: false,  // Disable built-in errors, use HrUiComponents instead
            validateOnBlur: false
          }
        });

        // Render the form
        await this.formRender.render();

        // Override validation methods to bypass buggy built-in errors
        this.formRender.validateForm = () => true;  // Skip built-in validation
        this.formRender.showFormError = (message) => {
          HrUiComponents.showFormError(message);
        };

        // Pre-populate form with existing data
        this.#populateForm();

        // Add custom action buttons
        this.#addCustomButtons();

      } catch (error) {
        console.error('Error creating student edit form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #populateForm() {
      if (this.formRender && this.studentData) {
        // Convert date fields to YYYY-MM-DD format for input[type="date"]
        const formData = { ...this.studentData };
        
        // Transform dates if needed
        ['start_date', 'StartDate', 'birth_date', 'BirthDate'].forEach(field => {
          if (formData[field]) {
            const date = new Date(formData[field]);
            if (!isNaN(date.getTime())) {
              formData[field] = date.toISOString().split('T')[0];
            }
          }
        });

        this.formRender.setData(formData);
      }
    }

    #addCustomButtons() {
      const form = document.querySelector('.student-edit-form-container form');
      if (!form) return;

      // Remove any existing submit buttons from AdvanceFormRender
      const existingSubmitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      existingSubmitButtons.forEach(btn => btn.remove());

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

      // Create Update button using shared button classes
      const updateButton = document.createElement('button');
      updateButton.type = 'submit';
      updateButton.className = HrUiComponents.buttonClasses.success;
      updateButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.save}
        </svg>
        Update Student
      `;

      // Create Cancel button using shared button classes
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = HrUiComponents.buttonClasses.secondary;
      cancelButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.cancel}
        </svg>
        Cancel
      `;

      // Add cancel handler
      cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
          window.location.href = '#hr/students';
        }
      });

      // Add buttons to container
      buttonContainer.appendChild(updateButton);
      buttonContainer.appendChild(cancelButton);

      // Add container to form
      form.appendChild(buttonContainer);
    }

    async #handleSubmit(formData, event, formInstance) {
      try {
        // Hide previous results
        HrUiComponents.hideFormResult();

        // Validate required fields
        if (!this.#validateFormData(formData)) {
          return;
        }

        // Transform payload for API
        const transformedPayload = this.#transformPayload(formData);

        // Submit to API
        const response = await fetch(`${this.rootURL}/hr/students/${this.studentCode}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(transformedPayload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
        }

        // Show success message using shared UI components
        HrUiComponents.showFormSuccess('Student updated successfully!', result);

        // Redirect after delay
        setTimeout(() => {
          window.location.href = '#hr/students';
        }, 2000);

      } catch (error) {
        console.error('Form submission error:', error);
        HrUiComponents.showFormError(error.message, error);
      }
    }

    #validateFormData(formData) {
      // Use HrValidator if available, fallback to local validation
      if (window.HrValidator) {
        const validation = HrValidator.validateStudentData(formData);
        if (!validation.isValid) {
          HrUiComponents.showFormError(validation.errors.join(', '));
          return false;
        }
        return true;
      }

      // Fallback validation
      const requiredFields = ['student_code', 'first_name', 'last_name', 'email'];
      const missing = requiredFields.filter(field => !formData[field]);

      if (missing.length > 0) {
        HrUiComponents.showFormError(`Please fill required fields: ${missing.join(', ')}`);
        return false;
      }

      // Email validation
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        HrUiComponents.showFormError('Please enter a valid email address');
        return false;
      }

      return true;
    }

    #transformPayload(payload) {
      const transformed = { ...payload };

      // Transform program to int or null (if exists and not empty)
      if (transformed.program !== undefined || transformed.Program !== undefined) {
        const programValue = transformed.program || transformed.Program;
        if (programValue && programValue !== '' && programValue !== 'Select Program') {
          const programInt = parseInt(programValue, 10);
          transformed.Program = !isNaN(programInt) ? programInt : null;
        } else {
          transformed.Program = null;
        }
        if (transformed.program !== undefined) delete transformed.program;
      }

      // Transform year to int or null (if exists and not empty)
      if (transformed.year !== undefined || transformed.Year !== undefined) {
        const yearValue = transformed.year || transformed.Year;
        if (yearValue && yearValue !== '' && yearValue !== 'Select Year') {
          const yearInt = parseInt(yearValue, 10);
          transformed.Year = !isNaN(yearInt) ? yearInt : null;
        } else {
          transformed.Year = null;
        }
        if (transformed.year !== undefined) delete transformed.year;
      }

      // Transform date fields to RFC3339 format
      const dateFields = ['StartDate', 'start_date', 'BirthDate', 'birth_date'];
      dateFields.forEach(field => {
        if (transformed[field]) {
          const date = new Date(transformed[field]);
          if (!isNaN(date.getTime())) {
            transformed[field] = date.toISOString();
          }
        }
      });

      // Transform Status to int or null
      if (transformed.status !== undefined || transformed.Status !== undefined) {
        const statusValue = transformed.status || transformed.Status;
        if (statusValue && statusValue !== '' && !statusValue.startsWith('Select')) {
          const statusInt = parseInt(statusValue, 10);
          transformed.Status = !isNaN(statusInt) ? statusInt : null;
        } else {
          transformed.Status = null;
        }
        if (transformed.status !== undefined) delete transformed.status;
      }

      // Transform Gender to int or null
      if (transformed.gender !== undefined || transformed.Gender !== undefined) {
        const genderValue = transformed.gender || transformed.Gender;
        if (genderValue && genderValue !== '' && !genderValue.startsWith('Select')) {
          const genderInt = parseInt(genderValue, 10);
          transformed.Gender = !isNaN(genderInt) ? genderInt : null;
        } else {
          transformed.Gender = null;
        }
        if (transformed.gender !== undefined) delete transformed.gender;
      }

      // Transform AdvisorCode to int or null
      if (transformed.advisor_code !== undefined || transformed.AdvisorCode !== undefined) {
        const advisorValue = transformed.advisor_code || transformed.AdvisorCode;
        if (advisorValue && advisorValue !== '' && !advisorValue.startsWith('Select')) {
          const advisorInt = parseInt(advisorValue, 10);
          transformed.AdvisorCode = !isNaN(advisorInt) ? advisorInt : null;
        } else {
          transformed.AdvisorCode = null;
        }
        if (transformed.advisor_code !== undefined) delete transformed.advisor_code;
      }

      // Set remaining text fields to null if empty
      ['department', 'Department'].forEach(field => {
        if (transformed[field] !== undefined && (!transformed[field] || transformed[field] === '')) {
          transformed[field] = null;
        }
      });

      return transformed;
    }

    #showLoading() {
      this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
        'Loading Student Data...',
        'Please wait while we load the student information for editing.',
        'green-600',
        'teal-600',
        'from-green-50 via-emerald-50 to-teal-50'
      );
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Student</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4 flex gap-3">
                <button onclick="window.location.reload()" 
                        class="${HrUiComponents.buttonClasses.danger}">
                  Retry
                </button>
                <button onclick="window.location.href='#hr/students'" 
                        class="${HrUiComponents.buttonClasses.secondary}">
                  Back to Students
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Cleanup method
    destroy() {
      if (this.formRender) {
        this.formRender.destroy();
        this.formRender = null;
      }
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrStudentEditFeature = HrStudentEditFeature;
  }
}
