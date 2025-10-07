// Instructor Resignation List Feature
if (typeof HrInstructorResignationListFeature === 'undefined') {
class HrInstructorResignationListFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.apiService = new HrApiService(this.rootURL);
    this.resignations = [];
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    try {
      // Show loading state
      this.templateEngine.mainContainer.innerHTML = this.#renderLoadingState();
      
      // Load resignations data
      this.resignations = await this.apiService.fetchInstructorResignations();
      
      // Render the list
      this.templateEngine.mainContainer.innerHTML = this.#renderResignationList();
      
      // Attach event listeners
      this.#attachEventListeners();
      
      return true;
    } catch (error) {
      console.error('Error loading instructor resignations:', error);
      this.templateEngine.mainContainer.innerHTML = this.#renderErrorState(error.message);
      return false;
    }
  }

  #renderLoadingState() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Resignation Requests</h1>
            <p class="text-lg text-gray-600">Loading resignation requests...</p>
          </div>
          
          <div class="flex justify-center">
            <div class="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    `;
  }

  #renderResignationList() {
    const resignationsHTML = this.resignations.length > 0 
      ? this.resignations.map(resignation => HrUiComponents.renderInstructorResignationCard(resignation)).join('')
      : HrUiComponents.renderEmptyInstructorResignationsState();

    return `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Resignation Requests</h1>
            <p class="text-lg text-gray-600">Manage instructor resignation and exit processes</p>
          </div>

          <!-- Action Bar -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-lg text-gray-700 font-medium">${this.resignations.length} Request${this.resignations.length !== 1 ? 's' : ''} Found</span>
              </div>
            </div>
            <a routerLink="hr/resignation/instructor/create" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Resignation Request
            </a>
          </div>

          <!-- Resignations List -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Current Requests
              </h2>
            </div>
            
            <div class="p-8">
              ${resignationsHTML}
            </div>
          </div>

          <!-- Back to Resignation Menu -->
          <div class="text-center mt-8">
            <a routerLink="hr/resignation" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Resignation Menu
            </a>
          </div>
        </div>
      </div>
    `;
  }

  #renderErrorState(errorMessage) {
    return `
      <div class="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Error Loading Resignations</h1>
            <p class="text-lg text-red-600">Failed to load instructor resignation data</p>
          </div>

          <!-- Error Content -->
          <div class="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Error Details
              </h2>
            </div>
            
            <div class="p-8">
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 class="text-lg font-semibold text-red-800 mb-2">Failed to Load Resignations</h3>
                    <p class="text-red-700 mb-4">${errorMessage}</p>
                    <button onclick="window.instructorResignationList.render()" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back to Resignation Menu -->
          <div class="text-center mt-8">
            <a routerLink="hr/resignation" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Resignation Menu
            </a>
          </div>
        </div>
      </div>
    `;
  }

  #attachEventListeners() {
    // Add any specific event listeners here if needed
    // For now, the routerLink navigation is handled by the core system
  }

  async refresh() {
    await this.render();
  }

  async approveRequest(requestId) {
    if (!confirm('Are you sure you want to approve this instructor resignation request?')) return;
    
    try {
      await this.apiService.reviewInstructorResignation(requestId, 'approve', '');
      alert('Request approved successfully!');
      await this.render(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + error.message);
    }
  }

  async rejectRequest(requestId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      await this.apiService.reviewInstructorResignation(requestId, 'reject', reason);
      alert('Request rejected successfully!');
      await this.render(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + error.message);
    }
  }

  async viewResignation(resignationId) {
    try {
      const resignation = await this.apiService.fetchInstructorResignation(resignationId);
      this.#renderResignationDetails(resignation);
    } catch (error) {
      console.error('Error loading resignation details:', error);
      alert(`Error loading resignation: ${error.message}`);
    }
  }

  #renderResignationDetails(resignation) {
    const instructorCode = resignation.InstructorCode || 'N/A';
    const reason = resignation.Reason || 'No reason provided';
    const status = resignation.Status || 'Pending';
    const requestedAt = resignation.CreatedAt ? new Date(resignation.CreatedAt).toLocaleString() : 'Unknown';
    const effectiveDate = resignation.EffectiveDate ? new Date(resignation.EffectiveDate).toLocaleDateString() : 'Not specified';
    const additionalNotes = resignation.AdditionalNotes || 'None';

    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Instructor Resignation Details</h1>
            <p class="text-xl text-gray-600">Request from ${instructorCode}</p>
          </div>

          <!-- Resignation Details Card -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Resignation Information
              </h2>
            </div>
            
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Instructor Code</p>
                      <p class="text-lg font-semibold text-gray-900">${instructorCode}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Effective Date</p>
                      <p class="text-lg font-semibold text-gray-900">${effectiveDate}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Status</p>
                      <p class="text-lg font-semibold text-gray-900">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === 'Approved' ? 'bg-green-100 text-green-800' : status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">${status}</span>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Requested At</p>
                      <p class="text-lg font-semibold text-gray-900">${requestedAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reason and Notes -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Resignation Details</h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-gray-500 mb-2">Reason for Resignation</p>
                    <p class="text-base text-gray-900 bg-gray-50 p-4 rounded-lg">${reason}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-2">Additional Notes</p>
                    <p class="text-base text-gray-900 bg-gray-50 p-4 rounded-lg">${additionalNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4 mt-8">
            <button onclick="window.instructorResignationList.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Register the class globally
if (typeof window !== 'undefined') {
  window.HrInstructorResignationListFeature = HrInstructorResignationListFeature;
  // Also register an instance for global access
  window.instructorResignationList = null;
}
}
