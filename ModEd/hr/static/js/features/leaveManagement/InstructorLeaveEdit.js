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
        this.templateEngine.mainContainer.innerHTML = '';
        const loadingPage = this.#createLoadingPage('Edit Instructor Leave', 'Loading leave request...');
        this.templateEngine.mainContainer.appendChild(loadingPage);

        await Promise.all([
          this.#loadInstructors(),
          this.#loadRequest()
        ]);

        await this.#renderFormLayout();
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
        this.templateEngine.mainContainer.innerHTML = '';
        const errorPage = this.#createErrorPage(
          'Error Loading Leave Request',
          error.message || 'Unable to load the selected leave request.',
          'hr/leave/instructor',
          'Back to Instructor Leave'
        );
        this.templateEngine.mainContainer.appendChild(errorPage);
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

    async #renderFormLayout() {
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

      // Create status container using DOM
      const statusDiv = document.createElement('div');
      statusDiv.id = 'formStatus';
      statusDiv.className = 'hidden mb-4';
      container.appendChild(statusDiv);
      
      // Create form container
      const formContainer = document.createElement('div');
      formContainer.id = 'form-container';
      container.appendChild(formContainer);
      
      // Use AdvanceFormRender for the edit form
      this.formRender = new window.AdvanceFormRender(this.templateEngine, {
        modelPath: 'hr/RequestLeaveInstructor',
        targetSelector: '#form-container',
        submitHandler: this.#handleSubmitFormData.bind(this),
        autoFocus: false,
        validateOnBlur: false
      });
      
      await this.formRender.render();
      
      // Populate form with existing data
      if (this.request) {
        this.formRender.setData({
          instructor_code: this.request.InstructorCode || this.request.instructor_code,
          leave_type: this.request.LeaveType || this.request.leave_type,
          leave_date: this.request.LeaveDate ? new Date(this.request.LeaveDate).toISOString().split('T')[0] : '',
          reason: this.request.Reason || this.request.reason
        });
      }
      
      // Disable instructor_code and leave_date fields if needed
      const instructorField = formContainer.querySelector('[name="instructor_code"]');
      if (instructorField) {
        instructorField.disabled = true;
        instructorField.classList.add('opacity-60', 'cursor-not-allowed');
      }
      const dateField = formContainer.querySelector('[name="leave_date"]');
      if (dateField) {
        dateField.disabled = true;
        dateField.classList.add('opacity-60', 'cursor-not-allowed');
      }
      
      // Create delete button manually using DOM
      const deleteBtn = document.createElement('button');
      deleteBtn.id = 'deleteInstructorLeaveBtn';
      deleteBtn.type = 'button';
      deleteBtn.className = 'mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700';
      deleteBtn.textContent = 'Delete Request';
      container.appendChild(deleteBtn);
    }

    #createLoadingPage(title, message) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 flex items-center justify-center';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'text-center';
      
      const h1 = document.createElement('h1');
      h1.className = 'text-2xl font-bold text-gray-900 mb-2';
      h1.textContent = title;
      
      const p = document.createElement('p');
      p.className = 'text-gray-600';
      p.textContent = message;
      
      contentDiv.appendChild(h1);
      contentDiv.appendChild(p);
      pageDiv.appendChild(contentDiv);
      
      return pageDiv;
    }
    
    #createErrorPage(title, message, backLink, backLabel) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-4xl mx-auto px-4';
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-6';
      
      const h2 = document.createElement('h2');
      h2.className = 'text-lg font-semibold text-red-800';
      h2.textContent = title;
      
      const p = document.createElement('p');
      p.className = 'text-red-600 mt-2';
      p.textContent = message;
      
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'mt-4';
      
      const backLinkEl = document.createElement('a');
      backLinkEl.className = 'inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50';
      backLinkEl.setAttribute('routerLink', backLink);
      backLinkEl.textContent = backLabel;
      buttonDiv.appendChild(backLinkEl);
      
      errorDiv.appendChild(h2);
      errorDiv.appendChild(p);
      errorDiv.appendChild(buttonDiv);
      innerDiv.appendChild(errorDiv);
      pageDiv.appendChild(innerDiv);
      
      return pageDiv;
    }

    #attachEventListeners() {
      const deleteBtn = document.getElementById('deleteInstructorLeaveBtn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', this.#handleDelete.bind(this));
      }
    }

    async #handleSubmitFormData(formData) {
      const payload = {
        id: this.requestId,
        leave_type: formData.leave_type || '',
        reason: formData.reason || '',
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
