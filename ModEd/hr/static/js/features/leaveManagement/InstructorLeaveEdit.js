// Instructor Leave Edit Feature
if (typeof window !== 'undefined' && !window.HrInstructorLeaveEditFeature) {
  class HrInstructorLeaveEditFeature {
    constructor(templateEngine, rootURL, requestId) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.requestId = Number(requestId);
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.instructors = [];
      this.request = null;
    }

    async render() {
      try {
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
          'Edit Instructor Leave',
          'Loading leave request...'
        );

        await Promise.all([
          this.#loadInstructors(),
          this.#loadRequest()
        ]);

        this.#renderFormLayout();
        this.#attachEventListeners();

        if (this.request && this.request.Status && this.request.Status !== 'Pending') {
          this.#setStatus(`This request is currently ${this.request.Status}. Only pending requests can be modified.`, 'info');
          const submitButton = document.querySelector('#instructorLeaveForm button[type="submit"]');
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('opacity-60', 'cursor-not-allowed');
          }
        }
      } catch (error) {
        console.error('Error rendering instructor leave edit form:', error);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_edit_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Request',
          message: error.message || 'Unable to load the selected leave request.',
          hasRetry: true,
          retryAction: `hrApp.renderEditInstructorLeave({ id: ${this.requestId} })`,
          backLink: 'hr/leave/instructor',
          backLabel: 'Back to Instructor Leave'
        });
      }
    }

    async #loadInstructors() {
      const response = await this.apiService.fetchInstructors();
      this.instructors = response?.result || response || [];
    }

    async #loadRequest() {
      if (!Number.isFinite(this.requestId)) {
        throw new Error('Invalid leave request id');
      }
      this.request = await this.apiService.fetchInstructorLeaveRequest(this.requestId);
    }

    #renderFormLayout() {
      this.templateEngine.mainContainer.innerHTML = '';

      const wrapper = HrUiComponents.createEditFormPageWrapper({
        title: 'Edit Instructor Leave Request',
        description: `Update request #${this.requestId}`,
        icon: HrUiComponents.iconPaths.instructor,
        gradientFrom: 'purple-600',
        gradientTo: 'indigo-600',
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        formTitle: 'Request Details',
        containerSelector: '.instructor-leave-edit-container',
        backLink: 'hr/leave/instructor',
        backLabel: 'Back to Instructor Leave'
      });

      this.templateEngine.mainContainer.appendChild(wrapper);

      const container = wrapper.querySelector('.instructor-leave-edit-container');
      if (!container) {
        throw new Error('Edit form container not found');
      }

      container.innerHTML = HrUiComponents.renderInstructorLeaveForm({
        instructors: this.instructors,
        initialData: this.request,
        submitLabel: 'Update Leave Request',
        cancelLabel: 'Back to List',
        cancelRoute: 'hr/leave/instructor',
        statusContainerId: 'formStatus',
        showDelete: true,
        deleteButtonId: 'deleteInstructorLeaveBtn',
        deleteLabel: 'Delete Request',
        disableInstructor: true,
        disableDate: true
      });
    }

    #attachEventListeners() {
      const form = document.getElementById('instructorLeaveForm');
      if (form) {
        form.addEventListener('submit', this.#handleSubmit.bind(this));
      }

      const deleteBtn = document.getElementById('deleteInstructorLeaveBtn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', this.#handleDelete.bind(this));
      }
    }

    async #handleSubmit(event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const payload = {
        id: this.requestId,
        leave_type: formData.get('LeaveType') || '',
        reason: formData.get('Reason') || '',
        status: this.request?.Status || ''
      };

      if (!payload.leave_type || !payload.reason) {
        this.#setStatus('Please fill in all required fields', 'error');
        return;
      }

      try {
        this.#setStatus('Updating leave request...', 'info');
        await this.apiService.updateInstructorLeaveRequest(payload);
        this.#setStatus('Leave request updated successfully!', 'success');

        setTimeout(() => {
          this.templateEngine.routerLinks.navigateTo('hr/leave/instructor');
        }, 1200);
      } catch (error) {
        console.error('Error updating leave request:', error);
        this.#setStatus(`Error: ${error.message}`, 'error');
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_edit_submit' });
        }
      }
    }

    async #handleDelete() {
      const confirmed = window.confirm('Are you sure you want to delete this leave request?');
      if (!confirmed) {
        return;
      }

      try {
        await this.apiService.deleteInstructorLeaveRequest(this.requestId);
        alert('Leave request deleted successfully.');
        this.templateEngine.routerLinks.navigateTo('hr/leave/instructor');
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_edit_delete' });
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

  window.HrInstructorLeaveEditFeature = HrInstructorLeaveEditFeature;
}
