// Student Resignation Form Feature using DOM helpers
if (typeof HrStudentResignationFormFeature === 'undefined') {
  class HrStudentResignationFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.api = new HrApiService(this.rootURL);
      this.formElement = null;
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
        await this.#createResignationForm();
        return true;
      } catch (error) {
        console.error('Error rendering student resignation form:', error);
        this.#showError('Failed to load form: ' + error.message);
        return false;
      } finally {
        this._isRendering = false;
      }
    }

    async #createResignationForm() {
      const pageWrapper = HrUiComponents.createFormPageWrapper({
        title: 'Submit Student Resignation',
        description: 'Create a student resignation request',
        icon: HrUiComponents.iconPaths?.student || HrUiComponents.iconPaths.add,
        gradientFrom: 'orange-600',
        gradientTo: 'red-600',
        bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
        formTitle: 'Resignation Information',
        containerSelector: '.student-resignation-form-container',
        backLink: 'hr',
        backLabel: 'Back to HR Menu'
      });

      const helpers = window.HrDOMHelpers;
      if (helpers && typeof helpers.replaceContent === 'function') {
        helpers.replaceContent(this.templateEngine.mainContainer, pageWrapper);
      } else {
        this.templateEngine.mainContainer.innerHTML = '';
        this.templateEngine.mainContainer.appendChild(pageWrapper);
      }

      const formContainer = pageWrapper.querySelector('.student-resignation-form-container');
      if (!formContainer) {
        throw new Error('Form container not found in template');
      }

      formContainer.innerHTML = '';
      this.formElement = this.#createFormElement();
      formContainer.appendChild(this.formElement);
    }

    #createFormElement() {
      const form = document.createElement('form');
      form.id = 'studentResignationForm';
      form.className = 'space-y-6';

      form.appendChild(this.#createTextInput({
        id: 'StudentCode',
        name: 'StudentCode',
        label: 'Student Code',
        placeholder: 'Enter student code (e.g., STD001)',
        required: true
      }));

      form.appendChild(this.#createTextarea({
        id: 'Reason',
        name: 'Reason',
        label: 'Reason for Resignation',
        placeholder: 'Please provide detailed reason for resignation',
        required: true
      }));

      form.appendChild(this.#createActionButtons());
      form.addEventListener('submit', (event) => this.#handleSubmit(event));

      setTimeout(() => {
        const firstField = form.querySelector('input[name="StudentCode"]');
        if (firstField) firstField.focus();
      }, 100);

      return form;
    }

    #createTextInput({ id, name, label, placeholder, required }) {
      const wrapper = document.createElement('div');
      const labelElement = document.createElement('label');
      labelElement.setAttribute('for', id);
      labelElement.className = 'block text-sm font-medium text-gray-700 mb-2';
      labelElement.innerHTML = `${label} ${required ? '<span class="text-red-500">*</span>' : ''}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = id;
      input.name = name;
      input.placeholder = placeholder;
      input.required = !!required;
      input.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors';

      wrapper.appendChild(labelElement);
      wrapper.appendChild(input);
      return wrapper;
    }

    #createTextarea({ id, name, label, placeholder, required }) {
      const wrapper = document.createElement('div');
      const labelElement = document.createElement('label');
      labelElement.setAttribute('for', id);
      labelElement.className = 'block text-sm font-medium text-gray-700 mb-2';
      labelElement.innerHTML = `${label} ${required ? '<span class="text-red-500">*</span>' : ''}`;

      const textarea = document.createElement('textarea');
      textarea.id = id;
      textarea.name = name;
      textarea.rows = 4;
      textarea.placeholder = placeholder;
      textarea.required = !!required;
      textarea.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none';

      wrapper.appendChild(labelElement);
      wrapper.appendChild(textarea);
      return wrapper;
    }

    #createActionButtons() {
      const container = document.createElement('div');
      container.className = 'flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200';

      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = HrUiComponents.buttonClasses.success;
      submitButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.add}
        </svg>
        Submit Resignation
      `;

      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.id = 'resetButton';
      resetButton.className = HrUiComponents.buttonClasses.secondary;
      resetButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.reset}
        </svg>
        Reset Form
      `;

      resetButton.addEventListener('click', () => this.#resetForm());

      container.appendChild(submitButton);
      container.appendChild(resetButton);
      return container;
    }

    async #handleSubmit(event) {
      event.preventDefault();
      HrUiComponents.hideFormResult();

      if (!this.formElement) {
        throw new Error('Form element is not ready');
      }

      const formData = this.#collectFormData(this.formElement);
      if (!this.#validateFormData(formData)) {
        return;
      }

      const payload = this.#transformPayload(formData);
      this.#showInfo('Submitting resignation request...');

      try {
        const result = await this.api.createStudentResignation(payload);
        HrUiComponents.showFormSuccess('Student resignation request submitted successfully!', result);
        setTimeout(() => this.#resetForm(), 2000);
      } catch (error) {
        console.error('Student resignation submission error:', error);
        HrUiComponents.showFormError(error.message || 'Failed to submit resignation request', error);
      }
    }

    #collectFormData(form) {
      const formData = new FormData(form);
      const data = {};
      for (const [key, value] of formData.entries()) {
        data[key] = typeof value === 'string' ? value.trim() : value;
      }
      return data;
    }

    #resetForm() {
      if (!this.formElement) return;
      this.formElement.reset();
      HrUiComponents.hideFormResult();

      const firstField = this.formElement.querySelector('input[name="StudentCode"]');
      if (firstField) {
        setTimeout(() => firstField.focus(), 100);
      }
    }

    #validateFormData(formData) {
      const missing = ['StudentCode', 'Reason'].filter((field) => !formData[field]);
      if (missing.length > 0) {
        HrUiComponents.showFormError(`Please fill required fields: ${missing.join(', ')}`);
        return false;
      }
      return true;
    }

    #transformPayload(payload) {
      return {
        StudentCode: payload.StudentCode || '',
        Reason: payload.Reason || ''
      };
    }

    #showInfo(message) {
      const resultBox = document.getElementById('formResultBox');
      if (!resultBox) return;

      const resultHeader = document.getElementById('formResultHeader');
      const resultIcon = document.getElementById('formResultIcon');
      const resultTitle = document.getElementById('formResultTitle');
      const resultContent = document.getElementById('formResultContent');

      resultBox.classList.remove('hidden');
      if (resultHeader) {
        resultHeader.className = 'px-6 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200';
      }
      if (resultIcon) {
        resultIcon.innerHTML = `
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${HrUiComponents.iconPaths.loading}
          </svg>
        `;
      }
      if (resultTitle) {
        resultTitle.textContent = 'Please wait';
      }
      if (resultContent) {
        resultContent.innerHTML = `<p class="text-sm text-orange-700">${message}</p>`;
      }
    }

    #showError(message) {
      const helpers = window.HrDOMHelpers;
      if (helpers && typeof helpers.createErrorPage === 'function') {
        const errorPage = helpers.createErrorPage({
          message,
          backUrl: `${this.rootURL}/hr`,
          retryButtonClass: HrUiComponents.buttonClasses.danger,
          backButtonClass: HrUiComponents.buttonClasses.secondary
        });
        helpers.replaceContent(this.templateEngine.mainContainer, errorPage);
        return;
      }

      const container = this.templateEngine.mainContainer;
      container.innerHTML = '';

      const wrapper = document.createElement('div');
      wrapper.className = 'min-h-screen bg-gray-50 py-8';

      const inner = document.createElement('div');
      inner.className = 'max-w-4xl mx-auto px-4';

      const card = document.createElement('div');
      card.className = 'bg-red-50 border border-red-200 rounded-lg p-6';

      const title = document.createElement('h2');
      title.className = 'text-lg font-semibold text-red-800';
      title.textContent = 'Error Loading Form';

      const msg = document.createElement('p');
      msg.className = 'text-red-600 mt-2';
      msg.textContent = message;

      const buttons = document.createElement('div');
      buttons.className = 'mt-4 flex gap-3';

      const retryBtn = document.createElement('button');
      retryBtn.className = HrUiComponents.buttonClasses.danger;
      retryBtn.textContent = 'Retry';
      retryBtn.onclick = () => window.location.reload();

      const backBtn = document.createElement('button');
      backBtn.className = HrUiComponents.buttonClasses.secondary;
      backBtn.textContent = 'Back to HR Menu';
      backBtn.onclick = () => window.location.href = `${this.rootURL}/hr`;

      buttons.appendChild(retryBtn);
      buttons.appendChild(backBtn);
      card.appendChild(title);
      card.appendChild(msg);
      card.appendChild(buttons);
      inner.appendChild(card);
      wrapper.appendChild(inner);
      container.appendChild(wrapper);
    }
  }

  if (typeof window !== 'undefined') {
    window.HrStudentResignationFormFeature = HrStudentResignationFormFeature;
  }
}
