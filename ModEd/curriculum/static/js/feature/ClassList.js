if (typeof window !== 'undefined' && !window.ClassList) {
    class ClassList {
        constructor(application) {
            this.application = application;
            this.rawClasses = []; // Store raw data for edit modal
            window._deleteClass = this.handleDelete.bind(this);
            window._editClass = this.handleEdit.bind(this);
            window._viewDetailClass = this.handleViewDetail.bind(this);
        }

        async getAllClasses() {
            const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            this.rawClasses = data.result || []; // Store raw data for edit modal

            let classes = []
            data.result.forEach(item => {
                classes.push({ ID: item.ID, CourseId: item.CourseId, CourseName: item.Course ? item.Course.Name : 'N/A', Section: item.Section, Schedule: item.Schedule });
            });

            return classes;
        }

        async handleEdit(classId) {
            if (!classId) return;
            
            try {
                // โหลด CurriculumEditModalTemplate ถ้ายังไม่ได้โหลด
                if (!window.CurriculumEditModalTemplate) {
                    await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
                }

                // Find the class data
                const classData = this.rawClasses.find(item => item.ID === classId);
                if (!classData) {
                    alert('Class not found');
                    return;
                }

                const modalId = `class-${classId}`;
                
                // Create modal with AdvanceFormRender
                const { modal, form } = await EditModalTemplate.createModalWithForm({
                    modalType: 'Class',
                    modalId: modalId,
                    application: this.application,
                    modelPath: 'curriculum/class',
                    data: classData,
                    submitHandler: async (formData) => {
                        return await this.updateClass(classId, formData);
                    }
                });

                // Modal is already shown by createModalWithForm

            } catch (error) {
                console.error('Error opening edit modal:', error);
                alert('Error opening edit modal: ' + error.message);
            }
        }

        async handleViewDetail(classId) {
            if (!classId) return;
            
            try {
                // โหลด CurriculumViewDetailModalTemplate ถ้ายังไม่ได้โหลด
                if (!window.ViewDetailModalTemplate) {
                    await this.application.loadSubModule('template/CurriculumViewDetailModalTemplate.js');
                }

                // Find the class data with all nested objects
                const classData = this.rawClasses.find(item => item.ID === classId);
                if (!classData) {
                    alert('Class not found');
                    return;
                }

                const modalId = `class-view-${classId}`;
                
                // Create view detail modal
                await ViewDetailModalTemplate.createModal({
                    modalType: 'Class',
                    modalId: modalId,
                    data: classData
                });

            } catch (error) {
                console.error('Error opening view detail modal:', error);
                alert('Error opening view detail modal: ' + error.message);
            }
        }

        async updateClass(classId, formData) {
            try {
                const payload = {
                    ID: classId,
                    CourseId: parseInt(formData.CourseId),
                    Section: formData.Section,
                    Schedule: formData.Schedule + ':00Z'
                };

                console.log("Updating class with data:", payload);

                const res = await fetch(`${RootURL}/curriculum/Class/updateClass`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await res.json();
                
                if (result.isSuccess) {
                    // Refresh table after successful update
                    await this.refreshTable();
                    return { success: true, message: 'Class updated successfully!' };
                } else {
                    return { success: false, message: result.result || 'Failed to update Class' };
                }
            } catch (err) {
                return { success: false, message: 'Network error: ' + err.message };
            }
        }

        async handleDelete(classId) {
            if (!classId) return;
            if (!confirm('Delete Class?')) return;

            try {
                const resp = await fetch(`${RootURL}/curriculum/Class/deleteClass/${classId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const resJson = await resp.json().catch(() => ({}));
                if (!resp.ok || resJson.isSuccess === false) {
                    throw new Error(resJson.result || `HTTP ${resp.status}`);
                }

                await this.refreshTable();
            } catch (err) {
                alert(`Delete failed: ${err?.message || err}`);
            }
        }

        async refreshTable() {
            const classes = await this.getAllClasses();
            this.table.setData(classes);
            this.render();
        }

        async render() {
            this.application.templateEngine.mainContainer.innerHTML = ""
            
            // Use ListTemplate to generate the wrapper
            const listWrapper = await ListTemplate.getList('ClassList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            const classes = await this.getAllClasses();
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                data: classes,
                modelPath: "curriculum/Class",
                targetSelector: "#class-table",

                // Add custom columns (actions, computed fields, etc.)
                customColumns: [
                    // {
                    //     name: "Course",
                    //     label: "Course",
                    // },
                    {
                        name: "actions",
                        label: "Actions",
                        template: `
                            <div class="flex space-x-2">
                                <button onclick="_viewDetailClass({ID})" 
                                        class="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    View
                                </button>
                                <button onclick="_editClass({ID})" 
                                        class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="_deleteClass({ID})" 
                                        class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        `
                    },

                ]
            });

            await this.table.render();

            // let formHandler = document.getElementById("class-del-btn");
            // formHandler.addEventListener('click', this.handleDelete.bind(this));
        }


    }

    if (typeof window !== 'undefined') {
        window.ClassList = ClassList;
    }
}
