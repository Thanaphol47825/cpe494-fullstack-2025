// Company Create Feature using AdvanceFormRender (V2)
if (typeof window !== 'undefined' && !window.CurriculumCompanyCreateFeature) {
  class CurriculumCompanyCreateFeature {
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

      if (this._isRendering) {
        return false;
      }

      this._isRendering = true;

      try {
        this.templateEngine.mainContainer.innerHTML = "";
        await this.#createCompanyForm();
        return true;
      } finally {
        this._isRendering = false;
      }
    }

    async #createCompanyForm() {
      try {
        const pageWrapper = this.#createFormPageWrapper();
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'curriculum/company',
          targetSelector: '.company-form-container',
          submitHandler: this.#handleSubmit.bind(this),
          config: {
            autoFocus: true,
            showErrors: false,
            validateOnBlur: false
          }
        });

        await this.formRender.render();

        this.formRender.validateForm = () => true;
        this.formRender.showFormError = (message) => {
          this.#showFormError(message);
        };

        this.#addCustomButtons();

      } catch (error) {
        console.error('Error creating company form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #createFormPageWrapper() {
      const container = document.createElement('div');
      container.className = 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8';

      const wrapper = document.createElement('div');
      wrapper.className = 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';

      // Header
      const header = document.createElement('div');
      header.className = 'mb-8';

      const headerCard = document.createElement('div');
      headerCard.className = 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white';

      const headerContent = document.createElement('div');
      headerContent.className = 'flex items-center space-x-4';

      const iconContainer = document.createElement('div');
      iconContainer.className = 'bg-white/20 backdrop-blur-sm rounded-2xl p-4';
      
      const icon = document.createElement('svg');
      icon.className = 'w-12 h-12 text-white';
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>';
      iconContainer.appendChild(icon);

      const headerText = document.createElement('div');
      
      const title = document.createElement('h1');
      title.className = 'text-4xl font-bold';
      title.textContent = 'Add New Company';
      
      const description = document.createElement('p');
      description.className = 'text-blue-100 mt-2 text-lg';
      description.textContent = 'Create a new company record for internship management';

      headerText.appendChild(title);
      headerText.appendChild(description);
      headerContent.appendChild(iconContainer);
      headerContent.appendChild(headerText);
      headerCard.appendChild(headerContent);
      header.appendChild(headerCard);

      // Form card
      const formCard = document.createElement('div');
      formCard.className = 'bg-white rounded-3xl shadow-2xl overflow-hidden';

      const formHeader = document.createElement('div');
      formHeader.className = 'bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6';

      const formTitle = document.createElement('h2');
      formTitle.className = 'text-2xl font-bold text-white';
      formTitle.textContent = 'Company Information';

      formHeader.appendChild(formTitle);

      const formContainer = document.createElement('div');
      formContainer.className = 'company-form-container p-8';

      const resultContainer = document.createElement('div');
      resultContainer.id = 'form-result-container';
      resultContainer.className = 'hidden';

      formCard.appendChild(formHeader);
      formCard.appendChild(resultContainer);
      formCard.appendChild(formContainer);

      wrapper.appendChild(header);
      wrapper.appendChild(formCard);
      container.appendChild(wrapper);

      return container;
    }

    #addCustomButtons() {
      const form = document.querySelector('.company-form-container form');
      if (!form) return;

      const existingSubmitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      existingSubmitButtons.forEach(btn => btn.remove());

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

      // Submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold';
      
      const submitIcon = document.createElement('svg');
      submitIcon.className = 'w-5 h-5 mr-2';
      submitIcon.setAttribute('fill', 'none');
      submitIcon.setAttribute('stroke', 'currentColor');
      submitIcon.setAttribute('viewBox', '0 0 24 24');
      submitIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>';
      
      submitButton.appendChild(submitIcon);
      submitButton.appendChild(document.createTextNode('Create Company'));

      // Back button
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow font-semibold';
      backButton.onclick = () => window.location.href = '#internship/company';
      
      const backIcon = document.createElement('svg');
      backIcon.className = 'w-5 h-5 mr-2';
      backIcon.setAttribute('fill', 'none');
      backIcon.setAttribute('stroke', 'currentColor');
      backIcon.setAttribute('viewBox', '0 0 24 24');
      backIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>';
      
      backButton.appendChild(backIcon);
      backButton.appendChild(document.createTextNode('Back to List'));

      buttonContainer.appendChild(submitButton);
      buttonContainer.appendChild(backButton);

      form.appendChild(buttonContainer);
    }

    async #handleSubmit(formData, event, formInstance) {
      try {
        this.#hideFormResult();

        if (!this.#validateFormData(formData)) {
          return;
        }

        const response = await fetch(`${this.rootURL}/curriculum/company/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.error || result?.message || `API Error (${response.status})`);
        }

        this.#showFormSuccess('Company created successfully!', result);

        setTimeout(() => {
          if (this.formRender) {
            this.formRender.reset();
            this.#hideFormResult();

            const form = document.querySelector('.company-form-container form');
            const firstField = form?.querySelector('input[name="company_name"]');
            if (firstField) firstField.focus();
          }
        }, 3000);

      } catch (error) {
        console.error('Form submission error:', error);
        this.#showFormError(error.message, error);
      }
    }

    #validateFormData(formData) {
      const requiredFields = ['company_name'];
      const missing = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

      if (missing.length > 0) {
        this.#showFormError('Please fill required field: Company Name');
        return false;
      }

      return true;
    }

    #showFormSuccess(message, data) {
      const container = document.getElementById('form-result-container');
      if (!container) return;

      container.className = 'mx-8 mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-2xl';
      container.innerHTML = `
        <div class="flex items-start">
          <svg class="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-green-800">${message}</h3>
            ${data?.result ? `<p class="text-sm text-green-600 mt-1">Company ID: ${data.result.ID || data.result.id}</p>` : ''}
          </div>
        </div>
      `;
    }

    #showFormError(message) {
      const container = document.getElementById('form-result-container');
      if (!container) return;

      container.className = 'mx-8 mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl';
      container.innerHTML = `
        <div class="flex items-start">
          <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-800">Error</h3>
            <p class="text-sm text-red-600 mt-1">${message}</p>
          </div>
        </div>
      `;
    }

    #hideFormResult() {
      const container = document.getElementById('form-result-container');
      if (container) {
        container.className = 'hidden';
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4 flex gap-3">
                <button onclick="window.location.reload()" 
                        class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Retry
                </button>
                <button onclick="window.location.href='#internship/company'" 
                        class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Back to company
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    destroy() {
      if (this.formRender) {
        this.formRender.destroy();
        this.formRender = null;
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.CurriculumCompanyCreateFeature = CurriculumCompanyCreateFeature;
  }
}