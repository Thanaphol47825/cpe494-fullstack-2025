// Student List Feature with Pagination and CRUD Operations
if (typeof HrStudentListFeature === 'undefined') {
class HrStudentListFeature {
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
        <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Student Management</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Manage student records and academic progress</p>
            </div>

            <!-- Current Students Section -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
              <div class="px-8 py-6 bg-gradient-to-r from-green-500 to-teal-600">
                <div class="flex justify-between items-center">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                    </svg>
                    Current Students
                  </h2>
                  <a href="#hr/students/create" 
                     class="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Student
                  </a>
                </div>
              </div>
              
              <div class="p-8">
                <!-- Loading State -->
                <div id="loadingState" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600">Loading students...</p>
                </div>

                <!-- Error State -->
                <div id="errorState" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-red-600 mb-4">Failed to load students</p>
                  <button onclick="window.location.reload()" 
                          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Retry
                  </button>
                </div>

                <!-- Students List -->
                <div id="studentsList" class="hidden">
                  <div id="studentsContainer" class="space-y-4">
                    <!-- Students will be loaded here -->
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
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                  <p class="text-gray-600 mb-6">There are currently no students to display.</p>
                  <a href="#hr/students/create" 
                     class="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add First Student
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

      // Load students
      await this.#loadStudents();
    } catch (error) {
      console.error('Error creating student list:', error);
      this.#showError('Failed to initialize list: ' + error.message);
    }
  }

  async #loadStudents() {
    try {
      this.#showLoading();
      const students = await this.api.fetchStudents();
      this.#hideLoading();
      
      if (!students || students.length === 0) {
        this.#showEmpty();
        return;
      }

      this.totalItems = students.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      this.#renderStudents(students);
      this.#renderPagination();
      this.#showStudents();
    } catch (error) {
      console.error('Error loading students:', error);
      this.#hideLoading();
      this.#showError();
    }
  }

  #renderStudents(students) {
    const container = document.getElementById('studentsContainer');
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageStudents = students.slice(startIndex, endIndex);

    container.innerHTML = pageStudents.map(student => this.#renderStudentCard(student)).join('');
  }

  #renderStudentCard(student) {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown';
    const program = student.program || 'Not specified';
    const email = student.email || 'No email provided';
    const studentCode = student.student_code || 'N/A';
    const startDate = student.start_date ? new Date(student.start_date).toLocaleDateString() : 'Not specified';
    const year = student.year || 'Not specified';
    const status = student.status || 'Active';

    return `
      <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg mb-6">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">${fullName}</h3>
                <p class="text-sm text-gray-600">Code: ${studentCode}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${status}
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="space-y-2">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                </svg>
                <span class="font-medium">Program:</span> ${program}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium">Year:</span> ${year}
              </div>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-3">
            <button onclick="window.studentList.viewStudent('${studentCode}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Details
            </button>
            <button onclick="window.studentList.editStudent('${studentCode}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
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
        <button onclick="window.studentList.goToPage(${this.currentPage - 1})" 
                ${this.currentPage === 1 ? 'disabled' : ''}
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        
        ${this.#generatePageNumbers()}
        
        <button onclick="window.studentList.goToPage(${this.currentPage + 1})" 
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
        <button onclick="window.studentList.goToPage(${i})" 
                class="px-3 py-2 text-sm font-medium rounded-lg ${
                  i === this.currentPage 
                    ? 'bg-green-600 text-white' 
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
    await this.#loadStudents();
  }

  async viewStudent(studentCode) {
    try {
      const student = await this.api.fetchStudent(studentCode);
      this.#showStudentModal(student);
    } catch (error) {
      console.error('Error viewing student:', error);
      alert('Failed to load student details: ' + error.message);
    }
  }

  async editStudent(studentCode) {
    try {
      const student = await this.api.fetchStudent(studentCode);
      this.#showEditModal(student);
    } catch (error) {
      console.error('Error loading student for edit:', error);
      alert('Failed to load student for editing: ' + error.message);
    }
  }

  #showStudentModal(student) {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown';
    const program = student.program || 'Not specified';
    const email = student.email || 'No email provided';
    const studentCode = student.student_code || 'N/A';
    const startDate = student.start_date ? new Date(student.start_date).toLocaleDateString() : 'Not specified';
    const year = student.year || 'Not specified';
    const status = student.status || 'Active';
    const department = student.department || 'Not specified';
    const advisorCode = student.advisor_code || 'Not specified';
    const gender = student.gender || 'Not specified';

    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="studentModal">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Student Details - ${fullName}</h3>
            <button onclick="document.getElementById('studentModal').remove()" 
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
                <p class="mt-1 text-sm text-gray-900">${studentCode}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <p class="mt-1 text-sm text-gray-900">${status}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <p class="mt-1 text-sm text-gray-900">${student.first_name || 'N/A'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <p class="mt-1 text-sm text-gray-900">${student.last_name || 'N/A'}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">${email}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Program</label>
                <p class="mt-1 text-sm text-gray-900">${program}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <p class="mt-1 text-sm text-gray-900">${department}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Year</label>
                <p class="mt-1 text-sm text-gray-900">${year}</p>
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
                <label class="block text-sm font-medium text-gray-700">Advisor Code</label>
                <p class="mt-1 text-sm text-gray-900">${advisorCode}</p>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button onclick="document.getElementById('studentModal').remove()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  #showEditModal(student) {
    // Redirect to edit page
    window.location.href = `#hr/students/edit/${student.student_code}`;
  }

  #showLoading() {
    document.getElementById('loadingState')?.classList.remove('hidden');
    document.getElementById('errorState')?.classList.add('hidden');
    document.getElementById('studentsList')?.classList.add('hidden');
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
      document.getElementById('studentsList')?.classList.add('hidden');
      document.getElementById('emptyState')?.classList.add('hidden');
    }
  }

  #showStudents() {
    document.getElementById('studentsList')?.classList.remove('hidden');
    document.getElementById('emptyState')?.classList.add('hidden');
  }

  #showEmpty() {
    document.getElementById('emptyState')?.classList.remove('hidden');
    document.getElementById('studentsList')?.classList.add('hidden');
  }
}

if (typeof window !== 'undefined') {
  window.HrStudentListFeature = HrStudentListFeature;
}

}
