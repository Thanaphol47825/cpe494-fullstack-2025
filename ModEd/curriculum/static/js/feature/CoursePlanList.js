if (typeof window !== 'undefined' && !window.CoursePlanList) {
    class CoursePlanList {
        constructor(application) {
            this.application = application;
            // bind global delete handler (เหมือน _deleteCurriculum)
            window._deleteCoursePlan = this.handleDelete.bind(this);
        }

        async getAllCoursePlans() {
            const res = await fetch(`${RootURL}/curriculum/CoursePlan/getCoursePlans`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ({ result: [] }));

            const items = Array.isArray(data?.result) ? data.result : [];

            const plans = [];
            items.forEach(item => {
                const id = item.ID;
                const courseId = item.CourseId ?? item.Course?.ID ?? null;
                const courseName = item.Course?.Name ?? item.CourseName ?? item.Course?.name ?? 'N/A';

                const raw = item.Date ?? item.date ?? null;
                let dateISO = null;
                let dateDisplay = 'N/A';
                if (raw) {
                    const d = new Date(raw);
                    if (!isNaN(d.getTime())) {
                        dateISO = d.toISOString();
                        // ใช้ locale ผู้ใช้; จะให้คงที่ก็เปลี่ยนได้
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

        async refreshTable() {
            const plans = await this.getAllCoursePlans();
            if (this.table && typeof this.table.setData === 'function') {
                this.table.setData(plans);
            }
            // คงสไตล์เดียวกับตัวอย่าง: เรียก render ใหม่
            await this.render();
        }

        async render() {
            // เคลียร์ main container
            this.application.templateEngine.mainContainer.innerHTML = "";

            // ใช้ ListTemplate (ต้องมี template id: 'CoursePlanList')
            const listWrapper = await ListTemplate.getList('CoursePlanList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            // โหลดข้อมูล
            const plans = await this.getAllCoursePlans();

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
                // คอลัมน์เสริมสำหรับปุ่มแอ็คชัน
                customColumns: [
                    {
                        name: "actions",
                        label: "Actions",
                        template: `
                            <div class="flex space-x-2">
                                <a routerLink="curriculum/courseplan/{ID}" 
                                   class="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                                    Edit
                                </a>
                                <button id="courseplan-del-btn" onclick="_deleteCoursePlan({ID})" 
                                        class="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                    Delete
                                </button>
                            </div>
                        `
                    }
                ]
            });

            await this.table.render();
        }
    }

    window.CoursePlanList = CoursePlanList;
}
