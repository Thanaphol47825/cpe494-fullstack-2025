// Instructor Leave Request List Feature
if (typeof window !== 'undefined' && !window.HrInstructorLeaveListFeature) {
  class HrInstructorLeaveListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.requests = [];
    }

    async render() {
      try {
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.showLoadingState(
          'Instructor Leave Requests',
          'Loading leave requests...'
        );

        await this.#loadRequests();
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderInstructorLeaveListPage(this.requests);
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering instructor leave list:', error);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_list_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Requests',
          message: error.message || 'Unable to load instructor leave requests.',
          hasRetry: true,
          retryAction: 'hrApp.renderInstructorLeaveList()',
          backLink: 'hr/leave',
          backLabel: 'Back to Leave Management'
        });
      }
    }

    async #loadRequests() {
      const response = await this.apiService.fetchInstructorLeaveRequests();
      if (Array.isArray(response)) {
        this.requests = response;
      } else if (response && Array.isArray(response.result)) {
        this.requests = response.result;
      } else if (response && Array.isArray(response.data)) {
        this.requests = response.data;
      } else {
        this.requests = [];
      }
    }

    #attachEventListeners() {
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.render());
      }

      document.querySelectorAll('[data-action-type="review"]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
          const target = event.currentTarget;
          const id = target.dataset.id;
          const action = target.dataset.action;
          this.#showReviewModal(id, action);
        });
      });
    }

    #showReviewModal(requestId, action) {
      const modal = document.getElementById('reviewModal');
      const messageEl = document.getElementById('reviewModalMessage');
      const reasonInput = document.getElementById('reviewReason');
      const confirmBtn = document.getElementById('confirmReview');
      const cancelBtn = document.getElementById('cancelReview');

      if (!modal || !messageEl || !reasonInput || !confirmBtn || !cancelBtn) {
        return;
      }

      const actionText = action === 'approve' ? 'Approve' : 'Reject';
      messageEl.textContent = `Are you sure you want to ${action.toLowerCase()} this leave request?`;
      confirmBtn.textContent = actionText;
      reasonInput.value = '';

      const baseClasses = 'flex-1 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200';
      if (action === 'approve') {
        confirmBtn.className = `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-300`;
      } else {
        confirmBtn.className = `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-300`;
      }

      confirmBtn.onclick = () => {
        const reason = reasonInput.value;
        this.#handleReview(requestId, action, reason);
        modal.classList.add('hidden');
      };

      cancelBtn.onclick = () => {
        modal.classList.add('hidden');
      };

      modal.classList.remove('hidden');
    }

    async #handleReview(requestId, action, reason) {
      try {
        const id = Number(requestId);
        await this.apiService.reviewInstructorLeaveRequest(id, action, reason);
        alert(`Leave request ${action}d successfully!`);
        await this.render();
      } catch (error) {
        console.error('Error reviewing request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_review' });
        }
      }
    }
  }

  window.HrInstructorLeaveListFeature = HrInstructorLeaveListFeature;
}
