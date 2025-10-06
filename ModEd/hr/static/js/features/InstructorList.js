// Instructor List Feature with Pagination and CRUD Operations
if (typeof HrInstructorListFeature === 'undefined') {
class HrInstructorListFeature {
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
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Instructor Management</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Manage teaching staff and academic personnel</p>
            </div>

            <!-- Current Instructors Section -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
              <div class="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600">
                <div class="flex justify-between items-center">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Current Instructors
                  </h2>
                  <a href="#hr/instructors/create" 
                     class="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Instructor
                  </a>
                </div>
              </div>
              
              <div class="p-8">
                <!-- Loading State -->
                <div id="loadingState" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600">Loading instructors...</p>
                </div>

                <!-- Error State -->
                <div id="errorState" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-red-600 mb-4">Failed to load instructors</p>
                  <button onclick="window.location.reload()" 
                          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Retry
                  </button>
                </div>

                <!-- Instructors List -->
                <div id="instructorsList" class="hidden">
                  <div id="instructorsContainer" class="space-y-4">
                    <!-- Instructors will be loaded here -->
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No instructors found</h3>
                  <p class="text-gray-600 mb-6">There are currently no instructors to display.</p>
                  <a href="#hr/instructors/create" 
                     class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add First Instructor
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

      // Load instructors
      await this.#loadInstructors();
    } catch (error) {
      console.error('Error creating instructor list:', error);
      this.#showError('Failed to initialize list: ' + error.message);
    }
  }

  async #loadInstructors() {
    try {
      this.#showLoading();
      const instructors = await this.api.fetchInstructors();
      this.#hideLoading();
      
      if (!instructors || instructors.length === 0) {
        this.#showEmpty();
        return;
      }

      this.totalItems = instructors.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      this.#renderInstructors(instructors);
      this.#renderPagination();
      this.#showInstructors();
    } catch (error) {
      console.error('Error loading instructors:', error);
      this.#hideLoading();
      this.#showError();
    }
  }

  #renderInstructors(instructors) {
    const container = document.getElementById('instructorsContainer');
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageInstructors = instructors.slice(startIndex, endIndex);

    container.innerHTML = pageInstructors.map(instructor => this.#renderInstructorCard(instructor)).join('');
  }

  #renderInstructorCard(instructor) {
    const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';
    const department = instructor.department || 'Not specified';
    const email = instructor.email || 'No email provided';
    const instructorCode = instructor.instructor_code || 'N/A';
    const startDate = instructor.start_date ? new Date(instructor.start_date).toLocaleDateString() : 'Not specified';
    const salary = instructor.salary ? `฿${instructor.salary.toLocaleString()}` : 'Not specified';
    const academicPosition = instructor.academic_position || 'Not specified';
    const gender = instructor.gender || 'Not specified';

    return `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg mb-6">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">${fullName}</h3>
                <p class="text-sm text-gray-600">Code: ${instructorCode}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Active
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span class="font-medium">Department:</span> ${department}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="font-medium">Email:</span> ${email}
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="font-medium">Start Date:</span> ${startDate}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <span class="font-medium">Salary:</span> ${salary}
              </div>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-3">
            <button onclick="window.instructorList.viewInstructor('${instructorCode}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Details
            </button>
            <button onclick="window.instructorList.editInstructor('${instructorCode}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit
            </button>
          </div>
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
        <button onclick="window.instructorList.goToPage(${this.currentPage - 1})" 
                ${this.currentPage === 1 ? 'disabled' : ''}
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        
        ${this.#generatePageNumbers()}
        
        <button onclick="window.instructorList.goToPage(${this.currentPage + 1})" 
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
        <button onclick="window.instructorList.goToPage(${i})" 
                class="px-3 py-2 text-sm font-medium rounded-lg ${
                  i === this.currentPage 
                    ? 'bg-blue-600 text-white' 
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
    await this.#loadInstructors();
  }

  async viewInstructor(instructorCode) {
    try {
      const instructor = await this.api.fetchInstructor(instructorCode);
      this.#showInstructorModal(instructor);
    } catch (error) {
      console.error('Error viewing instructor:', error);
      alert('Failed to load instructor details: ' + error.message);
    }
  }

  async editInstructor(instructorCode) {
    try {
      const instructor = await this.api.fetchInstructor(instructorCode);
      this.#showEditModal(instructor);
    } catch (error) {
      console.error('Error loading instructor for edit:', error);
      alert('Failed to load instructor for editing: ' + error.message);
    }
  }

  #showInstructorModal(instructor) {
    const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';
    const department = instructor.department || 'Not specified';
    const email = instructor.email || 'No email provided';
    const instructorCode = instructor.instructor_code || 'N/A';
    const startDate = instructor.start_date ? new Date(instructor.start_date).toLocaleDateString() : 'Not specified';
    const salary = instructor.salary ? `฿${instructor.salary.toLocaleString()}` : 'Not specified';
    const academicPosition = instructor.academic_position || 'Not specified';
    const gender = instructor.gender || 'Not specified';
    const departmentPosition = instructor.department_position || 'Not specified';

    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="instructorModal">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Instructor Details - ${fullName}</h3>
            <button onclick="document.getElementById('instructorModal').remove()" 
                    class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Instructor Code</label>
                <p class="mt-1 text-sm text-gray-900">${instructorCode}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="mt-1 text-sm text-gray-900">Active</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <p class="mt-1 text-sm text-gray-900">${instructor.first_name || 'N/A'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <p class="mt-1 text-sm text-gray-900">${instructor.last_name || 'N/A'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">${email}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <p class="mt-1 text-sm text-gray-900">${department}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Academic Position</label>
                <p class="mt-1 text-sm text-gray-900">${academicPosition}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department Position</label>
                <p class="mt-1 text-sm text-gray-900">${departmentPosition}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <p class="mt-1 text-sm text-gray-900">${startDate}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Gender</label>
                <p class="mt-1 text-sm text-gray-900">${gender}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Salary</label>
                <p class="mt-1 text-sm text-gray-900">${salary}</p>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button onclick="document.getElementById('instructorModal').remove()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  #showEditModal(instructor) {
    // For now, show a simple edit form
    // In a real implementation, this would open a proper edit form
    const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';
    
    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="editModal">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Edit Instructor - ${fullName}</h3>
            <button onclick="document.getElementById('editModal').remove()" 
                    class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Edit Functionality Coming Soon</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>The edit functionality for instructors is currently under development. This feature will allow you to modify instructor information directly from this interface.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-sm text-gray-600">
              <p><strong>Instructor Code:</strong> ${instructor.instructor_code || 'N/A'}</p>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${instructor.email || 'N/A'}</p>
              <p><strong>Department:</strong> ${instructor.department || 'N/A'}</p>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button onclick="document.getElementById('editModal').remove()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  #showLoading() {
    document.getElementById('loadingState')?.classList.remove('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('instructorsList')?.classList.add('hidden');
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
      document.getElementById('instructorsList')?.classList.add('hidden');
      document.getElementById('emptyState')?.classList.add('hidden');
    }
  }

  #showInstructors() {
    document.getElementById('instructorsList')?.classList.remove('hidden');
    document.getElementById('emptyState')?.classList.add('hidden');
  }

  #showEmpty() {
    document.getElementById('emptyState')?.classList.remove('hidden');
    document.getElementById('instructorsList')?.classList.add('hidden');
  }
}

if (typeof window !== 'undefined') {
  window.HrInstructorListFeature = HrInstructorListFeature;
}

console.log('HrInstructorListFeature loaded');
}
