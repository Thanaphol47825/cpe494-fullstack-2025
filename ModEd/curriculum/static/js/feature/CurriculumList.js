if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
            this.rawCurriculums = []; // Store raw data for edit modal
            window._deleteCurriculum = this.handleDelete.bind(this);
            window._editCurriculum = this.handleEdit.bind(this);
        }

        async getActionTemplate() {
            if (!CurriculumList.actionTemplateHtml) {
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumActionButtons.tpl`);
                CurriculumList.actionTemplateHtml = (await response.text()).trim();
            }
            return CurriculumList.actionTemplateHtml;
        }

        async getAllCurriculums() {
            const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let curriculums = []
            this.departments = [];
            this.programTypes = [];
            data.result.forEach(item => {
                curriculums.push({ ID: item.ID, Name: item.Name, StartYear: item.StartYear, EndYear: item.EndYear, DepartmentId: item.Department.ID, Department: item.Department.name, ProgramType: item.ProgramType === 0 ? 'Regular' : (item.ProgramType === 1 ? 'International' : 'N/A') });

                const depart = {
                    value: item.Department.ID,
                    label: item.Department.name,
                }
                const hasDept = this.departments.some(
                    d => d.value === depart.value   // or d.label === depart.label
                );
                if (!hasDept) {
                    this.departments.push(depart);
                }

                // ---- Program types (unique by value) ----
                const programT = {
                    value: item.ProgramType,
                    label: item.ProgramType === 0
                        ? "Regular"
                        : (item.ProgramType === 1 ? "International" : "N/A"),
                };

                const hasProgramType = this.programTypes.some(
                    p => p.value === programT.value
                );
                if (!hasProgramType) {
                    this.programTypes.push(programT);
                }
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
            this.table.render();
        }

        async render() {
            const [curriculums, actionTemplate] = await Promise.all([
                this.getAllCurriculums(),
                this.getActionTemplate(),
            ]);

            // Check current user role
            const currentRole = localStorage.getItem('userRole');
            const isAdmin = currentRole === 'Admin';
            const customColumns = [];
            if (isAdmin) {
                customColumns.push({
                    name: "actions",
                    label: "Actions",
                    template: actionTemplate
                });
            }

            this.application.templateEngine.mainContainer.innerHTML = ""
            this.setupTable(customColumns, curriculums);
            const listWrapper = await ListTemplate.getList('CurriculumList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);
            this.table.setData(curriculums);
            await this.table.render();
        }

        setupTable(customColumns) {
            this.tableSchema = [
                { name: "ID", label: "No.", type: "number", },
                { name: "Name", label: "Name", type: "text", },
                { name: "StartYear", label: "Start Year", type: "text", },
                { name: "EndYear", label: "End Year", type: "text", },
                { name: "Department", label: "Department", type: "text", },
                { name: "ProgramType", label: "Program Type", type: "text", },
            ]
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/curriculum",
                data: [],
                targetSelector: "#curriculum-table",
                schema: this.tableSchema,
                customColumns: customColumns,
                enableSearch: true,
                searchConfig: {
                    placeholder: "Search Curriculum...",
                    fields: [
                        { value: "all", label: "All" },
                        { value: "Name", label: "Name" },
                        { value: "StartYear", label: "Start Year" },
                        { value: "EndYear", label: "End Year" },
                        { value: "Department", label: "Department" },
                        { value: "ProgramType", label: "Program Type" },
                    ]
                },
                enableSorting: true,
                sortConfig: {
                    defaultField: "ID",
                    defaultDirection: "asc"
                },
                enablePagination: true,
                pageSize: 10
            });
        }


    }

    if (typeof window !== 'undefined') {
        window.CurriculumList = CurriculumList;
    }
}
