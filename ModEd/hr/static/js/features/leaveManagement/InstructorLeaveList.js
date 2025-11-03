// Instructor Leave Request List Feature - Using AdvanceTableRender
if (typeof window !== 'undefined' && !window.HrInstructorLeaveListFeature) {
  class HrInstructorLeaveListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.table = null;
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
            <div class="max-w-7xl mx-auto px-4">
              <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Leave Requests</h1>
                    <p class="text-gray-600">View and manage instructor leave requests</p>
                  </div>
                  <div class="flex gap-3">
                    <button id="refreshBtn" class="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200">
                      Refresh
                    </button>
                    <a routerLink="hr/leave/instructor/create" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200">
                      New Leave Request
                    </a>
                  </div>
                </div>
              </div>
              <div id="table-container" class="bg-white rounded-2xl shadow-lg p-6">
                <div class="text-center py-8 text-gray-500">Loading...</div>
              </div>
              <div class="mt-6 text-center">
                <a routerLink="hr/leave" class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Back to Leave Management
                </a>
              </div>
            </div>
          </div>
        `;

        // Load data first and normalize response format
        const response = await this.apiService.fetchInstructorLeaveRequests();
        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response && Array.isArray(response.result)) {
          data = response.result;
        } else if (response && Array.isArray(response.data)) {
          data = response.data;
        }
        
        // Ensure all records have an 'id' field for template interpolation
        data = data.map(item => {
          // Normalize ID field - try different possible field names
          if (!item.id && item.ID !== undefined) {
            item.id = item.ID;
          } else if (!item.id && item.Id !== undefined) {
            item.id = item.Id;
          }
          return item;
        });

        // Create table using AdvanceTableRender with pre-loaded data
        this.table = new window.AdvanceTableRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveInstructor',
          data: data, // Use pre-loaded data instead of dataPath
          targetSelector: '#table-container',
          customColumns: [
            {
              name: 'actions',
              label: 'Actions',
              template: `
                <div class="flex gap-2">
                  ${this.#getActionButtonsTemplate()}
                </div>
              `
            }
          ]
        });

        await this.table.render();
        this.#attachEventListeners();

      } catch (error) {
        console.error('Error rendering instructor leave list:', error);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_list_render' });
        }
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-7xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 class="text-lg font-semibold text-red-800">Error Loading Leave Requests</h2>
                <p class="text-red-600 mt-2">${error.message || 'Unable to load instructor leave requests.'}</p>
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

    #getActionButtonsTemplate() {
      return `
        <a routerLink="hr/leave/instructor/edit/{id}" class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
          Edit
        </a>
        <button onclick="window.hrInstructorLeaveList?.reviewRequest('{id}', 'approve')" data-action-type="review" data-id="{id}" data-action="approve" 
          class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 js-review-btn" 
          style="display: {status === 'Pending' ? 'inline-flex' : 'none'}">
          Approve
        </button>
        <button onclick="window.hrInstructorLeaveList?.reviewRequest('{id}', 'reject')" data-action-type="review" data-id="{id}" data-action="reject" 
          class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 bg-rose-50 text-rose-700 hover:bg-rose-100 js-review-btn" 
          style="display: {status === 'Pending' ? 'inline-flex' : 'none'}">
          Reject
        </button>
        <button onclick="window.hrInstructorLeaveList?.deleteRequest('{id}')" data-action-type="delete" data-id="{id}" 
          class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 bg-red-50 text-red-700 hover:bg-red-100 js-delete-btn">
          Delete
        </button>
      `;
    }

    #attachEventListeners() {
      // Make instance globally accessible for button handlers
      window.hrInstructorLeaveList = this;

      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.render());
      }

      // Attach event listeners for review and delete buttons
      setTimeout(() => {
        document.querySelectorAll('[data-action-type="review"]').forEach((btn) => {
          btn.addEventListener('click', (event) => {
            event.preventDefault();
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            this.#showReviewModal(id, action);
          });
        });

        document.querySelectorAll('[data-action-type="delete"]').forEach((btn) => {
          btn.addEventListener('click', (event) => {
            event.preventDefault();
            const id = btn.dataset.id;
            this.#handleDelete(id);
          });
        });
      }, 500);
    }

    #showReviewModal(requestId, action) {
      const modal = document.getElementById('reviewModal');
      if (!modal) {
        this.#createReviewModal();
      }

      const modalEl = document.getElementById('reviewModal');
      const messageEl = document.getElementById('reviewModalMessage');
      const reasonInput = document.getElementById('reviewReason');
      const confirmBtn = document.getElementById('confirmReview');
      const cancelBtn = document.getElementById('cancelReview');

      if (!modalEl || !messageEl || !reasonInput || !confirmBtn || !cancelBtn) {
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
        modalEl.classList.add('hidden');
      };

      cancelBtn.onclick = () => {
        modalEl.classList.add('hidden');
      };

      modalEl.classList.remove('hidden');
    }

    #createReviewModal() {
      const modalHTML = `
        <div id="reviewModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">Review Leave Request</h3>
            <p id="reviewModalMessage" class="mb-4 text-gray-700"></p>
            <textarea id="reviewReason" placeholder="Optional: add a reason for your decision..." 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"></textarea>
            <div class="flex gap-3">
              <button id="confirmReview" class="flex-1 font-semibold py-2 px-4 rounded-lg"></button>
              <button id="cancelReview" class="flex-1 font-semibold py-2 px-4 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async #handleDelete(requestId) {
      const id = Number(requestId);
      if (!Number.isFinite(id)) {
        console.warn('Invalid instructor leave request id for deletion', requestId);
        return;
      }

      const confirmed = window.confirm('Are you sure you want to delete this leave request?');
      if (!confirmed) {
        return;
      }

      try {
        await this.apiService.deleteInstructorLeaveRequest(id);
        // Silently refresh without showing another alert
        await this.render();
      } catch (error) {
        console.error('Error deleting leave request:', error);
        alert(`Error: ${error.message}`);
        if (this.errorHandler && typeof this.errorHandler.handleError === 'function') {
          this.errorHandler.handleError(error, { context: 'instructor_leave_delete' });
        }
      }
    }

    async reviewRequest(requestId, action) {
      await this.#showReviewModal(requestId, action);
    }

    async deleteRequest(requestId) {
      await this.#handleDelete(requestId);
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
