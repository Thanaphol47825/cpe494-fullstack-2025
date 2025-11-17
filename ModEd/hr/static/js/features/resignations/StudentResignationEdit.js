// Student Resignation Edit Feature using DOM helpers
if (typeof HrStudentResignationEditFeature === 'undefined') {
  class HrStudentResignationEditFeature {
    constructor(templateEngine, rootURL, requestId) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || '';
      this.requestId = requestId;
      this.api = new HrApiService(this.rootURL);
      this.resignationData = null;
      this.formElement = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error('Template engine or main container not found');
        return false;
      }

      if (!this.requestId) {
        this.#showError('Resignation ID is required');
        return false;
      }

      try {
        this.#showLoading();
        await this.#loadResignation();
        this.#renderEditForm();
        return true;
      } catch (error) {
        console.error('Error rendering student resignation edit:', error);
        this.#showError('Failed to load resignation: ' + error.message);
        return false;
      }
    }

    async #loadResignation() {
      this.resignationData = await this.api.fetchStudentResignation(this.requestId);
    }

    #renderEditForm() {
      const pageWrapper = HrUiComponents.createEditFormPageWrapper({
        title: 'Edit Student Resignation',
        description: `Request #${this.requestId}`,
        icon: HrUiComponents.iconPaths?.student || HrUiComponents.iconPaths.edit,
        gradientFrom: 'orange-600',
        gradientTo: 'red-600',
        bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
        formTitle: 'Resignation Details',
        containerSelector: '.student-resignation-edit-container',
        backLink: 'hr/resignation/student',
        backLabel: 'Back to Requests'
      });

      const helpers = window.HrDOMHelpers;
      if (helpers && typeof helpers.replaceContent === 'function') {
        helpers.replaceContent(this.templateEngine.mainContainer, pageWrapper);
      } else {
        this.templateEngine.mainContainer.innerHTML = '';
        this.templateEngine.mainContainer.appendChild(pageWrapper);
      }

      const formContainer = pageWrapper.querySelector('.student-resignation-edit-container');
      formContainer.innerHTML = '';
      this.formElement = this.#buildForm();
      formContainer.appendChild(this.formElement);
    }

    #buildForm() {
      const form = document.createElement('form');
      form.id = 'studentResignationEditForm';
      form.className = 'space-y-6';

      form.appendChild(this.#createStatusSelect());
      form.appendChild(this.#createTextInput({
        id: 'StudentCode',
        name: 'StudentCode',
        label: 'Student Code',
        placeholder: 'Enter student code (e.g., STD001)',
        required: true,
        defaultValue: this.#getValue('StudentCode', 'student_code')
      }));
      form.appendChild(this.#createTextarea({
        id: 'Reason',
        name: 'Reason',
        label: 'Reason for Resignation',
        placeholder: 'Provide the detailed reason',
        required: true,
        defaultValue: this.#getValue('Reason', 'reason')
      }));
      form.appendChild(this.#createTextarea({
        id: 'AdditionalNotes',
        name: 'AdditionalNotes',
        label: 'Additional Notes',
        placeholder: 'Optional notes that help reviewers understand the request',
        required: false,
        defaultValue: this.#getValue('AdditionalNotes', 'additional_notes')
      }));

      form.appendChild(this.#createActionButtons());
      form.addEventListener('submit', (event) => this.#handleSubmit(event));

      setTimeout(() => {
        const firstField = form.querySelector('input[name="StudentCode"]');
        if (firstField) firstField.focus();
      }, 100);

      return form;
    }

    #createStatusSelect() {
      const wrapper = document.createElement('div');
      const labelElement = document.createElement('label');
      labelElement.setAttribute('for', 'Status');
      labelElement.className = 'block text-sm font-medium text-gray-700 mb-2';
      labelElement.innerHTML = 'Status <span class="text-red-500">*</span>';

      const select = document.createElement('select');
      select.id = 'Status';
      select.name = 'Status';
      select.required = true;
      select.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors';

      const currentStatus = (this.#getValue('Status', 'status') || 'Pending').toLowerCase();
      this.#getStatusOptions().forEach((option) => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        if (option.value.toLowerCase() === currentStatus) {
          optionEl.selected = true;
        }
        select.appendChild(optionEl);
      });

      wrapper.appendChild(labelElement);
      wrapper.appendChild(select);
      return wrapper;
    }

    #createTextInput({ id, name, label, placeholder, required, defaultValue }) {
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
      input.value = defaultValue || '';
      input.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors';

      wrapper.appendChild(labelElement);
      wrapper.appendChild(input);
      return wrapper;
    }

    #createTextarea({ id, name, label, placeholder, required, defaultValue }) {
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
      textarea.value = defaultValue || '';
      textarea.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none';

      wrapper.appendChild(labelElement);
      wrapper.appendChild(textarea);
      return wrapper;
    }

    #createActionButtons() {
      const container = document.createElement('div');
      container.className = 'flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200';

      const saveButton = document.createElement('button');
      saveButton.type = 'submit';
      saveButton.className = HrUiComponents.buttonClasses.success;
      saveButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.save}
        </svg>
        Save Changes
      `;

      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = HrUiComponents.buttonClasses.secondary;
      cancelButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.cancel}
        </svg>
        Cancel
      `;

      cancelButton.addEventListener('click', () => {
        if (confirm('Discard changes and go back to the list?')) {
          window.location.href = '#hr/resignation/student';
        }
      });

      container.appendChild(saveButton);
      container.appendChild(cancelButton);
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
      this.#showInfo('Updating resignation request...');

      try {
        const result = await this.api.updateStudentResignation(this.requestId, payload);
        HrUiComponents.showFormSuccess('Resignation updated successfully!', result);
        setTimeout(() => {
          window.location.href = '#hr/resignation/student';
        }, 2000);
      } catch (error) {
        console.error('Student resignation update error:', error);
        HrUiComponents.showFormError(error.message || 'Failed to update resignation request', error);
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

    #validateFormData(formData) {
      const missing = ['StudentCode', 'Reason', 'Status'].filter((field) => !formData[field]);
      if (missing.length > 0) {
        HrUiComponents.showFormError(`Please fill required fields: ${missing.join(', ')}`);
        return false;
      }
      return true;
    }

    #transformPayload(payload) {
      return {
        StudentCode: payload.StudentCode || '',
        Reason: payload.Reason || '',
        AdditionalNotes: payload.AdditionalNotes || null,
        Status: payload.Status || this.#getValue('Status', 'status') || 'Pending'
      };
    }

    #showLoading() {
      this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
        'Loading Resignation Request...',
        'Please wait while we load the resignation details for editing.',
        'orange-600',
        'red-600',
        'from-orange-50 via-amber-50 to-yellow-50'
      );
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
          backUrl: `${this.rootURL}/hr/resignation/student`,
          retryButtonClass: HrUiComponents.buttonClasses.danger,
          backButtonClass: HrUiComponents.buttonClasses.secondary,
          backText: 'Back to Requests'
        });
        helpers.replaceContent(this.templateEngine.mainContainer, errorPage);
        return;
      }

      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Resignation</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4 flex gap-3">
                <button onclick="window.location.reload()" class="${HrUiComponents.buttonClasses.danger}">
                  Retry
                </button>
                <button onclick="window.location.href='#hr/resignation/student'" class="${HrUiComponents.buttonClasses.secondary}">
                  Back to Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    #getStatusOptions() {
      return [
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
      ];
    }

    #getValue(preferredKey, fallbackKey) {
      if (!this.resignationData) return '';
      return this.resignationData[preferredKey] ??
        this.resignationData[fallbackKey] ??
        '';
    }
  }

  if (typeof window !== 'undefined') {
    window.HrStudentResignationEditFeature = HrStudentResignationEditFeature;
  }
}

