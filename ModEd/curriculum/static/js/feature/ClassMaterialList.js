if (typeof window !== 'undefined' && !window.ClassMaterialList) {
    class ClassMaterialList {
        constructor(application) {
            this.application = application;
            this.rawClassMaterials = []; // Store raw data for edit modal
            window._deleteClassMaterial = this.handleDelete.bind(this);
            window._editClassMaterial = this.handleEdit.bind(this);
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
            this.rawClassMaterials = rawData; // Store raw data for edit modal
            
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

        async handleEdit(classMaterialId) {
            if (!classMaterialId) return;
            
            try {
                // โหลด CurriculumEditModalTemplate ถ้ายังไม่ได้โหลด
                if (!window.EditModalTemplate) {
                    await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
                }

                // Find the class material data
                const classMaterialData = this.rawClassMaterials.find(item => item.ID === classMaterialId);
                if (!classMaterialData) {
                    alert('Class Material not found');
                    return;
                }

                const modalId = `classmaterial-${classMaterialId}`;
                
                // Create modal with AdvanceFormRender
                const { modal, form } = await EditModalTemplate.createModalWithForm({
                    modalType: 'ClassMaterial',
                    modalId: modalId,
                    application: this.application,
                    modelPath: 'curriculum/classmaterial',
                    data: classMaterialData,
                    submitHandler: async (formData) => {
                        return await this.updateClassMaterial(classMaterialId, formData);
                    }
                });

            } catch (error) {
                console.error('Error opening edit modal:', error);
                alert('Error opening edit modal: ' + error.message);
            }
        }

        async updateClassMaterial(classMaterialId, formData) {
            try {
                const payload = {
                    ID: classMaterialId,
                    ClassId: parseInt(formData.ClassId),
                    FileName: formData.FileName,
                    FilePath: formData.FilePath
                };

                const res = await fetch(`${RootURL}/curriculum/ClassMaterial/updateClassMaterial`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await res.json();
                
                if (result.isSuccess) {
                    // Refresh table after successful update
                    await this.refreshTable();
                    return { success: true, message: 'Class Material updated successfully!' };
                } else {
                    return { success: false, message: result.result || 'Failed to update Class Material' };
                }
            } catch (err) {
                return { success: false, message: 'Network error: ' + err.message };
            }
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
                                <button onclick="_editClassMaterial({ID})" 
                                        class="bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="_deleteClassMaterial({ID})" 
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
        }
    }

    if (typeof window !== 'undefined') {
        window.ClassMaterialList = ClassMaterialList;
    }
}
