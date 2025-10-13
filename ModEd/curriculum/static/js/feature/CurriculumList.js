if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
            window._deleteCurriculum = this.handleDelete.bind(this);
            window._editCurriculum = this.handleEdit.bind(this);
        }

        async getCurriculumById(id) {
            const res = await fetch(
                `${RootURL}/curriculum/Curriculum/getCurriculum/${id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = await res.json().catch(() => []);

            return data.result || {};
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

        async handleSubmit(formData) {
            try {
                formData.ID = parseInt(this.curriculumData.ID);
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

                const data = await resp.json();
                if (data.isSuccess) {
                    alert("Curriculum saved!");
                } else {
                    alert("Error: " + (data.result || "Failed to save"));
                }
            } catch (error) {
                alert("Error: " + (error || "Failed to save"));
            }

            return false;
        }

        async handleEdit(curriculumId) {
            if (!curriculumId) return;

            try {
                this.curriculumData = await this.getCurriculumById(curriculumId);
            } catch (err) {
                alert(`Delete failed: ${err?.message || err}`);
            }

            await this.renderFormEdit();
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

            this.setupForm();
        }

        async renderFormEdit() {
            this.application.templateEngine.mainContainer.innerHTML = ""
            const formElement = await FormTemplate.getForm('CurriculumForm', 'create');
            this.application.templateEngine.mainContainer.appendChild(formElement);

            await this.form.render();

            this.curriculumData.ProgramType = this.curriculumData.ProgramType.toString();
            await this.form.setData(this.curriculumData);
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
                                <button id="curriculum-del-btn" onclick="_editCurriculum({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                    Edit
                                </button>
                                <button id="curriculum-del-btn" onclick="_deleteCurriculum({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
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
