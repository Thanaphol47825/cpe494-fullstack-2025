if (typeof window !== 'undefined' && !window.InternStudentList) {
    class InternStudentList {
        constructor(application) {
            this.application = application;
            this.tableManager = null;
            this.currentData = [];
        }

        async render() {
            console.log("Rendering Intern Student List");
            
            // Set global instance for onclick handlers
            window.internStudentList = this;
            
            // Clear the container
            this.application.mainContainer.innerHTML = '';

            // Create the main page layout
            const pageHTML = this.createPageHTML();
            const pageWrapper = this.application.create(pageHTML);
            this.application.mainContainer.appendChild(pageWrapper);

            // Initialize event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInternStudents();
        }

        createPageHTML() {
            return `
                <div class="bg-gray-100 min-h-screen py-8">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <!-- Header Section -->
                        <div class="mb-8">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h1 class="text-3xl font-bold text-gray-900">Intern Students</h1>
                                    <p class="mt-2 text-sm text-gray-700">Manage and view all intern students</p>
                                </div>
                                <div class="flex space-x-3">
                                    <button id="refresh-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                                        <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Refresh
                                    </button>
                                    <button id="create-btn" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">
                                        <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Create New
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Stats Section (Optional) -->
                        <div id="stats-section" class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-white rounded-lg shadow p-6">
                                <div class="flex items-center">
                                    <div class="p-2 bg-blue-100 rounded-lg">
                                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600">Total Interns</p>
                                        <p id="total-count" class="text-2xl font-semibold text-gray-900">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-lg shadow p-6">
                                <div class="flex items-center">
                                    <div class="p-2 bg-green-100 rounded-lg">
                                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600">Active</p>
                                        <p id="active-count" class="text-2xl font-semibold text-gray-900">0</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-lg shadow p-6">
                                <div class="flex items-center">
                                    <div class="p-2 bg-indigo-100 rounded-lg">
                                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-600">Completed</p>
                                        <p id="completed-count" class="text-2xl font-semibold text-gray-900">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Search and Filter Section -->
                        <div class="mb-6 bg-white rounded-lg shadow p-4">
                            <div class="flex flex-col sm:flex-row gap-4">
                                <div class="flex-1">
                                    <label for="search-input" class="sr-only">Search</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                        </div>
                                        <input id="search-input" type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Search by student name or code...">
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <select id="status-filter" class="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                        <option value="">All Status</option>
                                        <option value="NOT_STARTED">Not Started</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                    <button id="clear-filters" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div id="loading" class="text-center py-12">
                            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p class="mt-4 text-gray-600">Loading intern students...</p>
                        </div>

                        <!-- Error State -->
                        <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">Error</h3>
                                    <div class="mt-2 text-sm text-red-700">
                                        <span id="error-text"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Table Container -->
                        <div id="table-container" class="hidden bg-white shadow overflow-hidden sm:rounded-lg">
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="id">
                                                ID
                                                <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                                </svg>
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="student_code">
                                                Student Code
                                                <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                                </svg>
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="student_name">
                                                Student Name
                                                <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                                </svg>
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="status">
                                                Status
                                                <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                                </svg>
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Overview
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" data-sort="created_at">
                                                Created At
                                                <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                                </svg>
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody id="table-tbody" class="bg-white divide-y divide-gray-200">
                                        <!-- Rows will be inserted here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Pagination -->
                            <div id="pagination" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div class="flex-1 flex justify-between sm:hidden">
                                    <button id="prev-mobile" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Previous
                                    </button>
                                    <button id="next-mobile" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Next
                                    </button>
                                </div>
                                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p class="text-sm text-gray-700">
                                            Showing <span id="showing-from" class="font-medium">0</span> to <span id="showing-to" class="font-medium">0</span> of <span id="total-results" class="font-medium">0</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav id="pagination-nav" class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <!-- Pagination buttons will be inserted here -->
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div id="empty-state" class="hidden text-center py-12 bg-white rounded-lg shadow">
                            <div class="mx-auto h-24 w-24 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-full h-full">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025" />
                                </svg>
                            </div>
                            <h3 class="mt-4 text-lg font-medium text-gray-900">No intern students found</h3>
                            <p class="mt-2 text-sm text-gray-500">Get started by creating your first intern student.</p>
                            <div class="mt-6">
                                <button id="create-empty-btn" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Create Intern Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            // Refresh button
            document.getElementById('refresh-btn')?.addEventListener('click', () => this.loadInternStudents());

            // Create buttons
            document.getElementById('create-btn')?.addEventListener('click', () => this.navigateToCreate());
            document.getElementById('create-empty-btn')?.addEventListener('click', () => this.navigateToCreate());

            // Search functionality
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => this.handleSearch(e.target.value), 300);
                });
            }

            // Status filter
            document.getElementById('status-filter')?.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));

            // Clear filters
            document.getElementById('clear-filters')?.addEventListener('click', () => this.clearFilters());

            // Table sorting
            document.querySelectorAll('[data-sort]').forEach(header => {
                header.addEventListener('click', (e) => this.handleSort(e.currentTarget.getAttribute('data-sort')));
            });
        }

        async loadInternStudents() {
            this.showLoading();
            
            try {
                const response = await fetch('/curriculum/InternStudent', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('API Response:', data);

                if (data.isSuccess) {
                    this.currentData = data.result || [];
                    this.updateStats();
                    
                    if (this.currentData.length > 0) {
                        this.renderTable(this.currentData);
                    } else {
                        this.showEmptyState();
                    }
                } else {
                    throw new Error(data.error || 'Failed to fetch intern students');
                }
            } catch (error) {
                console.error('Error loading intern students:', error);
                this.showError(error.message);
            }
        }

        updateStats() {
            const total = this.currentData.length;
            const active = this.currentData.filter(intern => intern.intern_status === 'ACTIVE').length;
            const completed = this.currentData.filter(intern => intern.intern_status === 'COMPLETED').length;

            document.getElementById('total-count').textContent = total;
            document.getElementById('active-count').textContent = active;
            document.getElementById('completed-count').textContent = completed;
        }

        renderTable(internStudents) {
            const tbody = document.getElementById('table-tbody');
            if (!tbody) return;

            tbody.innerHTML = '';

            internStudents.forEach((intern, index) => {
                const row = this.createTableRow(intern, index);
                tbody.appendChild(row);
            });

            this.showTable();
        }

        createTableRow(intern, index) {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors duration-150';

            // Format date
            const createdAt = new Date(intern.CreatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Status badge
            const statusBadge = this.createStatusBadge(intern.intern_status);

            // Student info
            const studentCode = intern.Student ? intern.Student.student_code : 'N/A';
            const studentName = intern.Student 
                ? `${intern.Student.first_name || ''} ${intern.Student.last_name || ''}`.trim() || 'N/A'
                : 'N/A';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${intern.ID}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="font-medium">${studentCode}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span class="text-xs font-medium text-gray-600">${studentName.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${studentName}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs truncate" title="${intern.overview || 'No overview'}">
                        ${intern.overview || '<span class="text-gray-400 italic">No overview</span>'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${createdAt}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                        <button onclick="window.internStudentList.viewIntern(${intern.ID})" 
                                class="text-blue-600 hover:text-blue-900 transition-colors duration-150">
                            View
                        </button>
                        <button onclick="window.internStudentList.editIntern(${intern.ID})" 
                                class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150">
                            Edit
                        </button>
                        <button onclick="window.internStudentList.deleteIntern(${intern.ID})" 
                                class="text-red-600 hover:text-red-900 transition-colors duration-150">
                            Delete
                        </button>
                    </div>
                </td>
            `;

            return tr;
        }

        createStatusBadge(status) {
            let badgeClass = '';
            let displayText = status;
            let iconSvg = '';

            switch (status) {
                case 'NOT_STARTED':
                    badgeClass = 'bg-gray-100 text-gray-800';
                    displayText = 'Not Started';
                    iconSvg = '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';
                    break;
                case 'ACTIVE':
                    badgeClass = 'bg-green-100 text-green-800';
                    displayText = 'Active';
                    iconSvg = '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                    break;
                case 'COMPLETED':
                    badgeClass = 'bg-blue-100 text-blue-800';
                    displayText = 'Completed';
                    iconSvg = '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                    break;
                default:
                    badgeClass = 'bg-gray-100 text-gray-800';
                    iconSvg = '<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
            }

            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">${iconSvg}${displayText}</span>`;
        }

        handleSearch(searchTerm) {
            if (!searchTerm.trim()) {
                this.renderTable(this.currentData);
                return;
            }

            const filtered = this.currentData.filter(intern => {
                const studentName = intern.Student 
                    ? `${intern.Student.first_name || ''} ${intern.Student.last_name || ''}`.toLowerCase()
                    : '';
                const studentCode = intern.Student ? intern.Student.student_code.toLowerCase() : '';
                const search = searchTerm.toLowerCase();

                return studentName.includes(search) || studentCode.includes(search);
            });

            this.renderTable(filtered);
        }

        handleStatusFilter(status) {
            if (!status) {
                this.renderTable(this.currentData);
                return;
            }

            const filtered = this.currentData.filter(intern => intern.intern_status === status);
            this.renderTable(filtered);
        }

        clearFilters() {
            document.getElementById('search-input').value = '';
            document.getElementById('status-filter').value = '';
            this.renderTable(this.currentData);
        }

        handleSort(column) {
            // Implementation for sorting functionality
            console.log('Sort by:', column);
        }

        showLoading() {
            document.getElementById('loading')?.classList.remove('hidden');
            document.getElementById('table-container')?.classList.add('hidden');
            document.getElementById('empty-state')?.classList.add('hidden');
            document.getElementById('error-message')?.classList.add('hidden');
        }

        showTable() {
            document.getElementById('loading')?.classList.add('hidden');
            document.getElementById('table-container')?.classList.remove('hidden');
            document.getElementById('empty-state')?.classList.add('hidden');
            document.getElementById('error-message')?.classList.add('hidden');
        }

        showEmptyState() {
            document.getElementById('loading')?.classList.add('hidden');
            document.getElementById('table-container')?.classList.add('hidden');
            document.getElementById('empty-state')?.classList.remove('hidden');
            document.getElementById('error-message')?.classList.add('hidden');
        }

        showError(message) {
            document.getElementById('loading')?.classList.add('hidden');
            document.getElementById('table-container')?.classList.add('hidden');
            document.getElementById('empty-state')?.classList.add('hidden');
            
            const errorMessage = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');
            
            if (errorText) errorText.textContent = message;
            if (errorMessage) errorMessage.classList.remove('hidden');
        }

        // Action methods
        async viewIntern(internId) {
            try {
                const response = await fetch(`/curriculum/InternStudent/${internId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    const intern = data.result;
                    const studentName = intern.Student 
                        ? `${intern.Student.first_name || ''} ${intern.Student.last_name || ''}`.trim()
                        : 'N/A';
                    const studentCode = intern.Student ? intern.Student.student_code : 'N/A';
                    
                    // Create a better modal/popup for viewing details
                    const details = `
                        Intern Student Details:
                        
                        ID: ${intern.ID}
                        Student Code: ${studentCode}
                        Student Name: ${studentName}
                        Status: ${intern.intern_status}
                        Overview: ${intern.overview || 'No overview'}
                        Created: ${new Date(intern.CreatedAt).toLocaleDateString()}
                    `;
                    
                    alert(details);
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error viewing intern:', error);
                alert('Failed to load intern details');
            }
        }

        async editIntern(internId) {
            console.log('Edit intern:', internId);
            
            try {
                // Load the edit module
                await this.application.fetchModule('/curriculum/static/js/InternStudentEdit.js');
                
                if (window.InternStudentEdit) {
                    const editForm = new window.InternStudentEdit(this.application, internId);
                    await editForm.render();
                } else {
                    console.error('InternStudentEdit class not found');
                    this.showError('Failed to load edit form');
                }
            } catch (error) {
                console.error('Error loading edit form:', error);
                this.showError('Failed to load edit form: ' + error.message);
            }
        }

        async deleteIntern(internId) {
            if (!confirm('Are you sure you want to delete this intern student? This action cannot be undone.')) {
                return;
            }

            try {
                const response = await fetch(`/curriculum/InternStudent/${internId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                
                if (data.isSuccess) {
                    // Show success message
                    this.showSuccessMessage('Intern student deleted successfully');
                    // Refresh the list
                    await this.loadInternStudents();
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error deleting intern:', error);
                alert('Failed to delete intern student');
            }
        }

        showSuccessMessage(message) {
            // Create a temporary success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
            successDiv.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">${message}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(successDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        }

        navigateToCreate() {
            console.log('Navigate to create intern student');
            this.renderCreateForm();
        }

        async renderCreateForm() {
            try {
                // Load the create module using the application's fetchModule
                await this.application.fetchModule('/curriculum/static/js/InternStudentCreate.js');
                
                if (window.InternStudentCreate) {
                    const createForm = new window.InternStudentCreate(this.application);
                    await createForm.render();
                } else {
                    console.error('InternStudentCreate class not found');
                    alert('Failed to load create form');
                }
            } catch (error) {
                console.error('Error loading create form:', error);
                alert('Failed to load create form: ' + error.message);
            }
        }
    }
    
    // Make it globally accessible for onclick handlers
    window.InternStudentList = InternStudentList;
    window.internStudentList = null; // Will be set when instantiated
}