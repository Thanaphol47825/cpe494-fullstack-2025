// Instructor Resignation Form Feature with Manual Form
if (typeof HrInstructorResignationFormFeature === 'undefined') {
  class HrInstructorResignationFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.api = new HrApiService(this.rootURL);
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
        await this.#createResignationForm();
        return true;
      } finally {
        this._isRendering = false;
      }
    }

    async #createResignationForm() {
      try {
        // Create page wrapper with manual form
        const pageHTML = `
          <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
            <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Header Section -->
              <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Submit Instructor Resignation</h1>
                <p class="text-gray-600">Create an instructor resignation request</p>
              </div>

              <!-- Form Container -->
              <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Resignation Information
                  </h2>
                </div>
                
                <div class="p-8">
                  <form id="instructorResignationForm" class="space-y-6">
                    <!-- Instructor Code -->
                    <div>
                      <label for="InstructorCode" class="block text-sm font-medium text-gray-700 mb-2">
                        Instructor Code <span class="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="InstructorCode" 
                        name="InstructorCode" 
                        required
                        placeholder="Enter instructor code (e.g., INS001)"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <!-- Reason -->
                    <div>
                      <label for="Reason" class="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Resignation <span class="text-red-500">*</span>
                      </label>
                      <textarea 
                        id="Reason" 
                        name="Reason" 
                        required
                        rows="4"
                        placeholder="Please provide detailed reason for resignation"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                      ></textarea>
                    </div>

                    <!-- Button Container -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
                      <button 
                        type="submit" 
                        class="${HrUiComponents.buttonClasses.success}">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Submit Resignation
                      </button>
                      <button 
                        type="button" 
                        id="resetButton"
                        class="${HrUiComponents.buttonClasses.secondary}">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          ${HrUiComponents.iconPaths.reset}
                        </svg>
                        Reset Form
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Result Display Area -->
              <div id="formResultArea" class="mt-6"></div>

              <!-- Back Button -->
              <div class="text-center mt-8">
                <a routerLink="hr" class="${HrUiComponents.buttonClasses.secondary}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Home Page
                </a>
              </div>
            </div>
          </div>
        `;

        this.templateEngine.mainContainer.innerHTML = pageHTML;

        // Attach form handlers - wait for DOM to be ready
        this.#attachFormHandlers();
        
        // Also try attaching after a short delay as fallback
        setTimeout(() => {
          const form = document.getElementById('instructorResignationForm');
          if (form && !form.hasAttribute('data-handlers-attached')) {
            console.log('Fallback: Attaching form handlers for instructor resignation');
            form.setAttribute('data-handlers-attached', 'true');
            this.#attachFormHandlers();
          }
        }, 200);

      } catch (error) {
        console.error('Error creating resignation form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #attachFormHandlers() {
      // Try immediate attach first
      let form = document.getElementById('instructorResignationForm');
      let resetButton = document.getElementById('resetButton');

      // If form not found, try again after short delay
      if (!form) {
        setTimeout(() => {
          form = document.getElementById('instructorResignationForm');
          resetButton = document.getElementById('resetButton');
          if (form) {
            this.#doAttachHandlers(form, resetButton);
          } else {
            console.error('Form not found after retry: instructorResignationForm');
          }
        }, 50);
        return;
      }

      this.#doAttachHandlers(form, resetButton);
    }

    #doAttachHandlers(form, resetButton) {
      if (!form) return;

      // Check if handlers already attached
      if (form.hasAttribute('data-handlers-attached')) {
        console.log('Handlers already attached for instructor resignation, skipping');
        return;
      }
      form.setAttribute('data-handlers-attached', 'true');

      // Store form reference on instance for use in handlers
      this._currentForm = form;

      // Bind this context for event handlers
      const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Instructor form submit triggered');
        // Use the actual form element from DOM, not cloned one
        const actualForm = document.getElementById('instructorResignationForm');
        if (actualForm) {
          this.#handleSubmit(actualForm);
        } else {
          console.error('Form not found in DOM');
        }
        return false;
      };

      form.addEventListener('submit', handleSubmit, false);

      // Also attach to button click as fallback
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Instructor submit button clicked');
          const actualForm = document.getElementById('instructorResignationForm');
          if (actualForm) {
            // Trigger submit on actual form
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            actualForm.dispatchEvent(submitEvent);
          }
          return false;
        }, false);
      }

      // Focus first field
      const firstField = form.querySelector('input[name="InstructorCode"]');
      if (firstField) {
        setTimeout(() => firstField.focus(), 100);
      }

      if (resetButton) {
        resetButton.addEventListener('click', () => {
          const actualForm = document.getElementById('instructorResignationForm');
          if (actualForm) {
            actualForm.reset();
          }
          const resultArea = document.getElementById('formResultArea');
          if (resultArea) {
            resultArea.innerHTML = '';
          }
          const firstField = form.querySelector('input[name="InstructorCode"]');
          if (firstField) {
            setTimeout(() => firstField.focus(), 100);
          }
        });
      }

      console.log('Instructor form handlers attached successfully');
    }

    async #handleSubmit(form) {
      try {
        console.log('Instructor handleSubmit called');
        // Hide previous results
        const resultArea = document.getElementById('formResultArea');
        if (resultArea) {
          resultArea.innerHTML = '';
        }

        // Collect form data - make sure we're using the actual form from DOM
        const actualForm = document.getElementById('instructorResignationForm');
        if (!actualForm) {
          throw new Error('Form not found in DOM');
        }

        const formData = new FormData(actualForm);
        const data = {};
        for (const [key, value] of formData.entries()) {
          data[key] = value ? value.trim() : '';
        }

        console.log('Instructor form data collected from actual form:', data);
        console.log('FormData entries:', Array.from(formData.entries()));

        // Validate required fields
        if (!this.#validateFormData(data)) {
          console.log('Instructor validation failed');
          return;
        }

        // Transform payload for API
        const transformedPayload = this.#transformPayload(data);
        console.log('Transformed payload:', transformedPayload);

        // Show loading state
        if (resultArea) {
          resultArea.innerHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">Submitting resignation request...</div>';
        }

        // Submit to API
        const response = await fetch(`${this.rootURL}/hr/resignation-instructor-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(transformedPayload)
        });

        console.log('API response status:', response.status);
        const result = await response.json().catch(() => ({}));
        console.log('API response:', result);

        if (!response.ok) {
          throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
        }

        // Show success message
        if (resultArea) {
          resultArea.innerHTML = '<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800"><strong>Success!</strong> Instructor resignation request submitted successfully!</div>';
        } else {
          HrUiComponents.showFormSuccess('Instructor resignation request submitted successfully!', result);
        }

        // Reset form after delay
        setTimeout(() => {
          actualForm.reset();
          if (resultArea) {
            resultArea.innerHTML = '';
          }
          const firstField = actualForm.querySelector('input[name="InstructorCode"]');
          if (firstField) firstField.focus();
        }, 3000);

      } catch (error) {
        console.error('Instructor form submission error:', error);
        const resultArea = document.getElementById('formResultArea');
        if (resultArea) {
          resultArea.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"><strong>Error!</strong> ${error.message || 'Failed to submit resignation request'}</div>`;
        } else {
          HrUiComponents.showFormError(error.message, error);
        }
      }
    }

    #validateFormData(formData) {
      // Basic validation for required fields
      const requiredFields = ['InstructorCode', 'Reason'];
      const missing = requiredFields.filter(field => {
        const value = formData[field];
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        console.log(`Validating field ${field}: value="${value}", isEmpty=${isEmpty}`);
        return isEmpty;
      });

      console.log('Missing fields:', missing);
      console.log('Full formData object:', formData);

      if (missing.length > 0) {
        const errorMessage = `Please fill required fields: ${missing.join(', ')}`;
        console.log('Instructor validation failed:', errorMessage);
        
        // Show error in resultArea
        const resultArea = document.getElementById('formResultArea');
        if (resultArea) {
          resultArea.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"><strong>Validation Error!</strong> ${errorMessage}</div>`;
        } else {
          HrUiComponents.showFormError(errorMessage);
        }
        return false;
      }

      console.log('Instructor validation passed');
      return true;
    }

    #transformPayload(payload) {
      const transformed = { ...payload };

      // Transform Status to int or null (if it exists)
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

      // Transform date fields to RFC3339 format (ISO string)
      const dateFields = [
        'CreatedAt', 'created_at', 
        'UpdatedAt', 'updated_at', 
        'EffectiveDate', 'effective_date'
      ];
      dateFields.forEach(field => {
        if (transformed[field]) {
          const date = new Date(transformed[field]);
          if (!isNaN(date.getTime())) {
            transformed[field] = date.toISOString();
          }
        }
      });

      // Transform ResignationType to int or null (if it exists)
      if (transformed.resignation_type !== undefined || transformed.ResignationType !== undefined) {
        const typeValue = transformed.resignation_type || transformed.ResignationType;
        if (typeValue && typeValue !== '' && !typeValue.startsWith('Select')) {
          const typeInt = parseInt(typeValue, 10);
          transformed.ResignationType = !isNaN(typeInt) ? typeInt : null;
        } else {
          transformed.ResignationType = null;
        }
        if (transformed.resignation_type !== undefined) delete transformed.resignation_type;
      }

      // Set remaining text fields to null if empty
      [
        'Reason', 'reason', 
        'InstructorCode', 'instructor_code',
        'AdditionalNotes', 'additional_notes'
      ].forEach(field => {
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
                <button onclick="window.location.href='${this.rootURL}/#hr/resignation/instructor'" 
                        class="${HrUiComponents.buttonClasses.secondary} ml-3">
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrInstructorResignationFormFeature = HrInstructorResignationFormFeature;
  }
}
