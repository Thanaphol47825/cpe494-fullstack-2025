if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
            this.rawCurriculums = []; // Store raw data for edit modal
            window._deleteCurriculum = this.handleDelete.bind(this);
            window._editCurriculum = this.handleEdit.bind(this);
        }

        async getAllCurriculums() {
            const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let curriculums = []
            data.result.forEach(item => {
                curriculums.push({ ID: item.ID, Name: item.Name, StartYear: item.StartYear, EndYear: item.EndYear, DepartmentId: item.Department.ID, Department: item.Department.name, ProgramType: item.ProgramType, ProgramTypeName: item.ProgramType === 0 ? 'Regular' : (item.ProgramType === 1 ? 'International' : 'N/A') });
            });

            this.rawCurriculums = data.result.map(item => {
                item.ProgramType = item.ProgramType.toString();
                return item;
            });
            return curriculums;
        }

        async handleDelete(curriculumId) {
            if (!curriculumId) return;
            if (!confirm('Delete Curriculum?')) return;

            try {
                const resp = await fetch(`${RootURL}/curriculum/Curriculum/deleteCurriculum/${curriculumId}`, {
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

        async updateCurriculum(curriculumId, formData) {
            try {
                formData.ID = curriculumId;
                console.log("Submitting form data:", formData);
                if (!formData.DepartmentId) {
                    alert("Please select a department.");
                    return;
                }
                formData.DepartmentId = parseInt(formData.DepartmentId);

                if (formData.ProgramType != 0 && formData.ProgramType != 1) {
                    alert("Please select a program type.");
                    return;
                }
                formData.ProgramType = parseInt(formData.ProgramType);

                const resp = await fetch(
                    RootURL + "/curriculum/Curriculum/updateCurriculum",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    }
                );

                const result = await resp.json();

                if (result.isSuccess) {
                    await this.refreshTable();
                    return { success: true, message: 'Curriculum updated successfully!' };
                } else {
                    return { success: false, message: result.result || 'Failed to update Curriculum' };
                }
            } catch (error) {
                return { success: false, message: 'Network error: ' + error.message };
            }

            return false;
        }


        async handleEdit(curriculumId) {
            if (!curriculumId) return;

            try {
                if (!window.EditModalTemplate) {
                    await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
                }

                const curriculumData = this.rawCurriculums.find(item => item.ID === curriculumId);
                if (!curriculumData) {
                    alert('Curriculum not found');
                    return;
                }

                const modalId = `curriculum-${curriculumId}`;

                const { modal, form } = await EditModalTemplate.createModalWithForm({
                    modalType: 'Curriculum',
                    modalId: modalId,
                    application: this.application,
                    modelPath: 'curriculum/curriculum',
                    data: curriculumData,
                    submitHandler: async (formData) => {
                        return await this.updateCurriculum(curriculumId, formData);
                    }
                });

            } catch (error) {
                console.error('Error opening edit modal:', error);
                alert('Error opening edit modal: ' + error.message);
            }
        }

        async refreshTable() {
            const curriculums = await this.getAllCurriculums();
            this.table.setData(curriculums);
            this.render();
        }

        async render() {
            this.application.templateEngine.mainContainer.innerHTML = ""
            const listWrapper = await ListTemplate.getList('CurriculumList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            const curriculums = await this.getAllCurriculums();
            this.setupTable();
            this.table.setData(curriculums);
            await this.table.render();
        }

        setupTable() {
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/curriculum",
                data: [],
                targetSelector: "#curriculum-table",
                schema: [
                    {
                        name: "ID",
                        label: "No.",
                        type: "number",
                    },
                    {
                        name: "Name",
                        label: "Name",
                        type: "text",
                    },
                    {
                        name: "StartYear",
                        label: "Start Year",
                        type: "text",
                    },
                    {
                        name: "EndYear",
                        label: "End Year",
                        type: "text",
                    },
                    {
                        name: "Department",
                        label: "Department",
                        type: "text",
                    },
                    {
                        name: "ProgramTypeName",
                        label: "Program Type",
                        type: "text",
                    },
                ],
                // Add custom columns (actions, computed fields, etc.)
                customColumns: [
                    {
                        name: "actions",
                        label: "Actions",
                        template: `
                            <div class="flex space-x-2">
                                <button onclick="_editCurriculum({ID})" 
                                        class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="_deleteCurriculum({ID})" 
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
        }

        setupForm() {
            this.form = new AdvanceFormRender(this.application.templateEngine, {
                modelPath: "curriculum/curriculum",
                targetSelector: "#curriculum-form",
                submitHandler: this.handleSubmit.bind(this),

            });
        }


    }

    if (typeof window !== 'undefined') {
        window.CurriculumList = CurriculumList;
    }
}
