// Instructor Resignation Form Feature using DOM helpers
if (typeof HrInstructorResignationFormFeature === 'undefined') {
  class HrInstructorResignationFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.api = new HrApiService(this.rootURL);
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
        await this.#createResignationForm();
        return true;
      } catch (error) {
        console.error('Error rendering instructor resignation form:', error);
        this.#showError('Failed to load form: ' + error.message);
        return false;
      } finally {
        this._isRendering = false;
      }
    }

    async #createResignationForm() {
      const pageWrapper = HrUiComponents.createFormPageWrapper({
        title: 'Submit Instructor Resignation',
        description: 'Create a resignation request for instructors with a guided form experience',
        icon: HrUiComponents.iconPaths?.instructor || HrUiComponents.iconPaths.add,
        gradientFrom: 'orange-600',
        gradientTo: 'red-600',
        bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
        formTitle: 'Resignation Information',
        containerSelector: '.instructor-resignation-form-container',
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

      const formContainer = pageWrapper.querySelector('.instructor-resignation-form-container');
      if (!formContainer) {
        throw new Error('Form container not found in template');
      }

      if (!window.AdvanceFormRender) {
        throw new Error('AdvanceFormRender is required to render the form');
      }

      this.formRender = new window.AdvanceFormRender(this.templateEngine, {
        schema: this.#getFormSchema(),
        targetSelector: '.instructor-resignation-form-container',
        submitHandler: (formData) => this.#handleSubmit(formData),
        config: {
          autoFocus: true,
          showErrors: false,
          validateOnBlur: false
        }
      });

      await this.formRender.render();
      this.#overrideRendererMessages();
      this.#attachCustomButtons();
    }


    async #handleSubmit(formData) {
      HrUiComponents.hideFormResult();
      if (!this.#validateFormData(formData)) {
        return;
      }

      const payload = this.#transformPayload(formData);
      this.#showInfo('Submitting resignation request...');

      try {
        const result = await this.api.createInstructorResignation(payload);
        HrUiComponents.showFormSuccess('Instructor resignation request submitted successfully!', result);
        setTimeout(() => this.#resetForm(), 2000);
      } catch (error) {
        console.error('Instructor resignation submission error:', error);
        HrUiComponents.showFormError(error.message || 'Failed to submit resignation request', error);
      }
    }

    #resetForm() {
      if (this.formRender && typeof this.formRender.reset === 'function') {
        this.formRender.reset();
      }
      HrUiComponents.hideFormResult();

      const firstField = document.querySelector('.instructor-resignation-form-container input[name="InstructorCode"]');
      if (firstField) {
        setTimeout(() => firstField.focus(), 100);
      }
    }

    #validateFormData(formData) {
      const requiredFields = ['InstructorCode', 'Reason'];
      const missing = requiredFields.filter(field => !formData[field]);

      if (missing.length > 0) {
        HrUiComponents.showFormError(`Please fill required fields: ${missing.join(', ')}`);
        return false;
      }

      return true;
    }

    #transformPayload(payload) {
      const transformed = {
        InstructorCode: payload.InstructorCode || payload.instructor_code || '',
        Reason: payload.Reason || payload.reason || '',
        AdditionalNotes: payload.AdditionalNotes || payload.additional_notes || null
      };

      Object.keys(transformed).forEach((key) => {
        if (typeof transformed[key] === 'string') {
          transformed[key] = transformed[key].trim();
        }
        if (transformed[key] === '') {
          transformed[key] = null;
        }
      });

      return transformed;
    }

    #getFormSchema() {
      return [
        {
          name: 'InstructorCode',
          label: 'Instructor Code',
          type: 'text',
          placeholder: 'Enter instructor code (e.g., INS001)',
          required: true
        },
        {
          name: 'Reason',
          label: 'Reason for Resignation',
          type: 'textarea',
          placeholder: 'Please provide detailed reason for resignation',
          rows: 4,
          required: true
        }
      ];
    }

    #overrideRendererMessages() {
      if (!this.formRender) return;
      this.formRender.showFormError = (message) => HrUiComponents.showFormError(message);
      this.formRender.showFormSuccess = (message, detail) => HrUiComponents.showFormSuccess(message, detail);
    }

    #attachCustomButtons() {
      const form = document.querySelector('.instructor-resignation-form-container form');
      if (!form) return;

      const defaultButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      defaultButtons.forEach((button) => button.remove());

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
      form.appendChild(container);
    }

    #showInfo(message) {
      const resultBox = document.getElementById('formResultBox');
      const resultHeader = document.getElementById('formResultHeader');
      const resultIcon = document.getElementById('formResultIcon');
      const resultTitle = document.getElementById('formResultTitle');
      const resultContent = document.getElementById('formResultContent');

      if (!resultBox || !resultHeader || !resultIcon || !resultTitle || !resultContent) {
        return;
      }

      resultBox.classList.remove('hidden');
      resultHeader.className = 'px-6 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200';
      resultIcon.innerHTML = `
        <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrUiComponents.iconPaths.loading}
        </svg>
      `;
      resultTitle.textContent = 'Please wait';
      resultContent.innerHTML = `<p class="text-sm text-orange-700">${message}</p>`;
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
    window.HrInstructorResignationFormFeature = HrInstructorResignationFormFeature;
  }
}
