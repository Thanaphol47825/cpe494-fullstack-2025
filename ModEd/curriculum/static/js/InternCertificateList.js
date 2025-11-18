if (typeof window !== 'undefined' && !window.InternCertificateList) {
    class InternCertificateList {
        constructor(application, internStudentId = null) {
            this.application = application;
            this.internStudentId = internStudentId;
            this.certificates = [];
            this.filteredCertificates = [];
            this.searchTerm = '';
            this.sortBy = 'id';
            this.sortOrder = 'asc';
            
            // Get user role from localStorage
            this.userRole = localStorage.getItem('role') || 'Student';
            this.currentUserId = parseInt(localStorage.getItem('userId')) || null;
            
            // Check permissions
            this.canCreate = this.userRole === 'Instructor' || this.userRole === 'Admin';
            this.canEdit = this.userRole === 'Instructor' || this.userRole === 'Admin';
            this.canDelete = this.userRole === 'Instructor' || this.userRole === 'Admin';
            this.canRead = true; // All roles can read
        }

        async loadInternshipPageTemplate() {
            if (!window.InternshipPageTemplate) {
                const script = document.createElement("script");
                script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
                document.head.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = () => {
                        if (window.InternshipPageTemplate) {
                            resolve();
                        } else {
                            reject(new Error("InternshipPageTemplate failed to load"));
                        }
                    };
                    script.onerror = () =>
                        reject(new Error("Failed to load InternshipPageTemplate script"));
                });
            }
        }

        async render() {
            console.log("Certificate List");
            console.log("User Role:", this.userRole);
            console.log("Can Create:", this.canCreate);

            try {
                await this.loadInternshipPageTemplate();
                await this.loadData();

                this.application.mainContainer.innerHTML = "";

                const pageConfig = this.preparePageConfig();
                const listContent = this.createListContent();

                const pageElement = await window.InternshipPageTemplate.render(
                    pageConfig,
                    listContent,
                    this.application
                );

                this.application.mainContainer.appendChild(pageElement);

                this.setupEventListeners();
            } catch (error) {
                console.error("Error rendering InternCertificateList:", error);
                this.showError("Failed to load certificates: " + error.message);
            }
        }

        preparePageConfig() {
            return {
                title: "Internship Certificates",
                description: this.internStudentId ? 
                    "View certificates for this intern student" : 
                    "Manage all internship certificates",
                showBackButton: !!this.internStudentId,
                backButtonText: "Back to Intern Student",
                backButtonRoute: this.internStudentId ? 
                    `/#internship/internstudent/edit/${this.internStudentId}` : 
                    null,
                pageClass: "internship-certificate-list-page",
                headerClass: "internship-header",
                contentClass: "internship-content",
            };
        }

        async loadData() {
            try {
                // Build query string
                let url = '/curriculum/Certificate/';
                const params = new URLSearchParams();
                
                // Add filters if provided
                if (this.internStudentId) {
                    params.append('intern_student_id', this.internStudentId);
                }
                
                // Append params if any
                const queryString = params.toString();
                if (queryString) {
                    url += '?' + queryString;
                }
                
                const response = await fetch(url, {
                    headers: {
                        'X-User-Role': this.userRole,
                        'X-User-Id': this.currentUserId
                    }
                });
                const data = await response.json();
                
                if (data.isSuccess) {
                    this.certificates = data.result || [];
                    this.filteredCertificates = [...this.certificates];
                } else {
                    throw new Error('Failed to load certificates');
                }
            } catch (error) {
                console.error('Error loading certificates:', error);
                throw error;
            }
        }

        createListContent() {
            // Role badge
            const roleBadge = this.getRoleBadge();

            // Create button (only for Instructor and Admin)
            const createButton = this.canCreate ? 
                `<button id="create-certificate-btn" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Certificate
                </button>` : '';

            return `
                <div class="space-y-6">
                    <!-- Role Info and Actions -->
                    <div class="flex justify-between items-center">
                        <div>
                            ${roleBadge}
                        </div>
                        <div class="flex space-x-3">
                            ${createButton}
                        </div>
                    </div>

                    <!-- Search and Filter -->
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1">
                                <input 
                                    type="text" 
                                    id="search-input" 
                                    placeholder="Search certificates by name..." 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value="${this.searchTerm}"
                                />
                            </div>
                            <div class="flex gap-2">
                                <select id="sort-select" class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                    <option value="id">Sort by ID</option>
                                    <option value="certificate_name">Sort by Name</option>
                                    <option value="company_id">Sort by Company</option>
                                </select>
                                <button id="sort-order-btn" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    ${this.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            Found ${this.filteredCertificates.length} certificate(s)
                        </div>
                    </div>

                    <!-- Certificates List -->
                    <div id="certificates-container">
                        ${this.createCertificatesGrid()}
                    </div>
                </div>
            `;
        }

        getRoleBadge() {
            const roleColors = {
                'Admin': 'bg-purple-100 text-purple-800',
                'Instructor': 'bg-blue-100 text-blue-800',
                'Student': 'bg-green-100 text-green-800'
            };

            const rolePermissions = {
                'Admin': 'Full Access',
                'Instructor': 'Can Create/Edit/Delete',
                'Student': 'Read Only'
            };

            const colorClass = roleColors[this.userRole] || 'bg-gray-100 text-gray-800';
            const permission = rolePermissions[this.userRole] || 'Limited Access';

            return `
                <div class="inline-flex items-center space-x-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${colorClass}">
                        ${this.userRole}
                    </span>
                    <span class="text-sm text-gray-600">${permission}</span>
                </div>
            `;
        }

        createCertificatesGrid() {
            if (this.filteredCertificates.length === 0) {
                return `
                    <div class="bg-white p-8 rounded-lg shadow text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
                        <p class="mt-1 text-sm text-gray-500">
                            ${this.canCreate ? 'Get started by creating a new certificate.' : 'No certificates available yet.'}
                        </p>
                    </div>
                `;
            }

            return `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.filteredCertificates.map(cert => this.createCertificateCard(cert)).join('')}
                </div>
            `;
        }

        createCertificateCard(certificate) {
            const viewButton = `
                <button class="view-certificate-btn flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" data-id="${certificate.ID}">
                    ${this.canEdit ? 'Edit' : 'View'}
                </button>
            `;

            const deleteButton = this.canDelete ? `
                <button class="delete-certificate-btn px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50" data-id="${certificate.ID}">
                    Delete
                </button>
            ` : '';

            return `
                <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div class="space-y-4">
                        <!-- Certificate Info -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 truncate" title="${certificate.certificate_name || 'Unnamed Certificate'}">
                                ${certificate.certificate_name || 'Unnamed Certificate'}
                            </h3>
                            <p class="text-sm text-gray-500 mt-1">ID: #${certificate.ID}</p>
                        </div>

                        <!-- Details -->
                        <div class="space-y-2 text-sm">
                            <div class="flex items-center text-gray-600">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <span>Company: ${certificate.Company?.company_name || `ID: ${certificate.company_id}`}</span>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Student ID: ${certificate.intern_student_id}</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 pt-4 border-t border-gray-200">
                            ${viewButton}
                            ${deleteButton}
                        </div>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            // Back button
            const backButton = document.querySelector("[data-back-button]");
            if (backButton) {
                backButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goBack();
                });
            }

            // Create button
            const createButton = document.getElementById("create-certificate-btn");
            if (createButton && this.canCreate) {
                createButton.addEventListener("click", () => {
                    this.navigateToCreate();
                });
            }

            // Search input
            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    this.searchTerm = e.target.value;
                    this.filterAndSort();
                    this.updateCertificatesDisplay();
                });
            }

            // Sort select
            const sortSelect = document.getElementById("sort-select");
            if (sortSelect) {
                sortSelect.value = this.sortBy;
                sortSelect.addEventListener("change", (e) => {
                    this.sortBy = e.target.value;
                    this.filterAndSort();
                    this.updateCertificatesDisplay();
                });
            }

            // Sort order button
            const sortOrderBtn = document.getElementById("sort-order-btn");
            if (sortOrderBtn) {
                sortOrderBtn.addEventListener("click", () => {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                    sortOrderBtn.textContent = this.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc';
                    this.filterAndSort();
                    this.updateCertificatesDisplay();
                });
            }

            // View/Edit buttons
            const viewButtons = document.querySelectorAll(".view-certificate-btn");
            viewButtons.forEach(button => {
                button.addEventListener("click", (e) => {
                    const certificateId = e.currentTarget.dataset.id;
                    this.navigateToEdit(certificateId);
                });
            });

            // Delete buttons
            if (this.canDelete) {
                const deleteButtons = document.querySelectorAll(".delete-certificate-btn");
                deleteButtons.forEach(button => {
                    button.addEventListener("click", (e) => {
                        const certificateId = e.currentTarget.dataset.id;
                        this.handleDelete(certificateId);
                    });
                });
            }
        }

        filterAndSort() {
            // Filter
            this.filteredCertificates = this.certificates.filter(cert => {
                if (!this.searchTerm) return true;
                const searchLower = this.searchTerm.toLowerCase();
                return (
                    cert.certificate_name?.toLowerCase().includes(searchLower) ||
                    cert.Company?.company_name?.toLowerCase().includes(searchLower) ||
                    cert.ID?.toString().includes(searchLower)
                );
            });

            // Sort
            this.filteredCertificates.sort((a, b) => {
                let aVal = a[this.sortBy];
                let bVal = b[this.sortBy];

                if (this.sortBy === 'certificate_name') {
                    aVal = (aVal || '').toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                }

                if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        updateCertificatesDisplay() {
            const container = document.getElementById("certificates-container");
            if (container) {
                container.innerHTML = this.createCertificatesGrid();
                
                // Re-attach event listeners for new buttons
                const viewButtons = container.querySelectorAll(".view-certificate-btn");
                viewButtons.forEach(button => {
                    button.addEventListener("click", (e) => {
                        const certificateId = e.currentTarget.dataset.id;
                        this.navigateToEdit(certificateId);
                    });
                });

                if (this.canDelete) {
                    const deleteButtons = container.querySelectorAll(".delete-certificate-btn");
                    deleteButtons.forEach(button => {
                        button.addEventListener("click", (e) => {
                            const certificateId = e.currentTarget.dataset.id;
                            this.handleDelete(certificateId);
                        });
                    });
                }
            }
        }

        async handleDelete(certificateId) {
            if (!this.canDelete) {
                this.showError('You do not have permission to delete certificates.');
                return;
            }

            const certificate = this.certificates.find(c => c.ID === parseInt(certificateId));
            const confirmDelete = confirm(
                `Are you sure you want to delete this certificate?\n\nCertificate: ${certificate?.certificate_name || 'Unknown'}\n\nThis action cannot be undone.`
            );

            if (!confirmDelete) return;

            try {
                const response = await fetch(`/curriculum/DeleteCertificate/${certificateId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Role': this.userRole,
                        'X-User-Id': this.currentUserId
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.isSuccess) {
                    if (response.status === 403) {
                        throw new Error('Permission denied. Only Instructors and Admins can delete certificates.');
                    }
                    throw new Error(result.error || 'Failed to delete certificate');
                }

                window.InternshipPageTemplate.showSuccess(
                    'Certificate deleted successfully!',
                    this.application.mainContainer
                );

                // Reload data and refresh display
                await this.loadData();
                this.filterAndSort();
                this.updateCertificatesDisplay();

            } catch (error) {
                console.error('Error:', error);
                this.showError(error.message);
            }
        }

        navigateToCreate() {
            const route = this.internStudentId ? 
                `/internship/certificate/create/${this.internStudentId}` : 
                `/internship/certificate/create`;
            
            if (this.application.navigate) {
                this.application.navigate(route);
            } else {
                window.location.hash = `#${route}`;
            }
        }

        navigateToEdit(certificateId) {
            const route = this.internStudentId ? 
                `/internship/certificate/edit/${certificateId}/${this.internStudentId}` : 
                `/internship/certificate/edit/${certificateId}`;
            
            if (this.application.navigate) {
                this.application.navigate(route);
            } else {
                window.location.hash = `#${route}`;
            }
        }

        goBack() {
            if (this.internStudentId) {
                if (this.application.navigate) {
                    this.application.navigate(`/internship/internstudent/edit/${this.internStudentId}`);
                } else {
                    window.location.hash = `#/internship/internstudent/edit/${this.internStudentId}`;
                }
            } else {
                if (this.application.navigate) {
                    this.application.navigate("/internship");
                } else {
                    window.location.hash = "#/internship";
                }
            }
        }

        showError(message) {
            if (window.InternshipPageTemplate) {
                window.InternshipPageTemplate.showError(
                    message,
                    this.application.mainContainer
                );
            } else {
                alert(message);
            }
        }
    }

    if (typeof window !== "undefined") {
        window.InternCertificateList = InternCertificateList;
    }
}