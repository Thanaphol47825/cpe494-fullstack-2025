// Student Leave Request Form Feature
if (typeof window !== 'undefined' && !window.HrStudentLeaveFormFeature) {
  class HrStudentLeaveFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
    }

    async render() {
      try {
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
          'Student Leave Request',
          'Loading leave form...'
        );

        const studentsResponse = await this.apiService.fetchStudents();
        const students = studentsResponse?.result || studentsResponse || [];

        this.#renderFormLayout(students);
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering student leave form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_form_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Form',
          message: error.message || 'Unable to load student leave form.',
          hasRetry: true,
          retryAction: 'hrApp.renderCreateStudentLeave()',
          backLink: 'hr/leave',
          backLabel: 'Back to Leave Management'
        });
      }
    }

    #renderFormLayout(students) {
      this.templateEngine.mainContainer.innerHTML = '';

      const formWrapper = HrUiComponents.createFormPageWrapper({
        title: 'Student Leave Request',
        description: 'Submit a new leave request for a student',
        icon: HrUiComponents.iconPaths.student,
        gradientFrom: 'blue-600',
        gradientTo: 'indigo-600',
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        formTitle: 'Request Details',
        containerSelector: '.student-leave-form-container',
        backLink: 'hr/leave',
        backLabel: 'Back to Leave Management'
      });

      this.templateEngine.mainContainer.appendChild(formWrapper);

      const container = formWrapper.querySelector('.student-leave-form-container');
      if (!container) {
        throw new Error('Leave form container not found');
      }

      container.innerHTML = HrUiComponents.renderStudentLeaveForm({
        students,
        submitLabel: 'Submit Leave Request',
        cancelLabel: 'Cancel',
        cancelRoute: 'hr/leave/student',
        statusContainerId: 'formStatus'
      });
    }

    #attachEventListeners() {
      const form = document.getElementById('studentLeaveForm');
      if (form) {
        form.addEventListener('submit', this.#handleSubmit.bind(this));
      }
    }

    async #handleSubmit(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const payload = {
        student_code: formData.get('student_code'),
        leave_type: formData.get('leave_type'),
        leave_date: formData.get('leave_date'),
        reason: formData.get('reason')
      };

      // Validate
      if (!payload.student_code || !payload.leave_type || !payload.leave_date || !payload.reason) {
        this.#setStatus('Please fill in all required fields', 'error');
        return;
      }

      try {
        this.#setStatus('Submitting leave request...', 'info');
        
        const response = await this.apiService.createStudentLeaveRequest(payload);
        
        this.#setStatus('Leave request submitted successfully!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
          this.templateEngine.routerLinks.navigateTo('hr/leave/student');
        }, 1500);
        
      } catch (error) {
        console.error('Error submitting leave request:', error);
        this.#setStatus(`Error: ${error.message}`, 'error');
        
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_submit' });
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

  window.HrStudentLeaveFormFeature = HrStudentLeaveFormFeature;
}
