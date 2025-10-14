// Leave History Feature - Combined view for both students and instructors
if (typeof window !== 'undefined' && !window.HrLeaveHistoryFeature) {
  class HrLeaveHistoryFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.studentRequests = [];
      this.instructorRequests = [];
    }

    async render() {
      try {
        await this.#loadAllRequests();
        const html = this.#generateHistoryHTML();
        this.templateEngine.mainContainer.innerHTML = html;
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering leave history:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'leave_history_render' });
        }
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-7xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-red-800">Error loading leave history: ${error.message}</p>
              </div>
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        `;
      }
    }

    async #loadAllRequests() {
      try {
        const [studentResponse, instructorResponse] = await Promise.all([
          this.apiService.fetchStudentLeaveRequests(),
          this.apiService.fetchInstructorLeaveRequests()
        ]);

        this.studentRequests = this.#normalizeRequests(studentResponse);
        this.instructorRequests = this.#normalizeRequests(instructorResponse);
      } catch (error) {
        console.error('Error loading requests:', error);
        // Continue with empty arrays if one fails
        this.studentRequests = Array.isArray(this.studentRequests) ? this.studentRequests : [];
        this.instructorRequests = Array.isArray(this.instructorRequests) ? this.instructorRequests : [];
      }
    }

    #normalizeRequests(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.result)) {
        return response.result;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    }

    #generateHistoryHTML() {
      const totalRequests = this.studentRequests.length + this.instructorRequests.length;
      const approvedCount = [
        ...this.studentRequests,
        ...this.instructorRequests
      ].filter(r => r.Status === 'Approved').length;
      const pendingCount = [
        ...this.studentRequests,
        ...this.instructorRequests
      ].filter(r => r.Status === 'Pending').length;
      const rejectedCount = [
        ...this.studentRequests,
        ...this.instructorRequests
      ].filter(r => r.Status === 'Rejected').length;

      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
          <div class="max-w-7xl mx-auto px-4">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Leave Request History</h1>
              <p class="text-gray-600">Complete history of all leave requests</p>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total</p>
                    <p class="text-2xl font-bold text-gray-900">${totalRequests}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Approved</p>
                    <p class="text-2xl font-bold text-green-600">${approvedCount}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                    <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Pending</p>
                    <p class="text-2xl font-bold text-yellow-600">${pendingCount}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-red-100 rounded-lg p-3">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Rejected</p>
                    <p class="text-2xl font-bold text-red-600">${rejectedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="bg-white rounded-2xl shadow-lg mb-6">
              <div class="border-b border-gray-200">
                <nav class="flex -mb-px">
                  <button class="tab-btn active px-6 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600" data-tab="all">
                    All Requests (${totalRequests})
                  </button>
                  <button class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="students">
                    Students (${this.studentRequests.length})
                  </button>
                  <button class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="instructors">
                    Instructors (${this.instructorRequests.length})
                  </button>
                </nav>
              </div>

              <!-- Tab Content -->
              <div id="tabContent" class="p-6">
                ${this.#generateAllRequestsTable()}
              </div>
            </div>

            <!-- Back Link -->
            <div class="text-center">
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        </div>
      `;
    }

    #generateAllRequestsTable() {
      const allRequests = [
        ...this.studentRequests.map(r => ({...r, type: 'Student', code: r.student_code || r.StudentCode})),
        ...this.instructorRequests.map(r => ({...r, type: 'Instructor', code: r.InstructorCode}))
      ].sort((a, b) => (b.ID || 0) - (a.ID || 0));

      if (allRequests.length === 0) {
        return `
          <div class="text-center py-12">
            <p class="text-gray-500">No leave requests found</p>
          </div>
        `;
      }

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${allRequests.map(req => this.#generateHistoryRow(req)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    #generateHistoryRow(request) {
      const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };

      const leaveDate = request.leave_date || request.LeaveDate;
      const dateStr = leaveDate ? new Date(leaveDate).toLocaleDateString() : 'N/A';
      const statusClass = statusColors[request.Status] || 'bg-gray-100 text-gray-800';
      const leaveType = request.leave_type || request.LeaveType || 'N/A';
      const reason = request.reason || request.Reason || 'N/A';

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-4 py-3 text-sm text-gray-900">#${request.ID}</td>
          <td class="px-4 py-3 text-sm">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.type === 'Student' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
              ${request.type}
            </span>
          </td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${request.code || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${leaveType}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${dateStr}</td>
          <td class="px-4 py-3">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
              ${request.Status || 'Pending'}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title="${reason}">${reason}</td>
        </tr>
      `;
    }

    #attachEventListeners() {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = e.target.dataset.tab;
          this.#switchTab(tab);
          
          // Update active state
          document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active', 'border-blue-600', 'text-blue-600');
            b.classList.add('border-transparent', 'text-gray-500');
          });
          e.target.classList.add('active', 'border-blue-600', 'text-blue-600');
          e.target.classList.remove('border-transparent', 'text-gray-500');
        });
      });
    }

    #switchTab(tab) {
      const content = document.getElementById('tabContent');
      if (!content) return;

      if (tab === 'students') {
        content.innerHTML = this.#generateStudentRequestsTable();
      } else if (tab === 'instructors') {
        content.innerHTML = this.#generateInstructorRequestsTable();
      } else {
        content.innerHTML = this.#generateAllRequestsTable();
      }
    }

    #generateStudentRequestsTable() {
      if (this.studentRequests.length === 0) {
        return `<div class="text-center py-12"><p class="text-gray-500">No student leave requests found</p></div>`;
      }

      const sorted = [...this.studentRequests].sort((a, b) => (b.ID || 0) - (a.ID || 0));

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Code</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${sorted.map(req => this.#generateSimpleRow(req)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    #generateInstructorRequestsTable() {
      if (this.instructorRequests.length === 0) {
        return `<div class="text-center py-12"><p class="text-gray-500">No instructor leave requests found</p></div>`;
      }

      const sorted = [...this.instructorRequests].sort((a, b) => (b.ID || 0) - (a.ID || 0));

      return `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Instructor Code</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${sorted.map(req => this.#generateSimpleRow(req, true)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    #generateSimpleRow(request, isInstructor = false) {
      const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };

      const leaveDate = request.leave_date || request.LeaveDate;
      const dateStr = leaveDate ? new Date(leaveDate).toLocaleDateString() : 'N/A';
      const statusClass = statusColors[request.Status] || 'bg-gray-100 text-gray-800';
      const code = isInstructor ? request.InstructorCode : (request.student_code || request.StudentCode);
      const leaveType = request.leave_type || request.LeaveType || 'N/A';
      const reason = request.reason || request.Reason || 'N/A';

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-4 py-3 text-sm text-gray-900">#${request.ID}</td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${code || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${leaveType}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${dateStr}</td>
          <td class="px-4 py-3">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
              ${request.Status || 'Pending'}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title="${reason}">${reason}</td>
        </tr>
      `;
    }
  }

  window.HrLeaveHistoryFeature = HrLeaveHistoryFeature;
}
