if (typeof window !== 'undefined' && !window.CoursePlanList) {
    class CoursePlanList {
        constructor(application) {
            this.application = application;
            // bind global delete handler (เหมือน _deleteCurriculum)
            window._deleteCoursePlan = this.handleDelete.bind(this);
            // sorting state: keys should match backend allowed sort keys
            this._sort = { sort: 'id', order: 'asc' };
        }

        // opts: { sort: 'id'|'CourseId'|'Course'|'Date'|'Week', order: 'asc'|'desc' }
        async getAllCoursePlans(opts = {}) {
            const params = new URLSearchParams();
            const sort = opts.sort || this._sort.sort || 'id';
            const order = opts.order || this._sort.order || 'asc';
            if (sort) params.set('sort', sort);
            if (order) params.set('order', order);

            const url = `${RootURL}/curriculum/CoursePlan/getCoursePlans` + (params.toString() ? `?${params.toString()}` : '');
            const res = await fetch(url, {
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
            const plans = await this.getAllCoursePlans(this._sort);
            if (this.table && typeof this.table.setData === 'function') {
                this.table.setData(plans);
                return;
            }
            // if table not created yet, create it by rendering
            await this.render();
        }

        async render() {
            // เคลียร์ main container
            this.application.templateEngine.mainContainer.innerHTML = "";

            // ใช้ ListTemplate (ต้องมี template id: 'CoursePlanList')
            const listWrapper = await ListTemplate.getList('CoursePlanList');
            this.application.templateEngine.mainContainer.appendChild(listWrapper);

            // create sort controls (toolbar)
            const toolbar = document.createElement('div');
            toolbar.className = 'flex items-center gap-3';

            const label = document.createElement('span');
            label.textContent = 'Sort:';
            label.className = 'text-sm justify-center font-medium mr-2';
            toolbar.appendChild(label);

            const sortSelect = document.createElement('select');
            sortSelect.className = 'rounded px-2 py-1 border';
            const sortOptions = [
                { label: 'ID', value: 'id' },
                { label: 'Course ID', value: 'CourseId' },
                { label: 'Course', value: 'Course' },
                { label: 'Date', value: 'Date' },
                { label: 'Week', value: 'Week' },
            ];
            sortOptions.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.text = o.label;
                sortSelect.appendChild(opt);
            });

            const orderBtn = document.createElement('button');
            orderBtn.type = 'button';
            orderBtn.className = 'rounded px-3 py-1 border';
            orderBtn.textContent = this._sort.order || 'asc';

            toolbar.appendChild(sortSelect);
            toolbar.appendChild(orderBtn);

            // Try inserting toolbar into the action buttons area (near the Create button)
            // Fallback: insert before the table container
            let inserted = false;
            try {
                const createBtn = listWrapper.querySelector('a[routerLink="curriculum/courseplan/create"]');
                if (createBtn) {
                    // find the parent container that holds action buttons
                    const actionGroup = createBtn.closest('div.flex.gap-3') || createBtn.parentNode;
                    if (actionGroup && actionGroup.parentNode) {
                        // insert toolbar after the actionGroup to align with buttons
                        actionGroup.parentNode.insertBefore(toolbar, actionGroup.nextSibling);
                        inserted = true;
                    }
                }
            } catch (e) {
                // ignore and fallback
            }

            if (!inserted) {
                // fallback: insert toolbar before table target
                const tableContainer = listWrapper.querySelector('#courseplan-table');
                if (tableContainer && tableContainer.parentNode) {
                    tableContainer.parentNode.insertBefore(toolbar, tableContainer);
                } else {
                    // fallback: append to wrapper
                    listWrapper.insertBefore(toolbar, listWrapper.firstChild);
                }
            }

            // set initial values
            try {
                sortSelect.value = this._sort.sort;
            } catch (e) { /* ignore */ }
            orderBtn.textContent = this._sort.order || 'asc';

            // handlers
            sortSelect.addEventListener('change', async (e) => {
                this._sort.sort = e.target.value;
                await this.refreshTable();
            });
            orderBtn.addEventListener('click', async (e) => {
                this._sort.order = (this._sort.order === 'asc') ? 'desc' : 'asc';
                orderBtn.textContent = this._sort.order;
                await this.refreshTable();
            });

            // โหลดข้อมูล
            const plans = await this.getAllCoursePlans(this._sort);

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
