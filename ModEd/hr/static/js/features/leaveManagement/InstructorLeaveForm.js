// Instructor Leave Request Form Feature - Using AdvanceFormRender
if (typeof window !== 'undefined' && !window.HrInstructorLeaveFormFeature) {
  class HrInstructorLeaveFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.form = null;
    }

    async render() {
      try {
        // Ensure templates are loaded
        if (!this.templateEngine.template) {
          await this.templateEngine.fetchTemplate();
        }

        // Set up container using DOM APIs (no HTML strings)
        this.templateEngine.mainContainer.innerHTML = '';
        
        const pageContainer = this.#createPageContainer();
        this.templateEngine.mainContainer.appendChild(pageContainer);

        // Create form using AdvanceFormRender
        this.form = new window.AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveInstructor',
          targetSelector: '#form-container',
          submitHandler: async (formData) => {
            await this.#handleSubmit(formData);
          },
          autoFocus: true,
          validateOnBlur: true
        });

        await this.form.render();

        // Override showFormError and showFormSuccess to avoid DOMObject prepend issues
        const originalShowFormError = this.form.showFormError.bind(this.form);
        const originalShowFormSuccess = this.form.showFormSuccess.bind(this.form);
        
        this.form.showFormError = (message) => {
          this.form.clearFormMessages();
          const errorDiv = document.createElement('div');
          errorDiv.className = 'form-error';
          errorDiv.textContent = message;
          if (this.form && this.form.html) {
            const formElement = this.form.html;
            try {
              if (formElement.firstChild) {
                Node.prototype.insertBefore.call(formElement, errorDiv, formElement.firstChild);
              } else {
                Node.prototype.appendChild.call(formElement, errorDiv);
              }
            } catch (e) {
              console.error('Error inserting error message:', e);
              if (formElement.appendChild) {
                formElement.appendChild(errorDiv);
              }
            }
          }
        };

        this.form.showFormSuccess = (message) => {
          this.form.clearFormMessages();
          const successDiv = document.createElement('div');
          successDiv.className = 'form-success';
          successDiv.textContent = message;
          if (this.form && this.form.html) {
            const formElement = this.form.html;
            try {
              if (formElement.firstChild) {
                Node.prototype.insertBefore.call(formElement, successDiv, formElement.firstChild);
              } else {
                Node.prototype.appendChild.call(formElement, successDiv);
              }
            } catch (e) {
              console.error('Error inserting success message:', e);
              if (formElement.appendChild) {
                formElement.appendChild(successDiv);
              }
            }
          }
        };

      } catch (error) {
        console.error('Error rendering instructor leave form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_form_render' });
        }
        this.templateEngine.mainContainer.innerHTML = '';
        const errorPage = this.#createErrorPage(error.message || 'Unable to load instructor leave form.');
        this.templateEngine.mainContainer.appendChild(errorPage);
      }
    }

    #createPageContainer() {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-4xl mx-auto px-4';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'mb-6';
      
      const h1 = document.createElement('h1');
      h1.className = 'text-3xl font-bold text-gray-900 mb-2';
      h1.textContent = 'Instructor Leave Request';
      
      const p = document.createElement('p');
      p.className = 'text-gray-600';
      p.textContent = 'Submit a new leave request for an instructor';
      
      headerDiv.appendChild(h1);
      headerDiv.appendChild(p);
      
      const formContainerDiv = document.createElement('div');
      formContainerDiv.className = 'bg-white rounded-2xl shadow-lg p-6';
      
      const formDiv = document.createElement('div');
      formDiv.id = 'form-container';
      formContainerDiv.appendChild(formDiv);
      
      const backButtonContainer = document.createElement('div');
      backButtonContainer.className = 'mt-6 text-center';
      
      const backLink = document.createElement('a');
      backLink.className = 'inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200';
      backLink.setAttribute('routerLink', 'hr/leave/instructor');
      backLink.textContent = 'Back to Instructor Leave Requests';
      backButtonContainer.appendChild(backLink);
      
      innerDiv.appendChild(headerDiv);
      innerDiv.appendChild(formContainerDiv);
      innerDiv.appendChild(backButtonContainer);
      pageDiv.appendChild(innerDiv);
      
      return pageDiv;
    }
    
    #createErrorPage(message) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-4xl mx-auto px-4';
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-6';
      
      const h2 = document.createElement('h2');
      h2.className = 'text-lg font-semibold text-red-800';
      h2.textContent = 'Error Loading Leave Form';
      
      const p = document.createElement('p');
      p.className = 'text-red-600 mt-2';
      p.textContent = message;
      
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'mt-4';
      
      const backLink = document.createElement('a');
      backLink.className = 'inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50';
      backLink.setAttribute('routerLink', 'hr/leave');
      backLink.textContent = 'Back to Leave Management';
      buttonDiv.appendChild(backLink);
      
      errorDiv.appendChild(h2);
      errorDiv.appendChild(p);
      errorDiv.appendChild(buttonDiv);
      innerDiv.appendChild(errorDiv);
      pageDiv.appendChild(innerDiv);
      
      return pageDiv;
    }

    async #handleSubmit(formData) {
      try {
        // Validate required fields
        if (!formData.instructor_code || !formData.leave_type || !formData.leave_date || !formData.reason) {
          this.form.showFormError('Please fill in all required fields');
          return;
        }

        // Show loading state
        this.form.showFormSuccess('Submitting leave request...');

        // Submit to API - transform date if needed
        const payload = {
          InstructorCode: formData.instructor_code,
          LeaveType: formData.leave_type,
          DateStr: formData.leave_date, // API expects DateStr
          Reason: formData.reason
        };

        const response = await this.apiService.createInstructorLeaveRequest(payload);

        // Show success message
        this.form.showFormSuccess('Leave request submitted successfully!');

        // Redirect after short delay
        setTimeout(() => {
          if (this.templateEngine.routerLinks && this.templateEngine.routerLinks.navigateTo) {
            this.templateEngine.routerLinks.navigateTo('hr/leave/instructor');
          } else {
            window.location.href = `${this.rootURL}/hr/leave/instructor`;
          }
        }, 1500);

      } catch (error) {
        console.error('Error submitting leave request:', error);
        this.form.showFormError(`Error: ${error.message || 'Failed to submit leave request'}`);

        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_submit' });
        }
      }
    }
  }

  window.HrInstructorLeaveFormFeature = HrInstructorLeaveFormFeature;
}
