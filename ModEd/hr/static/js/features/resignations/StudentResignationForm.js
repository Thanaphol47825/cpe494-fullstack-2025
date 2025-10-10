// Student Resignation Form Feature with Manual Form
if (typeof HrStudentResignationFormFeature === 'undefined') {
  class HrStudentResignationFormFeature {
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
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Submit Student Resignation</h1>
                <p class="text-gray-600">Create a student resignation request</p>
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
                  <form id="studentResignationForm" class="space-y-6">
                    <!-- Student Code -->
                    <div>
                      <label for="StudentCode" class="block text-sm font-medium text-gray-700 mb-2">
                        Student Code <span class="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="StudentCode" 
                        name="StudentCode" 
                        required
                        placeholder="Enter student code"
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
                <a routerLink="hr/resignation/student" class="${HrUiComponents.buttonClasses.secondary}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to List
                </a>
              </div>
            </div>
          </div>
        `;

        this.templateEngine.mainContainer.innerHTML = pageHTML;

        // Attach form handlers
        this.#attachFormHandlers();

      } catch (error) {
        console.error('Error creating resignation form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #attachFormHandlers() {
      const form = document.getElementById('studentResignationForm');
      const resetButton = document.getElementById('resetButton');

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.#handleSubmit(form);
        });

        // Focus first field
        const firstField = form.querySelector('input[name="StudentCode"]');
        if (firstField) {
          setTimeout(() => firstField.focus(), 100);
        }
      }

      if (resetButton) {
        resetButton.addEventListener('click', () => {
          form.reset();
          HrUiComponents.hideFormResult();
          const firstField = form.querySelector('input[name="StudentCode"]');
          if (firstField) {
            setTimeout(() => firstField.focus(), 100);
          }
        });
      }
    }

    async #handleSubmit(form) {
      try {
        // Hide previous results
        HrUiComponents.hideFormResult();

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          data[key] = value.trim();
        }

        // Validate required fields
        if (!this.#validateFormData(data)) {
          return;
        }

        // Transform payload for API
        const transformedPayload = this.#transformPayload(data);

        // Submit to API
        const response = await fetch(`${this.rootURL}/hr/resignation-student-requests`, {
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

        // Show success message
        HrUiComponents.showFormSuccess('Student resignation request submitted successfully!', result);

        // Reset form after delay
        setTimeout(() => {
          form.reset();
          HrUiComponents.hideFormResult();
          const firstField = form.querySelector('input[name="StudentCode"]');
          if (firstField) firstField.focus();
        }, 3000);

      } catch (error) {
        console.error('Form submission error:', error);
        HrUiComponents.showFormError(error.message, error);
      }
    }

    #validateFormData(formData) {
      // Basic validation for required fields
      const requiredFields = ['StudentCode', 'Reason'];
      const missing = requiredFields.filter(field => !formData[field]);

      if (missing.length > 0) {
        HrUiComponents.showFormError(`Please fill required fields: ${missing.join(', ')}`);
        return false;
      }

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
      const dateFields = ['CreatedAt', 'created_at', 'UpdatedAt', 'updated_at', 'EffectiveDate', 'effective_date'];
      dateFields.forEach(field => {
        if (transformed[field]) {
          const date = new Date(transformed[field]);
          if (!isNaN(date.getTime())) {
            transformed[field] = date.toISOString();
          }
        }
      });

      // Set remaining text fields to null if empty
      ['Reason', 'reason', 'StudentCode', 'student_code'].forEach(field => {
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
                <button onclick="window.location.href='${this.rootURL}/#hr/resignation/student'" 
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
    window.HrStudentResignationFormFeature = HrStudentResignationFormFeature;
  }
}
