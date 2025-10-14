// Student Leave Request List Feature
if (typeof window !== 'undefined' && !window.HrStudentLeaveListFeature) {
  class HrStudentLeaveListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = this.#resolveErrorHandler();
      this.requests = [];
    }

    async render() {
      try {
        const renderers = this.#resolveRenderers();
        this.templateEngine.mainContainer.innerHTML = renderers.showLoading(
          'Student Leave Requests',
          'Loading leave requests...'
        );

        await this.#loadRequests();
        this.templateEngine.mainContainer.innerHTML = renderers.renderList(this.requests);
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering student leave list:', error);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'student_leave_list_render' });
        }

        if (window.HrTemplates && typeof HrTemplates.render === 'function') {
          this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
            title: 'Error Loading Leave Requests',
            message: error.message || 'Unable to load student leave requests.',
            hasRetry: true,
            retryAction: 'hrApp.renderStudentLeaveList()',
            backLink: 'hr/leave',
            backLabel: 'Back to Leave Management'
          });
        } else {
          this.templateEngine.mainContainer.textContent = error.message || 'Unable to load student leave requests.';
        }
      }
    }

    async #loadRequests() {
      const response = await this.apiService.fetchStudentLeaveRequests();

      if (Array.isArray(response)) {
        this.requests = response;
        return;
      }

      if (response && Array.isArray(response.result)) {
        this.requests = response.result;
        return;
      }

      if (response && Array.isArray(response.data)) {
        this.requests = response.data;
        return;
      }

      this.requests = [];
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

      document.querySelectorAll('[data-action-type="delete"]').forEach((btn) => {
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
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
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
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'student_leave_review' });
        }
      }
    }

    #resolveRenderers() {
      const ui = window.HrUiComponents;
      const templates = window.HrTemplates;

      const hasLoadingTemplate = templates && typeof templates.render === 'function' && typeof templates.has === 'function' && templates.has('loadingStatePage');
      const showLoading = (title, message) => {
        if (ui && typeof ui.showLoadingState === 'function') {
          return ui.showLoadingState(title, message);
        }

        if (hasLoadingTemplate) {
          return templates.render('loadingStatePage', {
            bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
            gradientFrom: 'blue-600',
            gradientTo: 'purple-600',
            title,
            message,
            iconLoading: templates.iconPaths?.loading || ''
          });
        }

        return `${title}: ${message}`;
      };

      const hasLeaveListTemplate = templates && typeof templates.render === 'function' && typeof templates.has === 'function' && templates.has('leaveListPage');
      const renderList = (requests) => {
        if (ui && typeof ui.renderStudentLeaveListPage === 'function') {
          return ui.renderStudentLeaveListPage(requests);
        }

        if (hasLeaveListTemplate) {
          return templates.render('leaveListPage', this.#buildTemplateData(requests));
        }

        return this.#renderPlainTable(requests);
      };

      return { showLoading, renderList };
    }

    #buildTemplateData(requests) {
      const templates = window.HrTemplates || {};
      const iconPaths = templates.iconPaths || {};
      const getStatusClass = typeof templates.getStatusClass === 'function'
        ? templates.getStatusClass.bind(templates)
        : () => 'bg-gray-100 text-gray-800';
      const formatDate = typeof templates.formatDate === 'function'
        ? templates.formatDate.bind(templates)
        : (value) => {
            if (!value) {
              return 'N/A';
            }
            const parsed = new Date(value);
            return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString() : 'N/A';
          };

      const parsedRequests = (Array.isArray(requests) ? requests : []).map((request) => {
        const idValue = request.ID ?? request.id ?? request.Id ?? null;
        const id = idValue !== null && idValue !== undefined ? String(idValue) : '';
        const studentCode = request.student_code || request.StudentCode || request.studentCode || 'N/A';
        const leaveType = request.leave_type || request.LeaveType || 'N/A';
        const leaveDateRaw = request.leave_date || request.LeaveDate || request.leaveDate || '';
        const status = request.Status || request.status || 'Pending';

        const baseActionClasses = 'inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200';
        const actions = [
          {
            isLink: true,
            route: `hr/leave/student/edit/${id}`,
            label: 'Edit',
            className: `${baseActionClasses} bg-yellow-50 text-yellow-700 hover:bg-yellow-100`,
            id
          },
          {
            isButton: true,
            action: 'delete',
            actionType: 'delete',
            label: 'Delete',
            className: `${baseActionClasses} js-delete-btn bg-red-50 text-red-700 hover:bg-red-100`,
            id
          }
        ];

        if (status === 'Pending') {
          actions.unshift({
            isButton: true,
            action: 'reject',
            actionType: 'review',
            label: 'Reject',
            className: `${baseActionClasses} review-btn js-review-btn bg-rose-50 text-rose-700 hover:bg-rose-100`,
            id
          });
          actions.unshift({
            isButton: true,
            action: 'approve',
            actionType: 'review',
            label: 'Approve',
            className: `${baseActionClasses} review-btn js-review-btn bg-blue-50 text-blue-700 hover:bg-blue-100`,
            id
          });
        }

        return {
          id,
          personLabel: studentCode,
          leaveType,
          leaveDate: formatDate(leaveDateRaw),
          status,
          statusClass: getStatusClass(status),
          actions
        };
      });

      return {
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        gradientFrom: 'blue-600',
        gradientTo: 'indigo-600',
        title: 'Student Leave Requests',
        description: 'View and manage student leave requests',
        icon: iconPaths.student || '',
        actions: [
          {
            route: 'hr/leave/student/create',
            label: 'New Leave Request',
            className: 'inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200',
            icon: iconPaths.add || ''
          }
        ],
        showRefresh: true,
        refreshId: 'refreshBtn',
        refreshClass: 'inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200',
        refreshLabel: 'Refresh',
        hasRequests: parsedRequests.length > 0,
        requests: parsedRequests,
        columns: [
          { label: 'ID' },
          { label: 'Student' },
          { label: 'Leave Type' },
          { label: 'Leave Date' },
          { label: 'Status' },
          { label: 'Actions' }
        ],
        emptyTitle: 'No Leave Requests Yet',
        emptyMessage: 'There are no student leave requests to display.',
        emptyActionRoute: 'hr/leave/student/create',
        emptyActionLabel: 'Create First Request',
        backRoute: 'hr/leave',
        modalId: 'reviewModal',
        modalTitle: 'Review Leave Request',
        modalMessageId: 'reviewModalMessage',
        modalMessage: 'Are you sure you want to review this leave request?',
        reasonFieldId: 'reviewReason',
        reasonPlaceholder: 'Optional: add a reason for your decision...',
        confirmButtonId: 'confirmReview',
        confirmLabel: 'Confirm',
        cancelButtonId: 'cancelReview',
        cancelLabel: 'Cancel',
        iconReset: iconPaths.reset || ''
      };
    }

    #renderPlainTable(requests) {
      const safeRequests = Array.isArray(requests) ? requests : [];
      if (safeRequests.length === 0) {
        return `
          <div class="p-4 bg-white rounded-lg border border-amber-300 text-sm text-amber-700">
            Core HR templates have not finished loading yet, so a minimal view is shown.
            No student leave requests found.
          </div>
        `;
      }

      const summary = safeRequests.map((req) => {
        const id = req.ID ?? req.id ?? req.Id ?? '—';
        const studentCode = req.student_code || req.StudentCode || req.studentCode || 'N/A';
        const leaveType = req.leave_type || req.LeaveType || 'N/A';
        const status = req.Status || req.status || 'Pending';
        return `#${id} • ${studentCode} • ${leaveType} • ${status}`;
      }).join('\n');

      return `
        <div class="p-4 bg-white rounded-lg border border-amber-300 space-y-2">
          <p class="text-sm text-amber-700">
            Core HR templates have not finished loading yet, so a minimal list is shown temporarily.
          </p>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">${summary}</pre>
        </div>
      `;
    }

    #resolveErrorHandler() {
      if (window.hrApp && window.hrApp.errorHandler && typeof window.hrApp.errorHandler.handleError === 'function') {
        return window.hrApp.errorHandler;
      }

      const handler = window.HrErrorHandler;
      if (!handler) {
        return null;
      }

      if (typeof handler.handleError === 'function') {
        return handler;
      }

      if (typeof handler.getInstance === 'function') {
        const instance = handler.getInstance();
        if (instance && typeof instance.handleError === 'function') {
          return instance;
        }
        return instance;
      }

      if (typeof handler === 'function') {
        try {
          const instance = new handler();
          if (instance && typeof instance.handleError === 'function') {
            return instance;
          }
          return instance;
        } catch (err) {
          console.warn('Failed to instantiate HrErrorHandler:', err);
        }
      }

      return null;
    }
  }

  window.HrStudentLeaveListFeature = HrStudentLeaveListFeature;
}
