// Student Leave Request Form Feature - Using AdvanceFormRender
if (typeof window !== 'undefined' && !window.HrStudentLeaveFormFeature) {
  class HrStudentLeaveFormFeature {
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

        // Set up container
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Student Leave Request</h1>
                <p class="text-gray-600">Submit a new leave request for a student</p>
              </div>
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <div id="form-container"></div>
              </div>
              <div class="mt-6 text-center">
                <a routerLink="hr/leave/student" class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Back to Student Leave Requests
                </a>
              </div>
            </div>
          </div>
        `;

        // Create form using AdvanceFormRender
        this.form = new window.AdvanceFormRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveStudent',
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
        console.error('Error rendering student leave form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_form_render' });
        }
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 class="text-lg font-semibold text-red-800">Error Loading Leave Form</h2>
                <p class="text-red-600 mt-2">${error.message || 'Unable to load student leave form.'}</p>
                <div class="mt-4">
                  <a routerLink="hr/leave" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Back to Leave Management
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    async #handleSubmit(formData) {
      try {
        // Validate required fields
        if (!formData.student_code || !formData.leave_type || !formData.leave_date || !formData.reason) {
          this.form.showFormError('Please fill in all required fields');
          return;
        }

        // Show loading state
        this.form.showFormSuccess('Submitting leave request...');

        // Submit to API
        const response = await this.apiService.createStudentLeaveRequest({
          student_code: formData.student_code,
          leave_type: formData.leave_type,
          leave_date: formData.leave_date,
          reason: formData.reason
        });

        // Show success message
        this.form.showFormSuccess('Leave request submitted successfully!');

        // Redirect after short delay
        setTimeout(() => {
          if (this.templateEngine.routerLinks && this.templateEngine.routerLinks.navigateTo) {
            this.templateEngine.routerLinks.navigateTo('hr/leave/student');
          } else {
            window.location.href = `${this.rootURL}/hr/leave/student`;
          }
        }, 1500);

      } catch (error) {
        console.error('Error submitting leave request:', error);
        this.form.showFormError(`Error: ${error.message || 'Failed to submit leave request'}`);

        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_submit' });
        }
      }
    }
  }

  window.HrStudentLeaveFormFeature = HrStudentLeaveFormFeature;
}
