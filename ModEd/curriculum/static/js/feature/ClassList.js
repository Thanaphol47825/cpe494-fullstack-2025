if (typeof window !== 'undefined' && !window.ClassList) {
    class ClassList {
        constructor(application) {
            this.application = application;
            window._deleteClass = this.handleDelete.bind(this);
        }

        async getAllClasses() {
            const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let classes = []
            data.result.forEach(item => {
                classes.push({ ID: item.ID, CourseId: item.CourseId, CourseName: item.Course ? item.Course.Name : 'N/A', Section: item.Section, Schedule: item.Schedule });
            });

            return classes;
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
            const tableWrapper = this.application.templateEngine.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                        Class
                    </h1>
                    <div id="class-table"></div>
                    <div style="margin-top: 20px;">
                        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.templateEngine.mainContainer.appendChild(tableWrapper);


            const classes = await this.getAllClasses();
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/Class",
                data: classes,
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
                                <a routerLink="curriculum/class/{ID}" class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">Edit</a>
                                <button id="class-del-btn" onclick="_deleteClass({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
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
