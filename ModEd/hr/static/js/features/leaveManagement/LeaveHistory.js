// Leave History Feature - Combined view using AdvanceTableRender
if (typeof window !== 'undefined' && !window.HrLeaveHistoryFeature) {
  class HrLeaveHistoryFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.studentTable = null;
      this.instructorTable = null;
      this.studentRequests = [];
      this.instructorRequests = [];
    }

    async render() {
      try {
        // Ensure templates are loaded
        if (!this.templateEngine.template) {
          await this.templateEngine.fetchTemplate();
        }

        // Load all requests first
        await this.#loadAllRequests();

        // Calculate statistics
        const stats = this.#calculateStatistics();

        // Set up container
        this.templateEngine.mainContainer.innerHTML = `
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
                      <p class="text-2xl font-bold text-gray-900">${stats.total}</p>
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
                      <p class="text-2xl font-bold text-green-600">${stats.approved}</p>
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
                      <p class="text-2xl font-bold text-yellow-600">${stats.pending}</p>
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
                      <p class="text-2xl font-bold text-red-600">${stats.rejected}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Student Leave Requests Section -->
              <div class="mb-8">
                <div class="mb-4">
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Student Leave Requests</h2>
                  <p class="text-gray-600">${stats.studentTotal} student leave request${stats.studentTotal !== 1 ? 's' : ''}</p>
                </div>
                <div id="student-table-container" class="bg-white rounded-2xl shadow-lg p-6">
                  <div class="text-center py-8 text-gray-500">Loading...</div>
                </div>
              </div>

              <!-- Instructor Leave Requests Section -->
              <div class="mb-8">
                <div class="mb-4">
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Instructor Leave Requests</h2>
                  <p class="text-gray-600">${stats.instructorTotal} instructor leave request${stats.instructorTotal !== 1 ? 's' : ''}</p>
                </div>
                <div id="instructor-table-container" class="bg-white rounded-2xl shadow-lg p-6">
                  <div class="text-center py-8 text-gray-500">Loading...</div>
                </div>
              </div>

              <!-- Back Button -->
              <div class="mt-6 text-center">
                <a routerLink="hr/leave" class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Back to Leave Management
                </a>
              </div>
            </div>
          </div>
        `;

        // Render student table
        this.studentTable = new window.AdvanceTableRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveStudent',
          data: this.studentRequests,
          targetSelector: '#student-table-container',
          customColumns: [
            {
              name: 'type',
              label: 'Type',
              template: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Student</span>'
            }
          ]
        });
        await this.studentTable.render();

        // Render instructor table
        this.instructorTable = new window.AdvanceTableRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveInstructor',
          data: this.instructorRequests,
          targetSelector: '#instructor-table-container',
          customColumns: [
            {
              name: 'type',
              label: 'Type',
              template: '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Instructor</span>'
            }
          ]
        });
        await this.instructorTable.render();

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

    #calculateStatistics() {
      const allRequests = [...this.studentRequests, ...this.instructorRequests];
      const approved = allRequests.filter(r => (r.Status || r.status) === 'Approved').length;
      const pending = allRequests.filter(r => (r.Status || r.status) === 'Pending').length;
      const rejected = allRequests.filter(r => (r.Status || r.status) === 'Rejected').length;

      return {
        total: allRequests.length,
        approved,
        pending,
        rejected,
        studentTotal: this.studentRequests.length,
        instructorTotal: this.instructorRequests.length
      };
    }
  }

  window.HrLeaveHistoryFeature = HrLeaveHistoryFeature;
}
