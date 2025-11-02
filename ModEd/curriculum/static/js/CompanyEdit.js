// Company Edit Feature using AdvanceFormRender (V2)
if (typeof CompanyEdit === 'undefined' && !window.CompanyEdit) {
  class CompanyEdit {
    constructor(templateEngine, rootURL, companyId) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.companyId = companyId;
      this.companyData = null;
      this.formRender = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      this.templateEngine.mainContainer.innerHTML = "";
      await this.#loadCompanyData();
      return true;
    }

    async #loadCompanyData() {
      try {
        this.#showLoading();
        this.companyData = await this.#fetchCompany(this.companyId);
        await this.#createCompanyEditForm();
      } catch (error) {
        console.error('Error loading company data:', error);
        this.#showError('Failed to load company data: ' + error.message);
      }
    }

    async #fetchCompany(id) {
      const response = await fetch(`${this.rootURL}/curriculum/company/get/${id}`);
      const data = await response.json();
      
      if (!data.isSuccess) {
        throw new Error('Failed to fetch company');
      }
      
      return data.result;
    }

    async #createCompanyEditForm() {
      try {
        const pageWrapper = this.#createEditFormPageWrapper();
        this.templateEngine.mainContainer.appendChild(pageWrapper);

        this.formRender = new AdvanceFormRender(this.templateEngine, {
          modelPath: 'curriculum/company',
          targetSelector: '.company-edit-form-container',
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

        this.#populateForm();
        this.#addCustomButtons();

      } catch (error) {
        console.error('Error creating company edit form:', error);
        this.#showError('Failed to load form: ' + error.message);
      }
    }

    #createEditFormPageWrapper() {
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
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>';
      iconContainer.appendChild(icon);

      const headerText = document.createElement('div');
      
      const title = document.createElement('h1');
      title.className = 'text-4xl font-bold';
      title.textContent = 'Edit Company';
      
      const description = document.createElement('p');
      description.className = 'text-blue-100 mt-2 text-lg';
      description.textContent = `Update company record: ${this.companyData?.company_name || this.companyData?.CompanyName || this.companyId}`;

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
      formContainer.className = 'company-edit-form-container p-8';

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

    #populateForm() {
      if (this.formRender && this.companyData) {
        const formData = {
          company_name: this.companyData.company_name || this.companyData.CompanyName || '',
          company_address: this.companyData.company_address || this.companyData.CompanyAddress || ''
        };

        this.formRender.setData(formData);
      }
    }

    #addCustomButtons() {
      const form = document.querySelector('.company-edit-form-container form');
      if (!form) return;

      const existingSubmitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      existingSubmitButtons.forEach(btn => btn.remove());

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

      // Update button
      const updateButton = document.createElement('button');
      updateButton.type = 'submit';
      updateButton.className = 'inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold';
      
      const updateIcon = document.createElement('svg');
      updateIcon.className = 'w-5 h-5 mr-2';
      updateIcon.setAttribute('fill', 'none');
      updateIcon.setAttribute('stroke', 'currentColor');
      updateIcon.setAttribute('viewBox', '0 0 24 24');
      updateIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
      
      updateButton.appendChild(updateIcon);
      updateButton.appendChild(document.createTextNode('Update Company'));

      // Cancel button
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow font-semibold';
      
      const cancelIcon = document.createElement('svg');
      cancelIcon.className = 'w-5 h-5 mr-2';
      cancelIcon.setAttribute('fill', 'none');
      cancelIcon.setAttribute('stroke', 'currentColor');
      cancelIcon.setAttribute('viewBox', '0 0 24 24');
      cancelIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
      
      cancelButton.appendChild(cancelIcon);
      cancelButton.appendChild(document.createTextNode('Cancel'));

      cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
          window.location.href = '#internship/company';
        }
      });

      buttonContainer.appendChild(updateButton);
      buttonContainer.appendChild(cancelButton);

      form.appendChild(buttonContainer);
    }

    async #handleSubmit(formData, event, formInstance) {
      try {
        this.#hideFormResult();

        if (!this.#validateFormData(formData)) {
          return;
        }

        const response = await fetch(`${this.rootURL}/curriculum/company/update/${this.companyId}`, {
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

        this.#showFormSuccess('Company updated successfully!', result);

        setTimeout(() => {
          window.location.href = '#internship/company';
        }, 2000);

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
            <p class="text-sm text-green-600 mt-1">Redirecting to company list...</p>
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

    #showLoading() {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
          <div class="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">Loading Company Data...</h2>
            <p class="mt-2 text-gray-600">Please wait while we load the company information for editing.</p>
          </div>
        </div>
      `;
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Company</h2>
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
    window.CompanyEdit = CompanyEdit;
  }
}