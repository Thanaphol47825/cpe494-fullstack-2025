if (typeof window !== 'undefined' && !window.InternStudentList) {
    class InternStudentList {
        constructor(application) {
            this.application = application;
            this.tableManager = null;
        }

        async render() {
            console.log("Rendering Intern Student List");
            
            // Clear the container
            this.application.mainContainer.innerHTML = '';

            // Create the page wrapper with table
            const pageWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="mb-8">
                            <h1 class="text-3xl font-bold text-gray-900">Intern Students</h1>
                            <p class="mt-2 text-sm text-gray-700">Manage and view all intern students</p>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="mb-6 flex justify-between items-center">
                            <div class="flex space-x-3">
                                <button id="refresh-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Refresh
                                </button>
                                <button id="create-btn" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    Create New
                                </button>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div id="loading" class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p class="mt-2 text-gray-600">Loading intern students...</p>
                        </div>

                        <!-- Error State -->
                        <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error!</strong> <span id="error-text"></span>
                        </div>

                        <!-- Table Container -->
                        <div id="table-container" class="hidden bg-white shadow overflow-hidden sm:rounded-md">
                            <div class="overflow-x-auto">
                                <table class="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr rel="headerRow">
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Code</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overview</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody rel="tbody" class="bg-white divide-y divide-gray-200">
                                        <!-- Rows will be inserted here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div id="empty-state" class="hidden text-center py-12">
                            <div class="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025" />
                                </svg>
                            </div>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">No intern students</h3>
                            <p class="mt-1 text-sm text-gray-500">Get started by creating a new intern student.</p>
                            <div class="mt-6">
                                <button id="create-empty-btn" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    Create Intern Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            this.application.mainContainer.appendChild(pageWrapper);

            // Initialize event listeners
            this.setupEventListeners();

            // Load data
            await this.loadInternStudents();
        }

        setupEventListeners() {
            // Refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadInternStudents());
            }

            // Create buttons
            const createBtn = document.getElementById('create-btn');
            const createEmptyBtn = document.getElementById('create-empty-btn');
            
            if (createBtn) {
                createBtn.addEventListener('click', () => this.navigateToCreate());
            }
            
            if (createEmptyBtn) {
                createEmptyBtn.addEventListener('click', () => this.navigateToCreate());
            }
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
                    if (data.result && data.result.length > 0) {
                        this.renderTable(data.result);
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

        renderTable(internStudents) {
            const tbody = document.querySelector('tbody[rel="tbody"]');
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
            tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

            // Format date
            const createdAt = new Date(intern.CreatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Status badge
            const statusBadge = this.createStatusBadge(intern.intern_status);

            const fullName = intern.Student ? `${intern.Student.first_name} ${intern.Student.last_name}` : 'N/A';

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${intern.ID}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${intern.Student ? intern.Student.student_code : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fullName}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${intern.overview || 'No overview'}">${intern.overview || 'No overview'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdAt}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="window.internStudentList.viewIntern(${intern.ID})" 
                                class="text-blue-600 hover:text-blue-900">View</button>
                        <button onclick="window.internStudentList.editIntern(${intern.ID})" 
                                class="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onclick="window.internStudentList.deleteIntern(${intern.ID})" 
                                class="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                </td>
            `;

            return tr;
        }

        createStatusBadge(status) {
            let badgeClass = '';
            let displayText = status;

            switch (status) {
                case 'NOT_STARTED':
                    badgeClass = 'bg-gray-100 text-gray-800';
                    displayText = 'Not Started';
                    break;
                case 'ACTIVE':
                    badgeClass = 'bg-green-100 text-green-800';
                    displayText = 'Active';
                    break;
                case 'COMPLETED':
                    badgeClass = 'bg-blue-100 text-blue-800';
                    displayText = 'Completed';
                    break;
                default:
                    badgeClass = 'bg-gray-100 text-gray-800';
            }

            return `<span class="inline-flex px-2 text-xs font-semibold rounded-full ${badgeClass}">${displayText}</span>`;
        }

        showLoading() {
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('table-container').classList.add('hidden');
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('error-message').classList.add('hidden');
        }

        showTable() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('table-container').classList.remove('hidden');
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('error-message').classList.add('hidden');
        }

        showEmptyState() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('table-container').classList.add('hidden');
            document.getElementById('empty-state').classList.remove('hidden');
            document.getElementById('error-message').classList.add('hidden');
        }

        showError(message) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('table-container').classList.add('hidden');
            document.getElementById('empty-state').classList.add('hidden');
            
            const errorMessage = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');
            
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }

        // Action methods
        async viewIntern(internId) {
            try {
                const response = await fetch(`/curriculum/GetInternStudent/${internId}`);
                const data = await response.json();
                
                if (data.isSuccess) {
                    // Show intern details in a modal or navigate to detail page
                    alert(`Intern Student Details:\nID: ${data.result.ID}\nStatus: ${data.result.intern_status}\nOverview: ${data.result.overview || 'No overview'}`);
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error viewing intern:', error);
                alert('Failed to load intern details');
            }
        }

        editIntern(internId) {
            // Navigate to edit page
            console.log('Edit intern:', internId);
            // You can implement navigation to edit form here
            alert(`Edit functionality for intern ID: ${internId} - To be implemented`);
        }

        async deleteIntern(internId) {
            if (!confirm('Are you sure you want to delete this intern student?')) {
                return;
            }

            try {
                const response = await fetch(`/curriculum/DeleteInternStudent/${internId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                
                if (data.isSuccess) {
                    alert('Intern student deleted successfully');
                    await this.loadInternStudents(); // Refresh the list
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error deleting intern:', error);
                alert('Failed to delete intern student');
            }
        }

        navigateToCreate() {
            console.log('Navigate to create intern student');
            
            // Use the application's routing system
            if (this.application && this.application.navigate) {
                this.application.navigate('/internstudent/create');
            } else if (this.application && this.application.templateEngine) {
                // Use the template engine's navigation
                this.application.templateEngine.navigate('internship/internstudent/create');
            } else {
                // Fallback: Try to trigger the route directly
                window.location.hash = '#internship/internstudent/create';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
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