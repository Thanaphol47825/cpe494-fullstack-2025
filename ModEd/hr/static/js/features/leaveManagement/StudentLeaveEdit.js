// Student Leave Edit Feature
if (typeof window !== 'undefined' && !window.HrStudentLeaveEditFeature) {
  class HrStudentLeaveEditFeature {
    constructor(templateEngine, rootURL, requestId) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.requestId = Number(requestId);
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.students = [];
      this.request = null;
    }

    async render() {
      try {
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
          'Edit Student Leave',
          'Loading leave request...'
        );

        await Promise.all([
          this.#loadStudents(),
          this.#loadRequest()
        ]);

        this.#renderFormLayout();
        this.#attachEventListeners();

        if (this.request && this.request.Status && this.request.Status !== 'Pending') {
          this.#setStatus(`This request is currently ${this.request.Status}. Only pending requests can be modified.`, 'info');
          const submitButton = document.querySelector('#studentLeaveForm button[type="submit"]');
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('opacity-60', 'cursor-not-allowed');
          }
        }
      } catch (error) {
        console.error('Error rendering student leave edit form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_edit_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Request',
          message: error.message || 'Unable to load the selected leave request.',
          hasRetry: true,
          retryAction: `hrApp.renderEditStudentLeave({ id: ${this.requestId} })`,
          backLink: 'hr/leave/student',
          backLabel: 'Back to Student Leave'
        });
      }
    }

    async #loadStudents() {
      const response = await this.apiService.fetchStudents();
      this.students = response?.result || response || [];
    }

    async #loadRequest() {
      if (!Number.isFinite(this.requestId)) {
        throw new Error('Invalid leave request id');
      }
      this.request = await this.apiService.fetchStudentLeaveRequest(this.requestId);
    }

    #renderFormLayout() {
      this.templateEngine.mainContainer.innerHTML = '';

      const wrapper = HrUiComponents.createEditFormPageWrapper({
        title: 'Edit Student Leave Request',
        description: `Update request #${this.requestId}`,
        icon: HrUiComponents.iconPaths.student,
        gradientFrom: 'blue-600',
        gradientTo: 'indigo-600',
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        formTitle: 'Request Details',
        containerSelector: '.student-leave-edit-container',
        backLink: 'hr/leave/student',
        backLabel: 'Back to Student Leave'
      });

      this.templateEngine.mainContainer.appendChild(wrapper);

      const container = wrapper.querySelector('.student-leave-edit-container');
      if (!container) {
        throw new Error('Edit form container not found');
      }

      container.innerHTML = HrUiComponents.renderStudentLeaveForm({
        students: this.students,
        initialData: this.request,
        submitLabel: 'Update Leave Request',
        cancelLabel: 'Back to List',
        cancelRoute: 'hr/leave/student',
        showDelete: true,
        statusContainerId: 'formStatus',
        deleteButtonId: 'deleteRequestBtn',
        deleteLabel: 'Delete Request'
      });
    }

    #attachEventListeners() {
      const form = document.getElementById('studentLeaveForm');
      if (form) {
        form.addEventListener('submit', this.#handleSubmit.bind(this));
      }

      const deleteBtn = document.getElementById('deleteRequestBtn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', this.#handleDelete.bind(this));
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

      if (!payload.student_code || !payload.leave_type || !payload.leave_date || !payload.reason) {
        this.#setStatus('Please fill in all required fields', 'error');
        return;
      }

      try {
        this.#setStatus('Updating leave request...', 'info');
        await this.apiService.editStudentLeaveRequest(this.requestId, payload);
        this.#setStatus('Leave request updated successfully!', 'success');
        setTimeout(() => {
          this.templateEngine.routerLinks.navigateTo('hr/leave/student');
        }, 1200);
      } catch (error) {
        console.error('Error updating leave request:', error);
        this.#setStatus(`Error: ${error.message}`, 'error');
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_edit_submit' });
        }
      }
    }

    async #handleDelete() {
      const confirmed = window.confirm('Are you sure you want to delete this leave request?');
      if (!confirmed) {
        return;
      }

      try {
        await this.apiService.deleteStudentLeaveRequest(this.requestId);
        alert('Leave request deleted successfully.');
        this.templateEngine.routerLinks.navigateTo('hr/leave/student');
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_edit_delete' });
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

  window.HrStudentLeaveEditFeature = HrStudentLeaveEditFeature;
}
