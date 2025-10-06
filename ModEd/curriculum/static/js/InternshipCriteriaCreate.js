class InternshipCriteriaCreate {
    constructor(application) {
        this.application = application;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.criteria = [];
    }

    async render() {
        console.log("Create Internship Criteria Form");
        console.log(this.application);

        if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            document.head.appendChild(script);
        }

        await this.fetchCriteria();

        await this.fetchInternshipApplications();

        let applicationOptions = '<option value="">Select Application</option>';
        if (Array.isArray(this.applications) && this.applications.length > 0) {
            applicationOptions += this.applications.map(app => {
                const id = app.ID !== undefined ? app.ID : app.id;
                const title = app.Title || app.title || `Application #${id}`;
                return `<option value="${id}">${title}</option>`;
            }).join('');
        } else {
            applicationOptions += '<option disabled>No applications found</option>';
        }

        this.application.mainContainer.innerHTML = `
            <div class="container mx-auto p-6 max-w-7xl">
                <!-- Form Section -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Create Internship Criteria</h2>
                    <form id="criteriaForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Title Field -->
                            <div>
                                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                                    Title <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="title" name="title" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter criteria title">
                            </div>

                            <!-- Score Field -->
                            <div>
                                <label for="score" class="block text-sm font-medium text-gray-700 mb-2">
                                    Score <span class="text-red-500">*</span>
                                </label>
                                <input type="number" id="score" name="score" required min="0" max="100"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter score (0-100)">
                            </div>
                        </div>

                        <!-- Description Field -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                                Description <span class="text-red-500">*</span>
                            </label>
                            <textarea id="description" name="description" required rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter criteria description"></textarea>
                        </div>

                        <!-- Internship Application ID Field -->
                        <div>
                            <label for="internshipApplicationId" class="block text-sm font-medium text-gray-700 mb-2">
                                Internship Application ID <span class="text-red-500">*</span>
                            </label>
                            <select id="internshipApplicationId" name="internshipApplicationId" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                ${applicationOptions}
                            </select>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-4">
                            <button type="button" id="resetBtn"
                                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
                                Reset
                            </button>
                            <button type="submit" id="submitBtn"
                                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
                                Create Criteria
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Table Section -->
                <div class="bg-white rounded-lg shadow-md">
                    <!-- Table Header -->
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">Internship Criteria List</h3>
                            <div class="flex items-center space-x-4">
                                <div class="text-sm text-gray-600">
                                    Showing ${this.getShowingText()} entries
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Table Content -->
                    <div class="overflow-x-auto">
                        <table class="table-blue">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="criteriaTableBody" class="bg-white divide-y divide-gray-200">
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="px-6 py-4 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-600">
                                Page ${this.currentPage} of ${this.getTotalPages()}
                            </div>
                            <div class="flex space-x-2">
                                <button id="prevBtn" ${this.currentPage === 1 ? 'disabled' : ''}
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-md ${this.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'} transition-colors duration-200">
                                    Previous
                                </button>
                                ${this.renderPaginationNumbers()}
                                <button id="nextBtn" ${this.currentPage === this.getTotalPages() ? 'disabled' : ''}
                                    class="px-3 py-1 text-sm border border-gray-300 rounded-md ${this.currentPage === this.getTotalPages() ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'} transition-colors duration-200">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    async fetchInternshipApplications() {
        try {
            const response = await fetch('/curriculum/InternshipApplication');
            const data = await response.json();
            if (data.isSuccess && Array.isArray(data.result)) {
                this.applications = data.result;
            } else {
                this.applications = [];
            }
        } catch (error) {
            console.error('Error fetching internship applications:', error);
        }
    }

    async fetchCriteria() {
        try {
            const response = await fetch('/curriculum/InternshipCriteria/getall');
            const data = await response.json();
            if (data.isSuccess && Array.isArray(data.result)) {
                this.criteria = data.result;
                this.totalItems = this.criteria.length;
            } else {
                this.criteria = [];
                this.totalItems = 0;
                this.showMessage('Failed to load criteria from server.', 'error');
            }
        } catch (error) {
            this.criteria = [];
            this.totalItems = 0;
            this.showMessage('Error loading criteria. Please try again.', 'error');
        }
    }

    renderTableRows() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentItems = this.criteria.slice(startIndex, endIndex);

        if (currentItems.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No criteria found
                    </td>
                </tr>
            `;
        }

        return currentItems.map(item => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.ID || item.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.title || item.Title || ''}</td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${item.description || item.Description || ''}">${item.description || item.Description || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getScoreColor(item.score || item.Score)}">
                        ${item.score || item.Score}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.internship_application_id || item.InternshipApplicationId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onclick="this.editCriteria(${item.ID || item.id})" class="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onclick="this.deleteCriteria(${item.ID || item.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderPaginationNumbers() {
        const totalPages = this.getTotalPages();
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let paginationHTML = '';
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="internshipCriteriaCreate.goToPage(${i})" 
                    class="px-3 py-1 text-sm border rounded-md transition-colors duration-200 ${i === this.currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }">
                    ${i}
                </button>
            `;
        }
        return paginationHTML;
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    getShowingText() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        return `${startIndex}-${endIndex} of ${this.totalItems}`;
    }

    getScoreColor(score) {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 80) return 'bg-yellow-100 text-yellow-800';
        if (score >= 70) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    }

    attachEventListeners() {
        // Form submission
        document.getElementById('criteriaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            document.getElementById('criteriaForm').reset();
        });

        // Pagination buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentPage < this.getTotalPages()) {
                this.goToPage(this.currentPage + 1);
            }
        });
    }

    async handleSubmit() {
        const formData = new FormData(document.getElementById('criteriaForm'));
        const internshipApplicationId = formData.get('internshipApplicationId');
        if (!internshipApplicationId) {
            this.showMessage('Please select an Internship Application.', 'error');
            return;
        }
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            score: parseInt(formData.get('score')),
            internship_application_id: parseInt(internshipApplicationId)
        };

        try {
            let url = '/curriculum/InternshipCriteria/create';
            let method = 'POST';
            // If editing, update instead of create
            if (this.editingId) {
                url = `/curriculum/InternshipCriteria/update/${this.editingId}`;
            }
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.isSuccess) {
                document.getElementById('criteriaForm').reset();
                this.editingId = null;
                await this.fetchCriteria();
                this.refreshTable();
                this.showMessage(this.editingId ? 'Criteria updated successfully!' : 'Criteria created successfully!', 'success');
            } else {
                this.showMessage(result.error || 'Failed to save criteria.', 'error');
            }
        } catch (error) {
            console.error('Error saving criteria:', error);
            this.showMessage('Error saving criteria. Please try again.', 'error');
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.refreshTable();
    }

    refreshTable() {
        document.getElementById('criteriaTableBody').innerHTML = this.renderTableRows();
        this.render();
    }

    async editCriteria(id) {
        const criteria = this.criteria.find(c => c.ID === id || c.id === id);
        if (criteria) {
            document.getElementById('title').value = criteria.title || criteria.Title || '';
            document.getElementById('description').value = criteria.description || criteria.Description || '';
            document.getElementById('score').value = criteria.score || criteria.Score || '';
            document.getElementById('internshipApplicationId').value = criteria.internship_application_id || criteria.InternshipApplicationId || criteria.internshipApplicationId || '';
            this.editingId = criteria.ID || criteria.id;
            document.getElementById('criteriaForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    async deleteCriteria(id) {
        if (!confirm('Are you sure you want to delete this criteria?')) return;
        try {
            const response = await fetch(`/curriculum/InternshipCriteria/delete/${id}`, {
                method: 'GET',
            });
            const result = await response.json();
            if (result.isSuccess) {
                await this.fetchCriteria();
                this.refreshTable();
                this.showMessage('Criteria deleted successfully!', 'success');
            } else {
                this.showMessage(result.error || 'Failed to delete criteria.', 'error');
            }
        } catch (error) {
            this.showMessage('Error deleting criteria. Please try again.', 'error');
        }
    }

    showMessage(message, type) {
        // Create and show a toast message
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}