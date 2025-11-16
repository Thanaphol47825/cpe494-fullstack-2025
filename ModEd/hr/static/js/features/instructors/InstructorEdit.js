// Instructor Edit Feature using AdvanceFormRender (V2)
if (typeof HrInstructorEditFeature === 'undefined') {
  class HrInstructorEditFeature {
    constructor(templateEngine, rootURL, instructorCode) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.instructorCode = instructorCode;
      this.api = new HrApiService(this.rootURL);
      this.instructorData = null;
      this.formRender = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      this.templateEngine.mainContainer.innerHTML = "";
      await this.#loadInstructorData();
      return true;
    }

    async #loadInstructorData() {
      try {
        this.#showLoading();
        this.instructorData = await this.api.fetchInstructor(this.instructorCode);
        await this.#createInstructorEditForm();
      } catch (error) {
        console.error('Error loading instructor data:', error);
        this.#showError('Failed to load instructor data: ' + error.message);
      }
    }

    async #createInstructorEditForm() {
      try {
        // Clear loading state before rendering form
        this.templateEngine.mainContainer.innerHTML = '';

        // Create page wrapper using shared UI components
        const pageWrapper = HrUiComponents.createEditFormPageWrapper({
          title: 'Edit Instructor',
          description: `Update instructor record: ${this.instructorData?.instructor_code || this.instructorCode}`,
          icon: HrUiComponents.iconPaths.instructor,
          gradientFrom: 'blue-600',
          gradientTo: 'purple-600',
          bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
          formTitle: 'Instructor Information',
          containerSelector: '.instructor-edit-form-container',
          backLink: 'hr/instructors',
          backLabel: 'Back to Instructors List'
        });

        // Append page wrapper to main container
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        // Initialize AdvanceFormRender (V2)
        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/instructors',
          targetSelector: '.instructor-edit-form-container',
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
        console.error('Error creating instructor edit form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #populateForm() {
      if (this.formRender && this.instructorData) {
        // Convert date fields to YYYY-MM-DD format for input[type="date"]
        const formData = { ...this.instructorData };
        
        // Transform dates if needed
        ['start_date', 'StartDate'].forEach(field => {
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
      const form = document.querySelector('.instructor-edit-form-container form');
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
      updateButton.className = HrUiComponents.buttonClasses.primary;
      updateButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.save}
        </svg>
        Update Instructor
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
          window.location.href = '#hr/instructors';
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
        const response = await fetch(`${this.rootURL}/hr/instructors/${this.instructorCode}/update`, {
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
        HrUiComponents.showFormSuccess('Instructor updated successfully!', result);

        // Redirect after delay
        setTimeout(() => {
          window.location.href = '#hr/instructors';
        }, 2000);

      } catch (error) {
        console.error('Form submission error:', error);
        HrUiComponents.showFormError(error.message, error);
      }
    }

    #validateFormData(formData) {
      const requiredFields = ['instructor_code', 'email', 'first_name', 'last_name'];
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

      // Transform salary to number
      if (transformed.Salary || transformed.salary) {
        const salaryValue = transformed.Salary || transformed.salary;
        const salary = parseFloat(salaryValue);
        transformed.Salary = Number.isFinite(salary) ? salary : null;
        if (transformed.salary) delete transformed.salary;
      }

      // Transform date fields to RFC3339 format
      const dateFields = ['StartDate', 'start_date'];
      dateFields.forEach(field => {
        if (transformed[field]) {
          const date = new Date(transformed[field]);
          if (!isNaN(date.getTime())) {
            transformed[field] = date.toISOString();
          }
        }
      });

      // Set empty fields to null
      ['department', 'AcademicPosition', 'Gender', 'DepartmentPosition'].forEach(field => {
        if (!transformed[field]) {
          transformed[field] = null;
        }
      });

      return transformed;
    }

    #showLoading() {
      this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
        'Loading Instructor Data...',
        'Please wait while we load the instructor information for editing.',
        'blue-600',
        'purple-600',
        'from-blue-50 via-indigo-50 to-purple-50'
      );
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Instructor</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4 flex gap-3">
                <button onclick="window.location.reload()" 
                        class="${HrUiComponents.buttonClasses.danger}">
                  Retry
                </button>
                <button onclick="window.location.href='#hr/instructors'" 
                        class="${HrUiComponents.buttonClasses.secondary}">
                  Back to Instructors
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
    window.HrInstructorEditFeature = HrInstructorEditFeature;
  }
}
