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
        // Use HrDOMHelpers to build the form
        const pageHTML = this.#buildFormWithDOM();

        this.templateEngine.mainContainer.innerHTML = '';
        this.templateEngine.mainContainer.appendChild(pageHTML);

        // Wait for DOM to be ready, then attach form handlers
        // Use multiple strategies to ensure handlers are attached
        this.#attachFormHandlers();
        
        // Also try attaching after a short delay as fallback
        setTimeout(() => {
          const form = document.getElementById('studentResignationForm');
          if (form && !form.hasAttribute('data-handlers-attached')) {
            console.log('Fallback: Attaching form handlers');
            form.setAttribute('data-handlers-attached', 'true');
            this.#attachFormHandlers();
          }
        }, 200);

      } catch (error) {
        console.error('Error creating resignation form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #buildFormWithDOM() {
      const Hel = HrDOMHelpers;

      // Main container
      const container = Hel.createDiv({
        className: 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8'
      });

      // Inner wrapper
      const wrapper = Hel.createDiv({
        className: 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'
      });

      // Header Section
      const headerSection = Hel.createDiv({
        className: 'text-center mb-10',
        children: [
          // Icon circle
          Hel.createDiv({
            className: 'inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-4',
            children: [
              Hel.createIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', {
                className: 'w-8 h-8 text-white',
                viewBox: '0 0 24 24'
              })
            ]
          }),
          // Title
          Hel.createHeading(1, {
            className: 'text-3xl font-bold text-gray-900 mb-2',
            textContent: 'Submit Student Resignation'
          }),
          // Subtitle
          Hel.createParagraph({
            className: 'text-gray-600',
            textContent: 'Create a student resignation request'
          })
        ]
      });

      // Form Container
      const formCard = Hel.createDiv({
        className: 'bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100',
        children: [
          // Form header
          Hel.createDiv({
            className: 'px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600',
            children: [
              Hel.createHeading(2, {
                className: 'text-2xl font-semibold text-white flex items-center',
                children: [
                  Hel.createIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', {
                    className: 'w-6 h-6 mr-3'
                  }),
                  document.createTextNode(' Resignation Information')
                ]
              })
            ]
          }),
          // Form body
          Hel.createDiv({
            className: 'p-8',
            children: [
              // Form element
              this.#createFormElement()
            ]
          })
        ]
      });

      // Result area
      const resultArea = Hel.createDiv({
        id: 'formResultArea',
        className: 'mt-6'
      });

      // Back button
      const backButtonSection = Hel.createDiv({
        className: 'text-center mt-8',
        children: [
          Hel.createElement('a', {
            attributes: {
              'routerLink': 'hr'
            },
            className: HrUiComponents.buttonClasses.secondary,
            children: [
              Hel.createIcon('M10 19l-7-7m0 0l7-7m-7 7h18', {
                className: 'w-5 h-5 mr-2'
              }),
              document.createTextNode(' Back to Home Page')
            ]
          })
        ]
      });

      // Assemble the page
      wrapper.appendChild(headerSection);
      wrapper.appendChild(formCard);
      wrapper.appendChild(resultArea);
      wrapper.appendChild(backButtonSection);
      container.appendChild(wrapper);

      return container;
    }

    #createFormElement() {
      const Hel = HrDOMHelpers;

      // Form
      const form = Hel.createElement('form', {
        id: 'studentResignationForm',
        className: 'space-y-6'
      });

      // Student Code field
      const studentCodeField = Hel.createDiv({
        children: [
          Hel.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            children: [
              document.createTextNode('Student Code '),
              Hel.createElement('span', {
                className: 'text-red-500',
                textContent: '*'
              })
            ]
          }),
          Hel.createInput({
            id: 'StudentCode',
            name: 'StudentCode',
            placeholder: 'Enter student code',
            required: true,
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
          })
        ]
      });

      // Reason field
      const reasonField = Hel.createDiv({
        children: [
          Hel.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            children: [
              document.createTextNode('Reason for Resignation '),
              Hel.createElement('span', {
                className: 'text-red-500',
                textContent: '*'
              })
            ]
          }),
          Hel.createTextarea({
            id: 'Reason',
            name: 'Reason',
            placeholder: 'Please provide detailed reason for resignation',
            required: true,
            rows: '4',
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none'
          })
        ]
      });

      // Button container
      const buttonContainer = Hel.createDiv({
        className: 'flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200',
        children: [
          // Submit button
          Hel.createElement('button', {
            type: 'submit',
            className: HrUiComponents.buttonClasses.success,
            children: [
              Hel.createIcon('M12 6v6m0 0v6m0-6h6m-6 0H6', {
                className: 'w-5 h-5 mr-2'
              }),
              document.createTextNode(' Submit Resignation')
            ]
          }),
          // Reset button
          Hel.createElement('button', {
            type: 'button',
            id: 'resetButton',
            className: HrUiComponents.buttonClasses.secondary,
            children: [
              Hel.createIcon(HrTemplates.iconPaths.reset, {
                className: 'w-5 h-5 mr-2'
              }),
              document.createTextNode(' Reset Form')
            ]
          })
        ]
      });

      // Assemble form
      form.appendChild(studentCodeField);
      form.appendChild(reasonField);
      form.appendChild(buttonContainer);

      return form;
    }

    #attachFormHandlers() {
      // Try immediate attach first
      let form = document.getElementById('studentResignationForm');
      let resetButton = document.getElementById('resetButton');

      // If form not found, try again after short delay
      if (!form) {
        setTimeout(() => {
          form = document.getElementById('studentResignationForm');
          resetButton = document.getElementById('resetButton');
          if (form) {
            this.#doAttachHandlers(form, resetButton);
          } else {
            console.error('Form not found after retry: studentResignationForm');
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
        console.log('Handlers already attached, skipping');
        return;
      }
      form.setAttribute('data-handlers-attached', 'true');

      // Store form reference on instance for use in handlers
      this._currentForm = form;

      // Bind this context for event handlers
      const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Form submit triggered');
        // Use the actual form element from DOM, not cloned one
        const actualForm = document.getElementById('studentResignationForm');
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
          console.log('Submit button clicked');
          const actualForm = document.getElementById('studentResignationForm');
          if (actualForm) {
            // Trigger submit on actual form
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            actualForm.dispatchEvent(submitEvent);
          }
          return false;
        }, false);
      }

      // Focus first field
      const firstField = form.querySelector('input[name="StudentCode"]');
      if (firstField) {
        setTimeout(() => firstField.focus(), 100);
      }

      if (resetButton) {
        resetButton.addEventListener('click', () => {
          const actualForm = document.getElementById('studentResignationForm');
          if (actualForm) {
            actualForm.reset();
          }
          const resultArea = document.getElementById('formResultArea');
          if (resultArea) {
            resultArea.innerHTML = '';
          }
          const firstField = form.querySelector('input[name="StudentCode"]');
          if (firstField) {
            setTimeout(() => firstField.focus(), 100);
          }
        });
      }

      console.log('Form handlers attached successfully');
    }

    async #handleSubmit(form) {
      try {
        console.log('handleSubmit called');
        // Hide previous results
        const resultArea = document.getElementById('formResultArea');
        if (resultArea) {
          resultArea.innerHTML = '';
        }

        // Collect form data - make sure we're using the actual form from DOM
        const actualForm = document.getElementById('studentResignationForm');
        if (!actualForm) {
          throw new Error('Form not found in DOM');
        }

        const formData = new FormData(actualForm);
        const data = {};
        for (const [key, value] of formData.entries()) {
          data[key] = value ? value.trim() : '';
        }

        console.log('Form data collected from actual form:', data);
        console.log('FormData entries:', Array.from(formData.entries()));

        // Validate required fields
        if (!this.#validateFormData(data)) {
          console.log('Validation failed');
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
        const response = await fetch(`${this.rootURL}/hr/resignation-student-requests`, {
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
          resultArea.innerHTML = '<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800"><strong>Success!</strong> Student resignation request submitted successfully!</div>';
        } else {
          HrUiComponents.showFormSuccess('Student resignation request submitted successfully!', result);
        }

        // Reset form after delay
        setTimeout(() => {
          form.reset();
          if (resultArea) {
            resultArea.innerHTML = '';
          }
          const firstField = form.querySelector('input[name="StudentCode"]');
          if (firstField) firstField.focus();
        }, 3000);

      } catch (error) {
        console.error('Form submission error:', error);
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
      const requiredFields = ['StudentCode', 'Reason'];
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
        console.log('Validation failed:', errorMessage);
        
        // Show error in resultArea
        const resultArea = document.getElementById('formResultArea');
        if (resultArea) {
          resultArea.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"><strong>Validation Error!</strong> ${errorMessage}</div>`;
        } else {
          HrUiComponents.showFormError(errorMessage);
        }
        return false;
      }

      console.log('Validation passed');
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
      const errorPage = HrDOMHelpers.createErrorPage({
        title: 'Error Loading Form',
        message: message,
        retryText: 'Retry',
        backText: 'Back to Home Page',
        backUrl: `${this.rootURL}/#hr`,
        retryButtonClass: HrUiComponents.buttonClasses.danger,
        backButtonClass: `${HrUiComponents.buttonClasses.secondary} ml-3`
      });
      
      this.templateEngine.mainContainer.innerHTML = '';
      this.templateEngine.mainContainer.appendChild(errorPage);
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrStudentResignationFormFeature = HrStudentResignationFormFeature;
  }
}
