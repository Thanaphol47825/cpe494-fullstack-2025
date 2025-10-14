// Instructor Leave Request Form Feature
if (typeof window !== 'undefined' && !window.HrInstructorLeaveFormFeature) {
  class HrInstructorLeaveFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
    }

    async render() {
      try {
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
          'Instructor Leave Request',
          'Loading leave form...'
        );

        const instructorsResponse = await this.apiService.fetchInstructors();
        const instructors = instructorsResponse?.result || instructorsResponse || [];

        this.#renderFormLayout(instructors);
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering instructor leave form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_form_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Form',
          message: error.message || 'Unable to load instructor leave form.',
          hasRetry: true,
          retryAction: 'hrApp.renderCreateInstructorLeave()',
          backLink: 'hr/leave',
          backLabel: 'Back to Leave Management'
        });
      }
    }

    #renderFormLayout(instructors) {
      this.templateEngine.mainContainer.innerHTML = '';

      const wrapper = HrUiComponents.createFormPageWrapper({
        title: 'Instructor Leave Request',
        description: 'Submit a new leave request for an instructor',
        icon: HrUiComponents.iconPaths.instructor,
        gradientFrom: 'purple-600',
        gradientTo: 'indigo-600',
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        formTitle: 'Request Details',
        containerSelector: '.instructor-leave-form-container',
        backLink: 'hr/leave',
        backLabel: 'Back to Leave Management'
      });

      this.templateEngine.mainContainer.appendChild(wrapper);

      const container = wrapper.querySelector('.instructor-leave-form-container');
      if (!container) {
        throw new Error('Instructor leave form container not found');
      }

      container.innerHTML = HrUiComponents.renderInstructorLeaveForm({
        instructors,
        submitLabel: 'Submit Leave Request',
        cancelLabel: 'Cancel',
        cancelRoute: 'hr/leave/instructor',
        statusContainerId: 'formStatus'
      });
    }

    #attachEventListeners() {
      const form = document.getElementById('instructorLeaveForm');
      if (form) {
        form.addEventListener('submit', this.#handleSubmit.bind(this));
      }
    }

    async #handleSubmit(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const payload = {
        InstructorCode: formData.get('InstructorCode'),
        LeaveType: formData.get('LeaveType'),
        DateStr: formData.get('DateStr'),
        Reason: formData.get('Reason')
      };

      // Validate
      if (!payload.InstructorCode || !payload.LeaveType || !payload.DateStr || !payload.Reason) {
        this.#setStatus('Please fill in all required fields', 'error');
        return;
      }

      try {
        this.#setStatus('Submitting leave request...', 'info');
        
        const response = await this.apiService.createInstructorLeaveRequest(payload);
        
        this.#setStatus('Leave request submitted successfully!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
          this.templateEngine.routerLinks.navigateTo('hr/leave/instructor');
        }, 1500);
        
      } catch (error) {
        console.error('Error submitting leave request:', error);
        this.#setStatus(`Error: ${error.message}`, 'error');
        
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_submit' });
        }
      }
    }

    #setStatus(message, type = 'info') {
      const statusEl = document.getElementById('formStatus');
      if (!statusEl) return;

      const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
      };

      statusEl.className = `border rounded-lg p-4 ${styles[type] || styles.info}`;
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');

      if (type === 'success') {
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
      }
    }
  }

  window.HrInstructorLeaveFormFeature = HrInstructorLeaveFormFeature;
}
