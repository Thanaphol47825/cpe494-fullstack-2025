// Student Leave Request List Feature
if (typeof window !== 'undefined' && !window.HrStudentLeaveListFeature) {
  class HrStudentLeaveListFeature {
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
          'Student Leave Requests',
          'Loading leave requests...'
        );

        await this.#loadRequests();
        this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderStudentLeaveListPage(this.requests);
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering student leave list:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_list_render' });
        }
        this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
          title: 'Error Loading Leave Requests',
          message: error.message || 'Unable to load student leave requests.',
          hasRetry: true,
          retryAction: 'hrApp.renderStudentLeaveList()',
          backLink: 'hr/leave',
          backLabel: 'Back to Leave Management'
        });
      }
    }

    async #loadRequests() {
      const response = await this.apiService.fetchStudentLeaveRequests();
      this.requests = response || [];
    }

    #attachEventListeners() {
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.render());
      }

      document.querySelectorAll('[data-action-type="review"]').forEach(btn => {
        btn.addEventListener('click', (event) => {
          const target = event.currentTarget;
          const id = target.dataset.id;
          const action = target.dataset.action;
          this.#showReviewModal(id, action);
        });
      });

      document.querySelectorAll('[data-action-type="delete"]').forEach(btn => {
        btn.addEventListener('click', (event) => {
          const target = event.currentTarget;
          const id = target.dataset.id;
          this.#handleDelete(id);
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

    async #handleDelete(requestId) {
      const id = Number(requestId);
      if (!Number.isFinite(id)) {
        console.warn('Invalid request id for deletion', requestId);
        return;
      }

      const confirmed = window.confirm('Are you sure you want to delete this leave request?');
      if (!confirmed) {
        return;
      }

      try {
        await this.apiService.deleteStudentLeaveRequest(id);
        alert('Leave request deleted successfully.');
        await this.render();
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_delete' });
        }
      }
    }

    async #handleReview(requestId, action, reason) {
      try {
        const id = Number(requestId);
        await this.apiService.reviewStudentLeaveRequest(id, action, reason);
        alert(`Leave request ${action}d successfully!`);
        await this.render();
      } catch (error) {
        console.error('Error reviewing request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'student_leave_review' });
        }
      }
    }
  }

  window.HrStudentLeaveListFeature = HrStudentLeaveListFeature;
}
