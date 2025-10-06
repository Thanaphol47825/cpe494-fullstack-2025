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
        await this.#loadRequests();
        const html = this.#generateListHTML();
        this.templateEngine.mainContainer.innerHTML = html;
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering instructor leave list:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_list_render' });
        }
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-7xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-red-800">Error loading leave requests: ${error.message}</p>
              </div>
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        `;
      }
    }

    async #loadRequests() {
      this.requests = await this.apiService.fetchInstructorLeaveRequests();
    }

    #generateListHTML() {
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
          <div class="max-w-7xl mx-auto px-4">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Leave Requests</h1>
              <p class="text-gray-600">View and manage instructor leave requests</p>
            </div>

            <!-- Actions Bar -->
            <div class="mb-6 flex justify-between items-center">
              <div class="flex gap-3">
                <a 
                  routerLink="hr/leave/instructor/create" 
                  class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  New Leave Request
                </a>
                <button 
                  id="refreshBtn"
                  class="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Requests Table -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              ${this.requests.length === 0 ? this.#generateEmptyState() : this.#generateTable()}
            </div>

            <!-- Back Link -->
            <div class="mt-6 text-center">
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        </div>

        <!-- Review Modal -->
        <div id="reviewModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Review Leave Request</h3>
            <div id="reviewModalContent"></div>
          </div>
        </div>
      `;
    }

    #generateEmptyState() {
      return `
        <div class="p-12 text-center">
          <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No Leave Requests Yet</h3>
          <p class="text-gray-500 mb-6">There are no instructor leave requests to display.</p>
          <a 
            routerLink="hr/leave/instructor/create" 
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700"
          >
            Create First Request
          </a>
        </div>
      `;
    }

    #generateTable() {
      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Instructor</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Date</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${this.requests.map(req => this.#generateTableRow(req)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    #generateTableRow(request) {
      const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };

      const leaveDate = request.LeaveDate ? new Date(request.LeaveDate).toLocaleDateString() : 'N/A';
      const statusClass = statusColors[request.Status] || 'bg-gray-100 text-gray-800';

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 text-sm text-gray-900">#${request.ID}</td>
          <td class="px-6 py-4 text-sm font-medium text-gray-900">${request.InstructorCode || 'N/A'}</td>
          <td class="px-6 py-4 text-sm text-gray-700">${request.LeaveType || 'N/A'}</td>
          <td class="px-6 py-4 text-sm text-gray-700">${leaveDate}</td>
          <td class="px-6 py-4">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
              ${request.Status || 'Pending'}
            </span>
          </td>
          <td class="px-6 py-4 text-sm">
            <div class="flex gap-2">
              ${request.Status === 'Pending' ? `
                <button 
                  class="review-btn text-blue-600 hover:text-blue-800 font-medium" 
                  data-id="${request.ID}"
                  data-action="approve"
                >
                  Approve
                </button>
                <button 
                  class="review-btn text-red-600 hover:text-red-800 font-medium" 
                  data-id="${request.ID}"
                  data-action="reject"
                >
                  Reject
                </button>
              ` : `
                <span class="text-gray-400">No actions</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }

    #attachEventListeners() {
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.render());
      }

      document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const action = e.target.dataset.action;
          this.#showReviewModal(id, action);
        });
      });
    }

    #showReviewModal(requestId, action) {
      const modal = document.getElementById('reviewModal');
      const content = document.getElementById('reviewModalContent');
      
      if (!modal || !content) return;

      const actionText = action === 'approve' ? 'Approve' : 'Reject';
      const actionColor = action === 'approve' ? 'green' : 'red';

      content.innerHTML = `
        <div class="space-y-4">
          <p class="text-gray-600">Are you sure you want to ${action} this leave request?</p>
          <textarea 
            id="reviewReason" 
            placeholder="Optional: Add a reason for your decision..." 
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
          <div class="flex gap-3 pt-4">
            <button 
              id="confirmReview" 
              class="flex-1 bg-${actionColor}-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-${actionColor}-700"
            >
              ${actionText}
            </button>
            <button 
              id="cancelReview" 
              class="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');

      document.getElementById('confirmReview').addEventListener('click', () => {
        const reason = document.getElementById('reviewReason').value;
        this.#handleReview(requestId, action, reason);
        modal.classList.add('hidden');
      });

      document.getElementById('cancelReview').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    async #handleReview(requestId, action, reason) {
      try {
        await this.apiService.reviewInstructorLeaveRequest(requestId, action, reason);
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

