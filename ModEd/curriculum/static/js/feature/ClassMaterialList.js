if (typeof window !== 'undefined' && !window.ClassMaterialList) {
    class ClassMaterialList {
        constructor(application) {
            this.application = application;
        }

        getClassMaterials = async () => {
            const res = await fetch(`${RootURL}/curriculum/ClassMaterial/getClassMaterials`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            return data.result || [];
        }

        render = async () => {
            // Load submodules before rendering
            // if(await this.application.loadSubModule('')) {
            //     console.log('Loaded');
            // }

            this.application.templateEngine.mainContainer.innerHTML = "";

            const ListWrapper = this.application.templateEngine.create(`
                <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                    <!-- Background Decorative Elements -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
                    </div>

                    <!-- Main Content -->
                    <div class="relative z-10 container mx-auto px-4 py-12">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl shadow-lg mb-6">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-800 to-pink-900 bg-clip-text text-transparent mb-4">
                                Class Material List
                            </h1>
                            <div class="w-24 h-1 bg-gradient-to-r from-rose-500 to-pink-600 mx-auto mb-4 rounded-full"></div>
                            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                Manage and organize your class materials and learning resources
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="max-w-6xl mx-auto mb-8">
                            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                                <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                        <span class="text-gray-700 font-medium">Class Materials Management</span>
                                    </div>
                                    <a routerLink="curriculum/classmaterial/create" class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Add New Material
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

            const classMaterials = await this.getClassMaterials();

            this.renderSimpleTable(classMaterials, ListWrapper.querySelector('#table-container'));
        }

        renderSimpleTable = (data, container) => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Class Materials Found</h3>
                        <p class="text-gray-500 mb-6">Get started by creating your first class material.</p>
                        <a routerLink="curriculum/classmaterial/create" class="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Create Material
                        </a>
                    </div>
                `;
                return;
            }

            const rows = data.map((item, index) => `
                <tr class="hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-200 group">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center text-rose-600 font-semibold text-sm">
                                ${item.ID || index + 1}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900">${item.FileName || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-600 max-w-xs truncate" title="${item.FilePath || 'N/A'}">
                            ${item.FilePath || 'N/A'}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Section ${item.Class && item.Class.Section ? item.Class.Section : 'N/A'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">
                            ${item.Class && item.Class.Course && item.Class.Course.Name ? item.Class.Course.Name : 'N/A'}
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-600">
                            ${item.Class && item.Class.Schedule ? (() => {
                                const date = new Date(item.Class.Schedule);
                                const dateStr = date.toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                });
                                const timeStr = date.toLocaleTimeString('en-GB', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: false 
                                });
                                return `${dateStr}<br><span class="text-xs text-gray-500">${timeStr}</span>`;
                            })() : 'N/A'}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onclick="editClassMaterial(${item.ID})" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105" title="Edit Material">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteClassMaterial(${item.ID})" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105" title="Delete Material">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            const tableHTML = `
                <div class="overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        File Name
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        File Path
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Class Section
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Course Name
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Schedule
                                    </th>
                                    <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            container.innerHTML = tableHTML;
        }

        // Placeholder functions for edit and delete (will be implemented later)
        editClassMaterial = (id) => {
            alert(`Edit class material with ID: ${id} - Function not implemented yet`);
        }

        deleteClassMaterial = (id) => {
            if (confirm(`Are you sure you want to delete class material with ID: ${id}?`)) {
                alert(`Delete class material with ID: ${id} - Function not implemented yet`);
            }
        }
    }

    // Make functions globally available for onclick handlers
    window.editClassMaterial = (id) => {
        alert(`Edit class material with ID: ${id} - Function not implemented yet`);
    }

    window.deleteClassMaterial = (id) => {
        if (confirm(`Are you sure you want to delete class material with ID: ${id}?`)) {
            alert(`Delete class material with ID: ${id} - Function not implemented yet`);
        }
    }

    window.ClassMaterialList = ClassMaterialList;
}
