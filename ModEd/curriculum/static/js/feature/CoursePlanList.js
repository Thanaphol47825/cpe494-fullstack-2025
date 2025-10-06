if (typeof window !== 'undefined' && !window.CoursePlanList) {
    class CoursePlanList {
        constructor(application) {
            this.application = application;
        }

        getCoursePlans = async () => {
            try {
                const res = await fetch(`${RootURL}/curriculum/CoursePlan/getCoursePlans`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                return data.result || [];
            } catch (err) {
                console.error("Failed to fetch course plans:", err);
                return [];
            }
        }

        render = async () => {
            window.currentCoursePlanList = this;
            this.application.templateEngine.mainContainer.innerHTML = "";

            const ListWrapper = this.application.templateEngine.create(`
                <div class="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                  <div class="absolute inset-0 overflow-hidden pointer-events-none">
                    <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
                    <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                  </div>

                  <div class="relative z-10 container mx-auto px-4 py-12">
                    <div class="text-center mb-12">
                      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl shadow-lg mb-6">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent mb-4">Course Plan List</h1>
                      <div class="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-4 rounded-full"></div>
                      <p class="text-lg text-gray-600 max-w-2xl mx-auto">Manage and review course plans (date, week, topic and description)</p>
                    </div>

                    <div class="max-w-6xl mx-auto mb-8">
                      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                          <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span class="text-gray-700 font-medium">Course Plan Management</span>
                          </div>
                          <a routerLink="curriculum/courseplan/create" class="bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add New Course Plan
                          </a>
                        </div>
                      </div>
                    </div>

                    <div class="max-w-6xl mx-auto">
                      <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        <div id="table-container" class="p-6"></div>
                      </div>
                    </div>

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

            const plans = await this.getCoursePlans();
            this.plans = plans;
            this.renderSimpleTable(plans, ListWrapper.querySelector('#table-container'));
        }

        renderSimpleTable = (data, container) => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                  <div class="text-center py-12">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Course Plans Found</h3>
                    <p class="text-gray-500 mb-6">There are no course plans to display right now.</p>
                    <a routerLink="curriculum/courseplan/create" class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create Course Plan
                    </a>
                  </div>
                `;
                return;
            }

            let tableHTML = `
              <div class="overflow-x-auto">
                <table class="w-full table-auto">
                  <thead>
                    <tr class="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Week</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Topic</th>
                      <th class="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
            `;

            data.forEach((item, index) => {
                let formattedDate = 'N/A';
                const rawDate = item.Date || item.date;
                if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleString();
                    }
                }

                const courseName = item.Course ? item.Course.Name : (item.CourseName || 'N/A');

                tableHTML += `
                  <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-slate-50 transition-all duration-200">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
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
                      <div class="text-sm text-gray-900">${formattedDate}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">Week ${item.Week || item.week || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">${item.Topic || item.topic || '-'}</div>
                    </td>
                    <td class="px-6 py-4 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="editCoursePlan(${item.ID})" class="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="deleteCoursePlan(${item.ID})" class="inline-flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm">
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

            // render table and attach event listeners (avoid inline onclick to prevent scope issues)
            container.innerHTML = tableHTML;

            // attach handlers using event listeners (safer than inline onclick)
            container.querySelectorAll('.js-edit-courseplan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id, 10);
                    if (!isNaN(id)) this.editCoursePlan(id);
                });
            });
            container.querySelectorAll('.js-delete-courseplan').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id, 10);
                    if (!isNaN(id)) this.deleteCoursePlan(id);
                });
            });
        }

        // Get courses option for select dropdown (used in edit modal)
        getCoursesOption = async () => {
            try {
                const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                if (!res.ok) throw new Error('Failed to fetch courses');

                const select = [];
                (data.result || []).forEach(item => {
                    select.push({ value: item.ID, label: item.Name || item.name || item.Title || item.title || String(item.ID) });
                });
                return select;
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                return [];
            }
        }

        // Edit CoursePlan - inline modal
        editCoursePlan = async (id) => {
            const plan = this.plans.find(p => p.ID === id);
            if (!plan) {
                alert('Course Plan not found');
                return;
            }

            const coursesOption = await this.getCoursesOption();

            // format date for datetime-local if available
            let dateValue = '';
            const raw = plan.Date || plan.date;
            if (raw) {
                const dt = new Date(raw);
                if (!isNaN(dt.getTime())) {
                    const year = dt.getFullYear();
                    const month = String(dt.getMonth() + 1).padStart(2, '0');
                    const day = String(dt.getDate()).padStart(2, '0');
                    const hours = String(dt.getHours()).padStart(2, '0');
                    const minutes = String(dt.getMinutes()).padStart(2, '0');
                    dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
                }
            }

            const fields = [
                { Id: "CourseId", Label: "Course", Type: "select", Name: "CourseId", required: true, options: coursesOption, Value: plan.CourseId },
                { Id: "date", Label: "Date", Type: "datetime-local", Name: "date", Required: true, Value: dateValue },
                { Id: "week", Label: "Week", Type: "number", Name: "week", Required: true, Value: plan.Week || plan.week },
                { Id: "topic", Label: "Topic", Type: "text", Name: "topic", Required: true, Value: plan.Topic || plan.topic },
                { Id: "description", Label: "Description", Type: "textarea", Name: "description", Required: false, Value: plan.Description || plan.description }
            ];

            let editFormHTML = `
              <div id="edit-modal-${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <h3 class="text-xl font-semibold text-gray-900">Edit Course Plan #${id}</h3>
                      <button onclick="closeEditCoursePlan(${id})" class="text-gray-400 hover:text-gray-600 transition-colors">
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
                if (field.Type === "select") {
                    editFormHTML += `
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">${field.Label} ${field.required ? '<span class="text-red-500">*</span>' : ''}</label>
                        <select name="${field.Name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg" ${field.required ? 'required' : ''}>
                          <option value="">-- Select ${field.Label} --</option>
                    `;
                    (field.options || []).forEach(opt => {
                        const selected = opt.value == field.Value ? 'selected' : '';
                        editFormHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                    });
                    editFormHTML += `</select></div>`;
                } else if (field.Type === "textarea") {
                    editFormHTML += `
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">${field.Label}</label>
                        <textarea name="${field.Name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${field.Value || ''}</textarea>
                      </div>
                    `;
                } else {
                    editFormHTML += `
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">${field.Label} ${field.Required ? '<span class="text-red-500">*</span>' : ''}</label>
                        <input type="${field.Type}" name="${field.Name}" value="${field.Value || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg" ${field.Required ? 'required' : ''}>
                      </div>
                    `;
                }
            });

            editFormHTML += `
                    <div class="flex gap-3 pt-4">
                      <button type="submit" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold py-2 px-4 rounded-lg">Update</button>
                      <button type="button" onclick="closeEditCoursePlan(${id})" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            `;

            document.body.insertAdjacentHTML('beforeend', editFormHTML);

            const form = document.getElementById(`edit-form-${id}`);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const rawDate = formData.get('date');
                const dateISO = rawDate ? new Date(rawDate).toISOString() : null;

                const payload = {
                    ID: parseInt(formData.get('ID')),
                    CourseId: parseInt(formData.get('CourseId')),
                    date: dateISO,
                    week: formData.get('week') ? parseInt(formData.get('week')) : null,
                    topic: formData.get('topic'),
                    description: formData.get('description')
                };

                try {
                    const response = await fetch(`${RootURL}/curriculum/CoursePlan/updateCoursePlan`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    if (result.isSuccess) {
                        alert('Course Plan updated successfully!');
                        this.closeEditCoursePlan(id);
                        this.render();
                    } else {
                        alert('Error: ' + (result.result || 'Failed to update'));
                    }
                } catch (err) {
                    alert('Network error: ' + err.message);
                }
            });
        }

        closeEditCoursePlan = (id) => {
            const modal = document.getElementById(`edit-modal-${id}`);
            if (modal) modal.remove();
        }

        deleteCoursePlan = async (id) => {
            // if (!confirm('Are you sure you want to delete this course plan?')) return;
            try {
                const response = await fetch(`${RootURL}/curriculum/CoursePlan/deleteCoursePlan/${id}`, { method: 'GET' });
                const result = await response.json();
                if (result.isSuccess) {
                    alert('Course Plan deleted successfully!');
                    this.render();
                } else {
                    alert('Error: ' + (result.result || 'Failed to delete'));
                }
            } catch (err) {
                alert('Network error: ' + err.message);
            }
        }
    }

    window.editCoursePlan = (id) => {
        if (window.currentCoursePlanList) window.currentCoursePlanList.editCoursePlan(id);
    };
    window.deleteCoursePlan = (id) => {
        if (window.currentCoursePlanList) window.currentCoursePlanList.deleteCoursePlan(id);
    };
    window.closeEditCoursePlan = (id) => {
        if (window.currentCoursePlanList) window.currentCoursePlanList.closeEditCoursePlan(id);
    };

    window.CoursePlanList = CoursePlanList;
}