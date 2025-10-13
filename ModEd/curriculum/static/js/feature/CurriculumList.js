if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
            window._deleteCurriculum = this.handleDelete.bind(this);
        }

        async getAllCurriculums() {
            const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let curriculums = []
            data.result.forEach(item => {
                curriculums.push({ ID: item.ID, Name: item.Name, StartYear: item.StartYear, EndYear: item.EndYear, DepartmentId: item.Department.name, ProgramType: item.ProgramType });
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

        async refreshTable() {
            const curriculums = await this.getAllCurriculums();
            this.table.setData(curriculums);
            this.render();
        }

        async render() {
            this.application.mainContainer.innerHTML = ""
            const tableWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                        Curriculum
                    </h1>
                    <div id="curriculum-table"></div>
                    <div style="margin-top: 20px;">
                        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(tableWrapper);


            const curriculums = await this.getAllCurriculums();
            this.table = new AdvanceTableRender(this.application, {
                modelPath: "curriculum/curriculum",
                data: curriculums,
                targetSelector: "#curriculum-table",

                // Add custom columns (actions, computed fields, etc.)
                customColumns: [
                    // {
                    //     name: "Department",
                    //     label: "Department",
                    // },
                    {
                        name: "actions",
                        label: "Actions",
                        template: `
                            <div class="flex space-x-2">
                                <a routerLink="curriculum/curriculum/{ID}" class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">Edit</a>
                                <button id="curriculum-del-btn" onclick="_deleteCurriculum({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                    Delete
                                </button>
                            </div>
                        `
                    },

                ]
            });

            await this.table.render();

            // let formHandler = document.getElementById("curriculum-del-btn");
            // formHandler.addEventListener('click', this.handleDelete.bind(this));
        }


    }

    if (typeof window !== 'undefined') {
        window.CurriculumList = CurriculumList;
    }
}
