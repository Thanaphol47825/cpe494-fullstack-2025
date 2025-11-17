if (typeof window !== 'undefined' && !window.CoursePlanList) {
    class CoursePlanList {
        constructor(application) {
            this.application = application;
            // bind global delete handler (เหมือน _deleteCurriculum)
            window._deleteCoursePlan = this.handleDelete.bind(this);
            window._editCoursePlan = this.handleEdit.bind(this);
            window._viewDetailCoursePlan = this.handleViewDetail.bind(this);
            this.rawCoursePlans = []; // store raw data for possible edit/detail modals
        }

        getCoursePlanModalConfig() {
            const courseFields = [
                { name: 'ID', label: 'Course ID', type: 'number' },
                { name: 'Name', label: 'Course Name', type: 'text' },
                { name: 'Description', label: 'Description', type: 'text' },
                { name: 'Optional', label: 'Optional', type: 'boolean' },
                { name: 'CourseStatus', label: 'Course Status', type: 'courseStatus' },
            ];

            return {
                title: 'Course Plan Details',
                subtitle: 'View detailed information about this course plan',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                gradientFrom: 'from-cyan-600',
                gradientTo: 'to-blue-700',
                gradientFromHover: 'from-cyan-700',
                gradientToHover: 'to-blue-800',
                fields: [
                    { name: 'ID', label: 'No', type: 'number' },
                    { name: 'Week', label: 'Week', type: 'number' },
                    { name: 'Date', label: 'Schedule', type: 'datetime' },
                    { name: 'Topic', label: 'Topic', type: 'text' },
                    { name: 'Description', label: 'Description', type: 'text' },
                ],
                nestedObjects: [
                    {
                        name: 'Course',
                        label: 'Course Information',
                        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                        gradient: 'from-amber-500 to-orange-600',
                        fields: courseFields,
                        nestedObjects: []
                    }
                ]
            };
        }

        async getActionTemplate() {
            if (!CoursePlanList.actionTemplateHtml) {
                const response = await fetch(`${RootURL}/curriculum/static/view/CoursePlanActionButtons.tpl`);
                CoursePlanList.actionTemplateHtml = (await response.text()).trim();
            }
            return CoursePlanList.actionTemplateHtml;
        }
        // raw fetch
        async getCoursePlans() {
            const res = await fetch(`${RootURL}/curriculum/CoursePlan/getCoursePlans`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ({ result: [] }));
            return data.result || [];
        }

        // format and return display rows
        async getAllCoursePlans() {
            const rawData = await this.getCoursePlans();
            this.rawCoursePlans = rawData; // store raw data for edit/modal

            const plans = [];
            rawData.forEach(item => {
                const id = item.ID;
                const courseId = item.CourseId ?? item.Course?.ID ?? null;
                const courseName = item.Course ? item.Course.Name : 'N/A';

                const raw = item.Date ?? item.date ?? null;
                let dateISO = null;
                let dateDisplay = 'N/A';
                if (raw) {
                    const d = new Date(raw);
                    if (!isNaN(d.getTime())) {
                        dateISO = d.toISOString();
                        dateDisplay = d.toLocaleString();
                    }
                }

                plans.push({
                    ID: id,
                    CourseId: courseId,
                    CourseName: courseName,
                    DateISO: dateISO,
                    DateDisplay: dateDisplay,
                    Week: item.Week ?? item.week ?? null,
                    Topic: item.Topic ?? item.topic ?? '',
                    Description: item.Description ?? item.description ?? ''
                });
            });

            return plans;
        }

        async handleDelete(coursePlanId) {
            if (!coursePlanId) return;
            if (!confirm('Delete Course Plan?')) return;

            try {
                const resp = await fetch(`${RootURL}/curriculum/CoursePlan/deleteCoursePlan/${coursePlanId}`, {
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

        formatDateForInput(dateValue) {
            if (!dateValue) return '';
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) {
                return '';
            }
            // convert to local datetime-local format (YYYY-MM-DDTHH:mm)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        findCoursePlan(coursePlanId) {
            const numericId = Number(coursePlanId);
            return this.rawCoursePlans.find(item => Number(item.ID) === numericId);
        }

        async ensureEditModalTemplate() {
            if (!window.EditModalTemplate) {
                await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
            }
        }

        async ensureViewDetailTemplate() {
            const moduleFile = 'template/CurriculumViewDetailModalTemplate.js';
            const hasCoursePlanConfig = () => Boolean(window.ViewDetailModalTemplate?.MODAL_CONFIGS?.CoursePlan);

            if (!window.ViewDetailModalTemplate) {
                await this.application.loadSubModule(moduleFile);
            }

            if (!hasCoursePlanConfig()) {
                const basePath = this.application?.subModulePath || '/curriculum/static/js';
                const fullPath = `${basePath}/${moduleFile}`;
                if (this.application?.loadedSubModules?.has(fullPath)) {
                    this.application.loadedSubModules.delete(fullPath);
                }
                delete window.ViewDetailModalTemplate;
                await this.application.loadSubModule(moduleFile);
            }

            if (!hasCoursePlanConfig() && window.ViewDetailModalTemplate) {
                if (!window.ViewDetailModalTemplate.MODAL_CONFIGS) {
                    window.ViewDetailModalTemplate.MODAL_CONFIGS = {};
                }
                window.ViewDetailModalTemplate.MODAL_CONFIGS.CoursePlan = this.getCoursePlanModalConfig();
            }

            if (!hasCoursePlanConfig()) {
                throw new Error('CoursePlan view detail configuration missing');
            }
        }

        async handleEdit(coursePlanId) {
            if (!coursePlanId) return;

            try {
                await this.ensureEditModalTemplate();

                const coursePlanData = this.findCoursePlan(coursePlanId);
                if (!coursePlanData) {
                    alert('Course Plan not found');
                    return;
                }

                const modalId = `courseplan-${coursePlanData.ID}`;
                const editableData = {
                    ...coursePlanData,
                    Date: this.formatDateForInput(coursePlanData.Date || coursePlanData.date)
                };

                await EditModalTemplate.createModalWithForm({
                    modalType: 'CoursePlan',
                    modalId,
                    application: this.application,
                    modelPath: 'curriculum/courseplan',
                    data: editableData,
                    submitHandler: async (formData) => {
                        return await this.updateCoursePlan(coursePlanData.ID, formData);
                    }
                });

            } catch (error) {
                console.error('Error opening edit modal:', error);
                alert('Error opening edit modal: ' + error.message);
            }
        }

        async handleViewDetail(coursePlanId) {
            if (!coursePlanId) return;

            try {
                await this.ensureViewDetailTemplate();

                const coursePlanData = this.findCoursePlan(coursePlanId);
                if (!coursePlanData) {
                    alert('Course Plan not found');
                    return;
                }

                const modalId = `courseplan-view-${coursePlanData.ID}`;
                await ViewDetailModalTemplate.createModal({
                    modalType: 'CoursePlan',
                    modalId,
                    data: coursePlanData
                });

            } catch (error) {
                console.error('Error opening course plan detail modal:', error);
                alert('Error opening detail modal: ' + error.message);
            }
        }

        async updateCoursePlan(coursePlanId, formData) {
            try {
                const payload = {
                    ID: Number(coursePlanId),
                    CourseId: parseInt(formData.CourseId, 10),
                    Date: formData.Date ? new Date(formData.Date).toISOString() : null,
                    Week: formData.Week !== undefined ? parseInt(formData.Week, 10) : null,
                    Topic: formData.Topic ?? '',
                    Description: formData.Description ?? ''
                };

                const res = await fetch(`${RootURL}/curriculum/CoursePlan/updateCoursePlan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await res.json().catch(() => ({}));

                if (!res.ok || result.isSuccess === false) {
                    throw new Error(result.result || `HTTP ${res.status}`);
                }

                await this.refreshTable();
                return { success: true, message: 'Course Plan updated successfully!' };
            } catch (error) {
                console.error('Update course plan failed:', error);
                alert('Update failed: ' + (error?.message || error));
                return { success: false, message: error?.message || 'Update failed' };
            }
        }

        async refreshTable() {
            const plans = await this.getAllCoursePlans();
            if (this.table && typeof this.table.setData === 'function') {
                this.table.setData(plans);
            }
            // follow ClassList pattern: re-render the view after updating data
            await this.render();
        }

        async render() {
            // เคลียร์ main container
            this.application.templateEngine.mainContainer.innerHTML = "";

            // ใช้ ListTemplate (ต้องมี template id: 'CoursePlanList')
            const listWrapper = await ListTemplate.getList('CoursePlanList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            // โหลดข้อมูลและ template ของปุ่ม
            const [plans, actionTemplate] = await Promise.all([
                this.getAllCoursePlans(),
                this.getActionTemplate(),
            ]);

            // Hide action buttons for Student role, mirroring ClassMaterialList behavior
            const currentRole = localStorage.getItem('userRole');
            const isStudent = currentRole === 'Student';
            const customColumns = [];
            if (!isStudent) {
                customColumns.push({
                    name: "actions",
                    label: "Actions",
                    template: actionTemplate
                });
            }

            // สร้างตารางด้วย AdvanceTableRender
            this.table = new AdvanceTableRender(this.application.templateEngine, {
                modelPath: "curriculum/courseplan",
                data: plans,
                targetSelector: "#courseplan-table",
                schema: [
                    { name: "ID",          label: "No.",        type: "number" },
                    { name: "CourseName",  label: "Course",     type: "text" },
                    { name: "CourseId",    label: "Course ID",  type: "number" },
                    { name: "DateDisplay", label: "Date",       type: "text" },
                    { name: "Week",        label: "Week",       type: "number" },
                    { name: "Topic",       label: "Topic",      type: "text" },
                ],
                enableSearch: true,
                searchConfig: {
                    placeholder: "Search course plans...",
                    fields: [
                        { value: "all", label: "All" },
                        { value: "CourseName", label: "Course" },
                        { value: "Topic", label: "Topic" },
                        { value: "Week", label: "Week" },
                        { value: "DateDisplay", label: "Date" }
                    ]
                },
                // คอลัมน์เสริมสำหรับปุ่มแอ็คชัน (ซ่อนเมื่อเป็น Student)
                customColumns
            });

            await this.table.render();

            // ensure routerLink bindings are applied to newly injected action buttons
            const routerLinks = this.application?.templateEngine?.routerLinks;
            if (routerLinks && typeof routerLinks.initializeRouterLinks === 'function') {
                routerLinks.initializeRouterLinks();
            }
        }
    }

    window.CoursePlanList = CoursePlanList;
    CoursePlanList.actionTemplateHtml = null;
}
