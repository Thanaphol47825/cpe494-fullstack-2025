// Student Form Feature using AdvanceFormRender (V2)
if (typeof HrStudentFormFeature === 'undefined') {
  class HrStudentFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.formRender = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      // Prevent duplicate rendering
      if (this._isRendering) {
        return false;
      }

      this._isRendering = true;

      try {
        this.templateEngine.mainContainer.innerHTML = "";
        await this.#createStudentForm();
        return true;
      } finally {
        this._isRendering = false;
      }
    }

    async #createStudentForm() {
      try {
        // Create page wrapper using shared UI components
        const pageWrapper = HrUiComponents.createFormPageWrapper({
          title: 'Add New Student',
          description: 'Create a new student record using our dynamic form generation system',
          icon: HrUiComponents.iconPaths.student,
          gradientFrom: 'green-600',
          gradientTo: 'teal-600',
          bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
          formTitle: 'Student Information',
          containerSelector: '.student-form-container'
        });

        // Append page wrapper to main container
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        // Initialize AdvanceFormRender (V2)
        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/students',
          targetSelector: '.student-form-container',
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

        // Customize dropdown fields after render
        this.#customizeDropdowns();

        // Add custom action buttons
        this.#addCustomButtons();

      } catch (error) {
        console.error('Error creating student form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #customizeDropdowns() {
      const form = document.querySelector('.student-form-container form');
      if (!form) return;

      // Program dropdown (0=REGULAR, 1=INTERNATIONAL)
      const programSelect = form.querySelector('select[name="program"], select[name="Program"]');
      if (programSelect) {
        programSelect.innerHTML = `
          <option value="">— Select Program —</option>
          <option value="0">Regular</option>
          <option value="1">International</option>
        `;
      }

      // Status dropdown (0=ACTIVE, 1=GRADUATED, 2=DROP)
      const statusSelect = form.querySelector('select[name="status"], select[name="Status"]');
      if (statusSelect) {
        statusSelect.innerHTML = `
          <option value="">— Select Status —</option>
          <option value="0">Active</option>
          <option value="1">Graduated</option>
          <option value="2">Drop</option>
        `;
      }

      // Gender dropdown
      const genderSelect = form.querySelector('select[name="Gender"], select[name="gender"]');
      if (genderSelect) {
        genderSelect.innerHTML = `
          <option value="">— Select Gender —</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        `;
      }

      // AdvisorCode: Convert select to text input if it's a dropdown
      const advisorSelect = form.querySelector('select[name="AdvisorCode"], select[name="advisor_code"]');
      if (advisorSelect) {
        const label = advisorSelect.previousElementSibling || document.querySelector(`label[for="${advisorSelect.id}"]`);
        const wrapper = advisorSelect.parentElement;
        
        // Create text input to replace select
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.name = advisorSelect.name;
        textInput.id = advisorSelect.id || `advisor_code_${Date.now()}`;
        textInput.className = advisorSelect.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500';
        textInput.placeholder = 'Enter advisor code';
        
        // Replace select with input
        advisorSelect.replaceWith(textInput);
        
        // Update label if needed
        if (label && label.getAttribute('for') === advisorSelect.id) {
          label.setAttribute('for', textInput.id);
        }
      }
    }

    #addCustomButtons() {
      const form = document.querySelector('.student-form-container form');
      if (!form) return;

      // Remove any existing submit buttons from AdvanceFormRender
      const existingSubmitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      existingSubmitButtons.forEach(btn => btn.remove());

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

      // Create Submit button using shared button classes
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = HrUiComponents.buttonClasses.success;
      submitButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.add}
        </svg>
        Create Student
      `;

      // Create Reset button using shared button classes
      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.className = HrUiComponents.buttonClasses.secondary;
      resetButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.reset}
        </svg>
        Reset Form
      `;

      // Add reset handler
      resetButton.addEventListener('click', () => {
        if (this.formRender) {
          this.formRender.reset();
          HrUiComponents.hideFormResult();
          
          // Focus first field
          const firstField = form.querySelector('input[name="student_code"]');
          if (firstField) {
            setTimeout(() => firstField.focus(), 100);
          }
        }
      });

      // Add buttons to container
      buttonContainer.appendChild(submitButton);
      buttonContainer.appendChild(resetButton);

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
        const response = await fetch(`${this.rootURL}/hr/students`, {
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
        HrUiComponents.showFormSuccess('Student created successfully!', result);

        // Reset form after delay
        setTimeout(() => {
          if (this.formRender) {
            this.formRender.reset();
            HrUiComponents.hideFormResult();

            // Focus first field
            const form = document.querySelector('.student-form-container form');
            const firstField = form?.querySelector('input[name="student_code"]');
            if (firstField) firstField.focus();
          }
        }, 3000);

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
        if (programValue && programValue !== '' && programValue !== 'Select Program' && !programValue.startsWith('—')) {
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
        if (statusValue && statusValue !== '' && !statusValue.startsWith('Select') && !statusValue.startsWith('—')) {
          const statusInt = parseInt(statusValue, 10);
          transformed.Status = !isNaN(statusInt) ? statusInt : null;
        } else {
          transformed.Status = null;
        }
        if (transformed.status !== undefined) delete transformed.status;
      }

      // Transform Gender to string or null
      if (transformed.gender !== undefined || transformed.Gender !== undefined) {
        const genderValue = transformed.gender || transformed.Gender;
        if (genderValue && genderValue !== '' && !genderValue.startsWith('Select') && !genderValue.startsWith('—')) {
          transformed.Gender = genderValue;
        } else {
          transformed.Gender = null;
        }
        if (transformed.gender !== undefined) delete transformed.gender;
      }

      // Transform AdvisorCode to string or null (text input, not dropdown)
      if (transformed.advisor_code !== undefined || transformed.AdvisorCode !== undefined) {
        const advisorValue = transformed.advisor_code || transformed.AdvisorCode;
        if (advisorValue && advisorValue !== '' && advisorValue.trim() !== '') {
          transformed.AdvisorCode = advisorValue.trim();
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

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4">
                <button onclick="window.location.reload()" 
                        class="${HrUiComponents.buttonClasses.danger}">
                  Retry
                </button>
                <button onclick="window.location.href='${this.rootURL}/hr'" 
                        class="${HrUiComponents.buttonClasses.secondary} ml-3">
                  Back to Main
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
    window.HrStudentFormFeature = HrStudentFormFeature;
  }
}
