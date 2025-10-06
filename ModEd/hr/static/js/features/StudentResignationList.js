// Student Resignation List Feature with Pagination
if (typeof HrStudentResignationListFeature === 'undefined') {
class HrStudentResignationListFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.api = new HrApiService(this.rootURL);
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.totalPages = 0;
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";
    await this.#createListPage();
    return true;
  }

  async #createListPage() {
    try {
      const pageHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Student Resignation Requests</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Process student withdrawal and resignation requests</p>
            </div>

            <!-- Current Requests Section -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
              <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600">
                <div class="flex justify-between items-center">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Current Requests
                  </h2>
                  <a href="#hr/resignation/student/create" 
                     class="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    New Request
                  </a>
                </div>
              </div>
              
              <div class="p-8">
                <!-- Loading State -->
                <div id="loadingState" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-orange-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600">Loading requests...</p>
                </div>

                <!-- Error State -->
                <div id="errorState" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-red-600 mb-4">Failed to load requests</p>
                  <button onclick="window.location.reload()" 
                          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Retry
                  </button>
                </div>

                <!-- Requests List -->
                <div id="requestsList" class="hidden">
                  <div id="requestsContainer" class="space-y-4">
                    <!-- Requests will be loaded here -->
                  </div>

                  <!-- Pagination -->
                  <div id="paginationContainer" class="mt-8 flex justify-center">
                    <!-- Pagination will be loaded here -->
                  </div>
                </div>

                <!-- Empty State -->
                <div id="emptyState" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No resignation requests found</h3>
                  <p class="text-gray-600 mb-6">There are currently no student resignation requests to display.</p>
                  <a href="#hr/resignation/student/create" 
                     class="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create First Request
                  </a>
                </div>
              </div>
            </div>

            <!-- Back Button -->
            <div class="text-center">
              <a href="#hr" 
                 class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to HR Menu
              </a>
            </div>
          </div>
        </div>
      `;

      const pageElement = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageElement);

      // Load requests
      await this.#loadRequests();
    } catch (error) {
      console.error('Error creating resignation list:', error);
      this.#showError('Failed to initialize list: ' + error.message);
    }
  }

  async #loadRequests() {
    try {
      this.#showLoading();
      const requests = await this.api.fetchStudentResignations();
      this.#hideLoading();
      
      if (!requests || requests.length === 0) {
        this.#showEmpty();
        return;
      }

      this.totalItems = requests.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      this.#renderRequests(requests);
      this.#renderPagination();
      this.#showRequests();
    } catch (error) {
      console.error('Error loading requests:', error);
      this.#hideLoading();
      this.#showError();
    }
  }

  #renderRequests(requests) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageRequests = requests.slice(startIndex, endIndex);

    container.innerHTML = pageRequests.map(request => this.#renderRequestCard(request)).join('');
  }

  #renderRequestCard(request) {
    const statusColor = this.#getStatusColor(request.Status);
    const statusIcon = this.#getStatusIcon(request.Status);
    const requestDate = this.#formatDate(request.CreatedAt || request.created_at);
    
    return `
      <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <h3 class="text-lg font-semibold text-gray-900">Request #${request.ID || request.id || 'N/A'}</h3>
              <span class="ml-3 px-3 py-1 text-xs font-medium rounded-full ${statusColor}">
                ${request.Status || 'Unknown'}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">Student:</span> 
                <span class="text-gray-900">${request.StudentCode || 'N/A'}</span>
              </div>
              <div>
                <span class="font-medium">Requested At:</span> 
                <span class="text-gray-900">${requestDate}</span>
              </div>
              <div class="md:col-span-2">
                <span class="font-medium">Reason:</span> 
                <span class="text-gray-900">${request.Reason || 'No reason provided'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button onclick="window.resignationList.viewRequest(${request.ID || request.id})" 
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View
          </button>
          ${request.Status === 'Pending' ? `
            <button onclick="window.resignationList.approveRequest(${request.ID || request.id})" 
                    class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Approve
            </button>
            <button onclick="window.resignationList.rejectRequest(${request.ID || request.id})" 
                    class="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reject
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  #renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container || this.totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    const paginationHTML = `
      <nav class="flex items-center space-x-2">
        <button onclick="window.resignationList.goToPage(${this.currentPage - 1})" 
                ${this.currentPage === 1 ? 'disabled' : ''}
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        
        ${this.#generatePageNumbers()}
        
        <button onclick="window.resignationList.goToPage(${this.currentPage + 1})" 
                ${this.currentPage === this.totalPages ? 'disabled' : ''}
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </nav>
    `;

    container.innerHTML = paginationHTML;
  }

  #generatePageNumbers() {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(`
        <button onclick="window.resignationList.goToPage(${i})" 
                class="px-3 py-2 text-sm font-medium rounded-lg ${
                  i === this.currentPage 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }">
          ${i}
        </button>
      `);
    }

    return pages.join('');
  }

  async goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    await this.#loadRequests();
  }

  async viewRequest(requestId) {
    try {
      const request = await this.api.fetchStudentResignation(requestId);
      this.#showRequestModal(request);
    } catch (error) {
      console.error('Error viewing request:', error);
      alert('Failed to load request details: ' + error.message);
    }
  }

  async approveRequest(requestId) {
    if (!confirm('Are you sure you want to approve this resignation request?')) return;
    
    try {
      await this.api.reviewStudentResignation(requestId, 'approve', '');
      alert('Request approved successfully!');
      await this.#loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + error.message);
    }
  }

  async rejectRequest(requestId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      await this.api.reviewStudentResignation(requestId, 'reject', reason);
      alert('Request rejected successfully!');
      await this.#loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + error.message);
    }
  }

  #showRequestModal(request) {
    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="requestModal">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Request Details #${request.ID || request.id}</h3>
            <button onclick="document.getElementById('requestModal').remove()" 
                    class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Student Code</label>
                <p class="mt-1 text-sm text-gray-900">${request.StudentCode || 'N/A'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="mt-1 text-sm text-gray-900">${request.Status || 'Unknown'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Created At</label>
                <p class="mt-1 text-sm text-gray-900">${this.#formatDate(request.CreatedAt || request.created_at)}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Updated At</label>
                <p class="mt-1 text-sm text-gray-900">${this.#formatDate(request.UpdatedAt || request.updated_at)}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Reason</label>
              <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">${request.Reason || 'No reason provided'}</p>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button onclick="document.getElementById('requestModal').remove()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  #getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  #getStatusIcon(status) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  }

  #formatDate(dateString) {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  }

  #showLoading() {
    document.getElementById('loadingState')?.classList.remove('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('requestsList')?.classList.add('hidden');
    document.getElementById('emptyState')?.classList.add('hidden');
  }

  #hideLoading() {
    document.getElementById('loadingState')?.classList.add('hidden');
  }

  #showError(message = null) {
    if (message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading List</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4">
                <button onclick="window.location.reload()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200">Retry</button>
                <button onclick="window.location.href='${this.rootURL}/hr'" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ml-3">Back to HR</button>
              </div>
            </div>
          </div>
        </div>`;
    } else {
      document.getElementById('errorState')?.classList.remove('hidden');
      document.getElementById('requestsList')?.classList.add('hidden');
      document.getElementById('emptyState')?.classList.add('hidden');
    }
  }

  #showRequests() {
    document.getElementById('requestsList')?.classList.remove('hidden');
    document.getElementById('emptyState')?.classList.add('hidden');
  }

  #showEmpty() {
    document.getElementById('emptyState')?.classList.remove('hidden');
    document.getElementById('requestsList')?.classList.add('hidden');
  }
}

if (typeof window !== 'undefined') {
  window.HrStudentResignationListFeature = HrStudentResignationListFeature;
}

}
