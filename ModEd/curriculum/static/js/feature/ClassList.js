if (typeof window !== 'undefined' && !window.ClassList) {
    class ClassList {
        constructor(application) {
            this.application = application;
            this.rawClasses = []; // Store raw data for edit modal
            window._deleteClass = this.handleDelete.bind(this);
            window._editClass = this.handleEdit.bind(this);
            window._viewDetailClass = this.handleViewDetail.bind(this);
        }

        async getActionTemplate() {
            if (!ClassList.actionTemplateHtml) {
                const response = await fetch(`${RootURL}/curriculum/static/view/ClassActionButtons.tpl`);
                ClassList.actionTemplateHtml = (await response.text()).trim();
            }
            return ClassList.actionTemplateHtml;
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
                let formattedSchedule = "";
                if (item.Schedule) {
                    const date = new Date(item.Schedule);
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

                classes.push({ 
                    ID: item.ID, 
                    CourseId: item.CourseId, 
                    CourseName: item.Course ? item.Course.Name : 'N/A', 
                    Section: item.Section, 
                    Schedule: formattedSchedule || 'N/A'
                });
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
            if (this.table && typeof this.table.setData === 'function') {
                this.table.setData(classes);
            }
            // follow ClassList pattern: re-render the view after updating data
            await this.render();
        }

        async render() {
            // เคลียร์ main container
            this.application.templateEngine.mainContainer.innerHTML = "";
            
            // Use ListTemplate to generate the wrapper
            const listWrapper = await ListTemplate.getList('ClassList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            // โหลดข้อมูลและ template ของปุ่ม
            const [classes, actionTemplate] = await Promise.all([
                this.getAllClasses(),
                this.getActionTemplate(),
            ]);

            // Check current user role
            const currentRole = localStorage.getItem('userRole');
            const isAdmin = currentRole === 'Admin';

            // Prepare custom columns - only include Actions if Admin
            const customColumns = [];
            if (isAdmin) {
                customColumns.push({
                    name: "actions",
                    label: "Actions",
                    template: actionTemplate
                });
            }

            // สร้างตารางด้วย AdvanceTableRender
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/Class",
                data: classes,
                targetSelector: "#class-table",
                schema: [
                    { name: "ID", label: "No.", type: "number" },
                    { name: "CourseName", label: "Course Name", type: "text" },
                    { name: "Section", label: "Section", type: "text" },
                    { name: "Schedule", label: "Schedule", type: "text" },
                ],
                // คอลัมน์เสริมสำหรับปุ่มแอ็คชัน - แสดงเฉพาะ Admin
                customColumns: customColumns,
                // เปิดใช้งาน Search และ Sorting
                enableSearch: true,
                searchConfig: {
                    placeholder: "Search classes...",
                    fields: [
                        { value: "all", label: "All" },
                        { value: "CourseName", label: "Course Name" },
                        { value: "Section", label: "Section" },
                        { value: "Schedule", label: "Schedule" },
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
        window.ClassList = ClassList;
    }
    ClassList.actionTemplateHtml = null;
}
