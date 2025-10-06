// Department List Feature with Pagination and CRUD Operations
if (typeof HrDepartmentListFeature === 'undefined') {
class HrDepartmentListFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;
    this.totalPages = 0;
    this._allDepartments = [];
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
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-2">Departments</h1>
              <p class="text-lg text-gray-600">Manage departments and budgets</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
              <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600">
                <div class="flex justify-between items-center">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                    </svg>
                    Current Departments
                  </h2>
                  <a href="#hr/departments/create"
                     class="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Department
                  </a>
                </div>
              </div>

              <div class="p-8">
                <!-- Loading -->
                <div id="deptLoading" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600">Loading departments...</p>
                </div>

                <!-- Error -->
                <div id="deptError" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-red-600 mb-4">Failed to load departments</p>
                  <button onclick="window.location.reload()" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
                </div>

                <!-- List -->
                <div id="deptList" class="hidden">
                  <div id="deptContainer" class="space-y-4"></div>
                  <div id="deptPagination" class="mt-8 flex justify-center"></div>
                </div>

                <!-- Empty -->
                <div id="deptEmpty" class="hidden text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
                  <p class="text-gray-600 mb-6">Create your first department to get started.</p>
                  <a href="#hr/departments/create"
                     class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Department
                  </a>
                </div>
              </div>
            </div>

            <!-- Back -->
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
      const el = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(el);
      await this.#loadDepartments();
    } catch (err) {
      console.error('Error creating department list:', err);
      this.#showError('Failed to initialize list: ' + err.message);
    }
  }

  async #loadDepartments() {
    try {
      this.#showLoading();
      const res = await fetch(`${this.rootURL}/hr/departments`, { headers: { Accept: 'application/json' }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      this._allDepartments = Array.isArray(rows) ? rows : (rows?.result || []);
      this.#hideLoading();

      if (!this._allDepartments.length) {
        this.#showEmpty();
        return;
      }

      this.totalItems = this._allDepartments.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      this.#renderDepartments();
      this.#renderPagination();
      this.#showList();
    } catch (err) {
      console.error('Error loading departments:', err);
      this.#hideLoading();
      this.#showError();
    }
  }

  #renderDepartments() {
    const container = document.getElementById('deptContainer');
    if (!container) return;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const slice = this._allDepartments.slice(start, end);

    container.innerHTML = slice.map(dep => {
      const name = dep.name || 'Unknown';
      const faculty = dep.parent || dep.faculty || 'Not specified'; // model json:"parent"
      const budget = typeof dep.budget === 'number' ? `฿${dep.budget.toLocaleString()}` : 'Not set';
      return `
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg mb-2">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">${name}</h3>
                  <p class="text-sm text-gray-600">Faculty: ${faculty}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Budget: ${budget}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button onclick="window.departmentList.viewDepartment('${encodeURIComponent(name)}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
              <button onclick="window.departmentList.editDepartment('${encodeURIComponent(name)}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  #renderPagination() {
    const container = document.getElementById('deptPagination');
    if (!container) return;
    if (this.totalPages <= 1) { container.innerHTML = ''; return; }

    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(`
        <button onclick="window.departmentList.goToPage(${i})"
          class="px-3 py-2 text-sm font-medium rounded-lg ${i === this.currentPage ? 'bg-indigo-600 text-white' : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'}">
          ${i}
        </button>
      `);
    }

    container.innerHTML = `
      <nav class="flex items-center space-x-2">
        <button onclick="window.departmentList.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}
          class="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        ${pages.join('')}
        <button onclick="window.departmentList.goToPage(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}
          class="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </nav>
    `;
  }

  async goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.#renderDepartments();
    this.#renderPagination();
  }

  async viewDepartment(name) {
    try {
      const res = await fetch(`${this.rootURL}/hr/departments/${name}`, { headers: { Accept: 'application/json' }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dep = await res.json();
      this.#showDepartmentModal(dep);
    } catch (err) {
      console.error('Error viewing department:', err);
      alert('Failed to load department details: ' + err.message);
    }
  }

  editDepartment(name) {
    window.location.href = `#hr/departments/edit/${name}`;
  }

  #showDepartmentModal(dep) {
    const name = dep.name || 'Unknown';
    const faculty = dep.parent || dep.faculty || 'Not specified';
    const budget = typeof dep.budget === 'number' ? `฿${dep.budget.toLocaleString()}` : 'Not set';
    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="deptModal">
        <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Department Details</h3>
            <button onclick="document.getElementById('deptModal').remove()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div><span class="text-sm text-gray-600">Name</span><p class="text-gray-900">${name}</p></div>
            <div><span class="text-sm text-gray-600">Faculty</span><p class="text-gray-900">${faculty}</p></div>
            <div><span class="text-sm text-gray-600">Budget</span><p class="text-gray-900">${budget}</p></div>
          </div>
          <div class="flex justify-end mt-6">
            <button onclick="document.getElementById('deptModal').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  #showLoading() {
    document.getElementById('deptLoading')?.classList.remove('hidden');
    document.getElementById('deptError')?.classList.add('hidden');
    document.getElementById('deptList')?.classList.add('hidden');
    document.getElementById('deptEmpty')?.classList.add('hidden');
  }
  #hideLoading() { document.getElementById('deptLoading')?.classList.add('hidden'); }
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
      document.getElementById('deptError')?.classList.remove('hidden');
      document.getElementById('deptList')?.classList.add('hidden');
      document.getElementById('deptEmpty')?.classList.add('hidden');
    }
  }
  #showList() { document.getElementById('deptList')?.classList.remove('hidden'); document.getElementById('deptEmpty')?.classList.add('hidden'); }
  #showEmpty() { document.getElementById('deptEmpty')?.classList.remove('hidden'); document.getElementById('deptList')?.classList.add('hidden'); }
}

if (typeof window !== 'undefined') window.HrDepartmentListFeature = HrDepartmentListFeature;
}
