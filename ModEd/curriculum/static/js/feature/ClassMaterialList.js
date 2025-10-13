if (typeof window !== 'undefined' && !window.ClassMaterialList) {
    class ClassMaterialList {
        constructor(application) {
            this.application = application;
            window._deleteClassMaterial = this.handleDelete.bind(this);
        }

        getClassMaterials = async () => {
            const res = await fetch(`${RootURL}/curriculum/ClassMaterial/getClassMaterials`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            return data.result || [];
        }

        async getAllClassMaterials() {
            const rawData = await this.getClassMaterials();
            
            let classMaterials = []
            rawData.forEach(item => {
                let formattedSchedule = "";
                if (item.Class && item.Class.Schedule) {
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
                    formattedSchedule = `${dateStr} ${timeStr}`;
                }

                classMaterials.push({ 
                    ID: item.ID, 
                    FileName: item.FileName, 
                    FilePath: item.FilePath,
                    Section: item.Class && item.Class.Section ? `Sec ${item.Class.Section}` : 'N/A',
                    CourseName: item.Class && item.Class.Course && item.Class.Course.Name ? item.Class.Course.Name : 'N/A',
                    Schedule: formattedSchedule || 'N/A'
                });
            });

            return classMaterials;
        }

        async handleDelete(classMaterialId) {
            if (!classMaterialId) return;
            if (!confirm('Delete Class Material?')) return;

            try {
                const resp = await fetch(`${RootURL}/curriculum/ClassMaterial/deleteClassMaterial/${classMaterialId}`, {
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
            const classMaterials = await this.getAllClassMaterials();
            this.table.setData(classMaterials);
            this.render();
        }

        async render() {
            this.application.templateEngine.mainContainer.innerHTML = ""
            
            // Use ListTemplate to generate the wrapper
            const listWrapper = await ListTemplate.getList('ClassMaterialList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            const classMaterials = await this.getAllClassMaterials();
            console.log(classMaterials);
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                data: classMaterials,
                targetSelector: "#classmaterial-table",
                schema: [
                    {
                        name: "ID",
                        label: "No.",
                        type: "number",
                    },
                    {
                        name: "Section",
                        label: "Section",
                        type: "text",
                    },
                    {
                        name: "CourseName",
                        label: "Course Name",
                        type: "text",
                    },
                    {
                        name: "Schedule",
                        label: "Schedule",
                        type: "text",
                    },
                    {
                        name: "FileName",
                        label: "File Name",
                        type: "text",
                    },
                    {
                        name: "FilePath",
                        label: "File Path",
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
                                <a routerLink="curriculum/classmaterial/{ID}" class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">Edit</a>
                                <button id="classmaterial-del-btn" onclick="_deleteClassMaterial({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                    Delete
                                </button>
                            </div>
                        `
                    },
                ]
            });

            await this.table.render();
        }
    }

    if (typeof window !== 'undefined') {
        window.ClassMaterialList = ClassMaterialList;
    }
}
