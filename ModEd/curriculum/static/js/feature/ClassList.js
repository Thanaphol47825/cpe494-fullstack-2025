if (typeof window !== 'undefined' && !window.ClassList) {
    class ClassList {
        constructor(application) {
            this.application = application;
        }

        getClasses = async () => {
            const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            return data.result || [];
        }

        render = async () => {
            // Set current instance for global access
            window.currentClassList = this;

            this.application.templateEngine.mainContainer.innerHTML = "";

            const ListWrapper = this.application.templateEngine.create(`
                <div class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
                    <!-- Background Decorative Elements -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
                    </div>

                    <!-- Main Content -->
                    <div class="relative z-10 container mx-auto px-4 py-12">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-lg mb-6">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-4">
                                Class List
                            </h1>
                            <div class="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 mx-auto mb-4 rounded-full"></div>
                            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                Manage and organize your class schedules and sections
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="max-w-6xl mx-auto mb-8">
                            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                                <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        <span class="text-gray-700 font-medium">Class Management</span>
                                    </div>
                                    <a routerLink="curriculum/class/create" class="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Add New Class
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Table Container -->
                        <div class="max-w-6xl mx-auto">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                                <div id="table-container" class="p-6">
                                    <!-- Table will be rendered here -->
                                </div>
                            </div>
                        </div>

                        <!-- Back Button -->
                        <div class="text-center mt-12">
                            <a routerLink="curriculum" class="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90 border border-gray-200/50 font-medium">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                Back to Curriculum Menu
                            </a>
                        </div>
                    </div>
                </div>
            `);

            this.application.templateEngine.mainContainer.appendChild(ListWrapper);

            const classes = await this.getClasses();
            this.classes = classes; // Store for later use

            this.renderSimpleTable(classes, ListWrapper.querySelector('#table-container'));
        }

        renderSimpleTable = (data, container) => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                        <p class="text-gray-500 mb-6">There are no classes to display at the moment.</p>
                        <a routerLink="curriculum/class/create" class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Create First Class
                        </a>
                    </div>
                `;
                return;
            }

            // Create table HTML
            let tableHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full table-auto">
                        <thead>
                            <tr class="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class ID</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course Name</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Section</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Schedule</th>
                                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
            `;

            data.forEach((item, index) => {
                // Format date
                let formattedSchedule = 'N/A';
                if (item.Schedule) {
                    const date = new Date(item.Schedule);
                    if (!isNaN(date.getTime())) {
                        formattedSchedule = date.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }

                const courseName = item.Course ? item.Course.Name : 'N/A';

                tableHTML += `
                    <tr class="hover:bg-gradient-to-r hover:from-purple-25 hover:to-indigo-25 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
                        <td class="px-6 py-4">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-white text-xs font-bold">${item.ID}</span>
                                </div>
                                <span class="text-sm font-medium text-gray-900">#${item.ID}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-gray-900">${courseName}</div>
                            <div class="text-sm text-gray-500">Course ID: ${item.CourseId || 'N/A'}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                Section ${item.Section || 'N/A'}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-900">${formattedSchedule}</div>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="editClass(${item.ID})" class="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="deleteClass(${item.ID})" class="inline-flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            container.innerHTML = tableHTML;
        }

        // Get courses option for select dropdown
        getCoursesOption = async () => {
            try {
                const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                if (!res.ok) {
                    throw new Error('Failed to fetch courses');
                }

                let select = [];
                data.result.forEach(item => {
                    select.push({ value: item.ID, label: item.Name });
                });
                return select;
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                return [];
            }
        }

        // Edit Class - Show inline edit form using FormRender
        editClass = async (id) => {
            const classItem = this.classes.find(item => item.ID === id);
            if (!classItem) {
                alert('Class not found');
                return;
            }

            const coursesOption = await this.getCoursesOption();

            // Format schedule for datetime-local input
            let scheduleValue = '';
            if (classItem.Schedule) {
                const date = new Date(classItem.Schedule);
                if (!isNaN(date.getTime())) {
                    // Convert to local datetime string format for input
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    scheduleValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }

            // Create edit form fields
            const fields = [
                {
                    Id: "CourseId", Label: "Course", Type: "select", Name: "CourseId", required: true,
                    options: coursesOption, Value: classItem.CourseId
                },
                { Id: "section", Label: "Section", Type: "number", Name: "Section", Required: true, Value: classItem.Section },
                { Id: "schedule", Label: "Schedule", Type: "datetime-local", Name: "Schedule", Required: true, Value: scheduleValue },
            ];

            let editFormHTML = `
                <div id="edit-modal-${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-xl font-semibold text-gray-900">Edit Class #${id}</h3>
                                <button onclick="closeEditModal(${id})" class="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form id="edit-form-${id}" class="p-6 space-y-4">
                            <input type="hidden" name="ID" value="${id}">
            `;

            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select") {
                    inputHTML = `
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">${field.Label} ${field.required ? '<span class="text-red-500">*</span>' : ''}</label>
                            <select name="${field.Name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" ${field.required ? 'required' : ''}>
                                <option value="">-- Select ${field.Label} --</option>
                    `;
                    field.options.forEach(option => {
                        const selected = option.value == field.Value ? 'selected' : '';
                        inputHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                    });
                    inputHTML += `
                            </select>
                        </div>
                    `;
                } else {
                    inputHTML = `
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">${field.Label} ${field.Required ? '<span class="text-red-500">*</span>' : ''}</label>
                            <input type="${field.Type}" name="${field.Name}" value="${field.Value || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                   ${field.Required ? 'required' : ''}>
                        </div>
                    `;
                }

                editFormHTML += inputHTML;
            });

            editFormHTML += `
                            <div class="flex gap-3 pt-4">
                                <button type="submit" class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
                                    Update Class
                                </button>
                                <button type="button" onclick="closeEditModal(${id})" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', editFormHTML);

            // Add form submit handler
            const form = document.getElementById(`edit-form-${id}`);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const scheduleLocal = formData.get('Schedule');
                const scheduleISO = scheduleLocal ? new Date(scheduleLocal).toISOString() : null;

                const payload = {
                    ID: parseInt(formData.get('ID')),
                    CourseId: parseInt(formData.get('CourseId')),
                    Section: parseInt(formData.get('Section')),
                    Schedule: scheduleISO,
                };

                try {
                    const response = await fetch(`${RootURL}/curriculum/Class/updateClass`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();

                    if (result.isSuccess) {
                        alert('Class updated successfully!');
                        this.closeEditModal(id);
                        // Reload the page to show updated data
                        this.render();
                    } else {
                        alert('Error: ' + (result.result || 'Failed to update'));
                    }
                } catch (err) {
                    alert('Network error: ' + err.message);
                }
            });
        }

        // Close edit modal
        closeEditModal = (id) => {
            const modal = document.getElementById(`edit-modal-${id}`);
            if (modal) {
                modal.remove();
            }
        }

        // Delete Class
        deleteClass = async (id) => {
            if (!confirm('Are you sure you want to delete this class?')) {
                return;
            }

            try {
                const response = await fetch(`${RootURL}/curriculum/Class/deleteClass/${id}`, {
                    method: 'GET',
                });
                const result = await response.json();

                if (result.isSuccess) {
                    alert('Class deleted successfully!');
                    // Reload the page to show updated data
                    this.render();
                } else {
                    alert('Error: ' + (result.result || 'Failed to delete'));
                }
            } catch (err) {
                alert('Network error: ' + err.message);
            }
        }
    }

    // Make functions globally available for onclick handlers
    window.editClass = (id) => {
        if (window.currentClassList) {
            window.currentClassList.editClass(id);
        }
    }

    window.deleteClass = (id) => {
        if (window.currentClassList) {
            window.currentClassList.deleteClass(id);
        }
    }

    window.closeEditModal = (id) => {
        if (window.currentClassList) {
            window.currentClassList.closeEditModal(id);
        }
    }

    window.ClassList = ClassList;
}
