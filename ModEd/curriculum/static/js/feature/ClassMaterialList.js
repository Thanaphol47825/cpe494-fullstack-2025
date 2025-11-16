if (typeof window !== 'undefined' && !window.ClassMaterialList) {
    class ClassMaterialList {
        constructor(application) {
            this.application = application;
            this.rawClassMaterials = []; // Store raw data for edit modal
            window._deleteClassMaterial = this.handleDelete.bind(this);
            window._editClassMaterial = this.handleEdit.bind(this);
            window._viewDetailClassMaterial = this.handleViewDetail.bind(this);
        }

        async getActionTemplate() {
            if (!ClassMaterialList.actionTemplateHtml) {
                const response = await fetch(`${RootURL}/curriculum/static/view/ClassMaterialActionButtons.tpl`);
                ClassMaterialList.actionTemplateHtml = (await response.text()).trim();
            }
            return ClassMaterialList.actionTemplateHtml;
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

        async handleViewDetail(classMaterialId) {
            if (!classMaterialId) return;
            
            try {
                // โหลด CurriculumViewDetailModalTemplate ถ้ายังไม่ได้โหลด
                if (!window.ViewDetailModalTemplate) {
                    await this.application.loadSubModule('template/CurriculumViewDetailModalTemplate.js');
                }

                // Find the class material data with all nested objects
                const classMaterialData = this.rawClassMaterials.find(item => item.ID === classMaterialId);
                if (!classMaterialData) {
                    alert('Class Material not found');
                    return;
                }

                const modalId = `classmaterial-view-${classMaterialId}`;
                
                // Create view detail modal
                await ViewDetailModalTemplate.createModal({
                    modalType: 'ClassMaterial',
                    modalId: modalId,
                    data: classMaterialData
                });

            } catch (error) {
                console.error('Error opening view detail modal:', error);
                alert('Error opening view detail modal: ' + error.message);
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
            if (this.table && typeof this.table.setData === 'function') {
                this.table.setData(classMaterials);
            }
            // follow ClassList pattern: re-render the view after updating data
            await this.render();
        }

        async render() {
            // เคลียร์ main container
            this.application.templateEngine.mainContainer.innerHTML = "";
            
            // Use ListTemplate to generate the wrapper
            const listWrapper = await ListTemplate.getList('ClassMaterialList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            // โหลดข้อมูลและ template ของปุ่ม
            const [classMaterials, actionTemplate] = await Promise.all([
                this.getAllClassMaterials(),
                this.getActionTemplate(),
            ]);

            console.log(classMaterials);
            // สร้างตารางด้วย AdvanceTableRender
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/classmaterial",
                data: classMaterials,
                targetSelector: "#classmaterial-table",
                schema: [
                    { name: "ID", label: "No.", type: "number" },
                    { name: "Section", label: "Section", type: "text" },
                    { name: "CourseName", label: "Course Name", type: "text" },
                    { name: "Schedule", label: "Schedule", type: "text" },
                    { name: "FileName", label: "File Name", type: "text" },
                ],
                // คอลัมน์เสริมสำหรับปุ่มแอ็คชัน
                customColumns: [
                    {
                        name: "actions",
                        label: "Actions",
                        template: actionTemplate
                    }
                ],
                // เปิดใช้งาน Search และ Sorting
                enableSearch: true,
                searchConfig: {
                    placeholder: "Search class materials...",
                    fields: [
                        { value: "all", label: "All" },
                        { value: "Section", label: "Section" },
                        { value: "CourseName", label: "Course Name" },
                        { value: "Schedule", label: "Schedule" },
                        { value: "FileName", label: "File Name" },
                    ]
                },
                enableSorting: true,
                sortConfig: {
                    defaultField: "ID",
                    defaultDirection: "asc"
                },
                // เปิด Pagination (optional)
                enablePagination: true,
                pageSize: 10
            });

            await this.table.render();

            // ensure routerLink bindings are applied to newly injected action buttons
            const routerLinks = this.application?.templateEngine?.routerLinks;
            if (routerLinks && typeof routerLinks.initializeRouterLinks === 'function') {
                routerLinks.initializeRouterLinks();
            }
        }
    }

    if (typeof window !== 'undefined') {
        window.ClassMaterialList = ClassMaterialList;
    }
    ClassMaterialList.actionTemplateHtml = null;
}
