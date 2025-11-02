// Instructor Form Feature using AdvanceFormRender (V2)
if (typeof HrInstructorFormFeature === 'undefined') {
  class HrInstructorFormFeature {
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
        await this.#createInstructorForm();
        return true;
      } finally {
        this._isRendering = false;
      }
    }

    async #createInstructorForm() {
      try {
        // Create page wrapper using shared UI components
        const pageWrapper = HrUiComponents.createFormPageWrapper({
          title: 'Add New Instructor',
          description: 'Create a new instructor record using our dynamic form generation system',
          icon: HrUiComponents.iconPaths.instructor,
          gradientFrom: 'blue-600',
          gradientTo: 'purple-600',
          bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
          formTitle: 'Instructor Information',
          containerSelector: '.instructor-form-container'
        });

        // Append page wrapper to main container
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        // Initialize AdvanceFormRender (V2)
        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/instructors',
          targetSelector: '.instructor-form-container',
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
        console.error('Error creating instructor form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #customizeDropdowns() {
      const form = document.querySelector('.instructor-form-container form');
      if (!form) return;

      // Convert AcademicPosition from number input to dropdown
      const academicInput = form.querySelector('input[name="AcademicPosition"], input[name="academic_position"]');
      if (academicInput && academicInput.type === 'number') {
        const currentValue = academicInput.value || '';
        const wrapper = academicInput.parentElement;
        const label = academicInput.previousElementSibling || form.querySelector(`label[for="${academicInput.id}"]`);
        
        // Create select dropdown
        const select = document.createElement('select');
        select.name = academicInput.name;
        select.id = academicInput.id || `AcademicPosition_${Date.now()}`;
        select.className = academicInput.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
        select.innerHTML = `
          <option value="">— Select Academic Position —</option>
          <option value="0">None</option>
          <option value="1">Assistant Prof</option>
          <option value="2">Associate Prof</option>
          <option value="3">Professor</option>
        `;
        
        // Set current value if exists
        if (currentValue) {
          select.value = currentValue;
        }
        
        // Replace input with select
        academicInput.replaceWith(select);
        
        // Update label if needed
        if (label && label.getAttribute('for') === academicInput.id) {
          label.setAttribute('for', select.id);
        }
      }

      // Also check if it's already a select
      const academicSelect = form.querySelector('select[name="AcademicPosition"], select[name="academic_position"]');
      if (academicSelect) {
        academicSelect.innerHTML = `
          <option value="">— Select Academic Position —</option>
          <option value="0">None</option>
          <option value="1">Assistant Prof</option>
          <option value="2">Associate Prof</option>
          <option value="3">Professor</option>
        `;
      }

      // Convert DepartmentPosition from number input to dropdown
      const deptInput = form.querySelector('input[name="DepartmentPosition"], input[name="department_position"]');
      if (deptInput && deptInput.type === 'number') {
        const currentValue = deptInput.value || '';
        const wrapper = deptInput.parentElement;
        const label = deptInput.previousElementSibling || form.querySelector(`label[for="${deptInput.id}"]`);
        
        // Create select dropdown
        const select = document.createElement('select');
        select.name = deptInput.name;
        select.id = deptInput.id || `DepartmentPosition_${Date.now()}`;
        select.className = deptInput.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
        select.innerHTML = `
          <option value="">— Select Department Position —</option>
          <option value="0">None</option>
          <option value="1">Head</option>
          <option value="2">Deputy</option>
          <option value="3">Secretary</option>
        `;
        
        // Set current value if exists
        if (currentValue) {
          select.value = currentValue;
        }
        
        // Replace input with select
        deptInput.replaceWith(select);
        
        // Update label if needed
        if (label && label.getAttribute('for') === deptInput.id) {
          label.setAttribute('for', select.id);
        }
      }

      // Also check if it's already a select
      const deptSelect = form.querySelector('select[name="DepartmentPosition"], select[name="department_position"]');
      if (deptSelect) {
        deptSelect.innerHTML = `
          <option value="">— Select Department Position —</option>
          <option value="0">None</option>
          <option value="1">Head</option>
          <option value="2">Deputy</option>
          <option value="3">Secretary</option>
        `;
      }

      // Convert Gender from text input to dropdown (if it's not already a select)
      const genderInput = form.querySelector('input[name="Gender"], input[name="gender"]');
      if (genderInput && genderInput.type === 'text') {
        const currentValue = genderInput.value || '';
        const wrapper = genderInput.parentElement;
        const label = genderInput.previousElementSibling || form.querySelector(`label[for="${genderInput.id}"]`);
        
        // Create select dropdown
        const select = document.createElement('select');
        select.name = genderInput.name;
        select.id = genderInput.id || `Gender_${Date.now()}`;
        select.className = genderInput.className || 'w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
        select.innerHTML = `
          <option value="">— Select Gender —</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        `;
        
        // Set current value if exists
        if (currentValue) {
          select.value = currentValue;
        }
        
        // Replace input with select
        genderInput.replaceWith(select);
        
        // Update label if needed
        if (label && label.getAttribute('for') === genderInput.id) {
          label.setAttribute('for', select.id);
        }
      }

      // Also check if it's already a select
      const genderSelect = form.querySelector('select[name="Gender"], select[name="gender"]');
      if (genderSelect) {
        genderSelect.innerHTML = `
          <option value="">— Select Gender —</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        `;
      }
    }

    #addCustomButtons() {
      const form = document.querySelector('.instructor-form-container form');
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
      submitButton.className = HrUiComponents.buttonClasses.primary;
      submitButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.add}
        </svg>
        Create Instructor
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
          const firstField = form.querySelector('input[name="instructor_code"]');
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
        const response = await fetch(`${this.rootURL}/hr/instructors`, {
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
        HrUiComponents.showFormSuccess('Instructor created successfully!', result);

        // Reset form after delay
        setTimeout(() => {
          if (this.formRender) {
            this.formRender.reset();
            HrUiComponents.hideFormResult();

            // Focus first field
            const form = document.querySelector('.instructor-form-container form');
            const firstField = form?.querySelector('input[name="instructor_code"]');
            if (firstField) firstField.focus();
          }
        }, 3000);

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

      // Transform AcademicPosition to int or null
      if (transformed.AcademicPosition !== undefined || transformed.academic_position !== undefined) {
        const posValue = transformed.AcademicPosition || transformed.academic_position;
        if (posValue && posValue !== '' && posValue !== 'Select Academic Position') {
          const posInt = parseInt(posValue, 10);
          transformed.AcademicPosition = !isNaN(posInt) ? posInt : null;
        } else {
          transformed.AcademicPosition = null;
        }
        if (transformed.academic_position !== undefined) delete transformed.academic_position;
      }

      // Transform DepartmentPosition to int or null
      if (transformed.DepartmentPosition !== undefined || transformed.department_position !== undefined) {
        const posValue = transformed.DepartmentPosition || transformed.department_position;
        if (posValue && posValue !== '' && posValue !== 'Select Department Position') {
          const posInt = parseInt(posValue, 10);
          transformed.DepartmentPosition = !isNaN(posInt) ? posInt : null;
        } else {
          transformed.DepartmentPosition = null;
        }
        if (transformed.department_position !== undefined) delete transformed.department_position;
      }

      // Transform Gender to string or null
      if (transformed.Gender !== undefined || transformed.gender !== undefined) {
        const genderValue = transformed.Gender || transformed.gender;
        if (genderValue && genderValue !== '' && !genderValue.startsWith('Select')) {
          transformed.Gender = genderValue;
        } else {
          transformed.Gender = null;
        }
        if (transformed.gender !== undefined) delete transformed.gender;
      }

      // Set empty fields to null
      ['department'].forEach(field => {
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
    window.HrInstructorFormFeature = HrInstructorFormFeature;
  }
}
