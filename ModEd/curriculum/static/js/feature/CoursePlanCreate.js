if (typeof window !== 'undefined' && !window.CoursePlanCreate) {
    class CoursePlanCreate {
        constructor(application) {
            this.application = application;
        }

        getCoursesOption = async () => {
            try {
                const ROOT = (typeof RootURL !== 'undefined' ? RootURL : (window.__ROOT_URL__ || ""));
                const res = await fetch(`${ROOT}/curriculum/course/getCourses`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                if (!res.ok) {
                    const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
                    throw new Error(msg);
                }

                const opts = [];
                (data.result || []).forEach(item => {
                    opts.push({
                        value: item.ID,
                        label: item.Name || item.name || item.Title || item.title || String(item.ID)
                    });
                });
                return opts;
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                return [];
            }
        }

        handleSubmit = async (e) => {
            e.preventDefault();
            const form = document.getElementById('coursePlanForm');
            const formData = new FormData(form);

            // แปลงค่าจาก input datetime-local เป็น ISO string
            const rawDate = formData.get('date');
            const dateISO = rawDate ? new Date(rawDate).toISOString() : null;

            const payload = {
                CourseId: parseInt(formData.get('CourseId')),
                date: dateISO, // ส่งเป็น ISO
                week: formData.get('week') ? parseInt(formData.get('week')) : null,
                topic: formData.get('topic'),
                description: formData.get('description')
            };

            if (!payload.CourseId) {
                alert("Please select a course.");
                return;
            }
            if (!payload.date) {
                alert("Please select a date/time.");
                return;
            }
            if (!payload.week) {
                alert("Please enter week number.");
                return;
            }
            try {
                const ROOT = (typeof RootURL !== 'undefined' ? RootURL : (window.__ROOT_URL__ || ""));
                const resp = await fetch(`${ROOT}/curriculum/CoursePlan/createCoursePlan`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await resp.json();
                if (data.isSuccess) {
                    alert("Course Plan saved!");
                    form.reset();
                } else {
                    alert("Error: " + (data.result || "Failed to save"));
                }
            } catch (err) {
                alert("Network error: " + err.message);
            }
        }

        render = async () => {
            // clear application container
            this.application.templateEngine.mainContainer.innerHTML = "";

            // create form wrapper HTML (keeps same fields as before)
            // ...existing code...
            // create form wrapper HTML (keeps same fields as before)
            const wrapper = this.application.templateEngine.create(`
                <div class="max-w-3xl mx-auto py-10 px-4">
                    <!-- Background Decorative Elements -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
                    </div>

                    <!-- Main Content -->
                    <div class="relative z-10 container mx-auto px-4 py-12">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-600 to-indigo-700 rounded-2xl shadow-lg mb-6">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-800 to-indigo-900 bg-clip-text text-transparent mb-4">
                                Create Course Plan
                            </h1>
                            <div class="w-24 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600 mx-auto mb-4 rounded-full"></div>
                            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                Create a new class session with course, section, and schedule information
                            </p>
                        </div>
                    <section class="bg-white rounded-2xl shadow p-6">
                        <form id="coursePlanForm" method="post" action="${(typeof RootURL !== 'undefined' ? RootURL : (window.__ROOT_URL__ || ""))}/curriculum/CoursePlan/createCoursePlan" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div id="CourseSelectWrap">
                                <div id="CourseSelectContainer" aria-label="Course"></div>
                            </div>
                            <div>
                                <div id="DateFieldContainer" aria-label="Date"></div>
                            </div>
                            <div>
                                <div id="WeekFieldContainer" aria-label="Week"></div>
                            </div>
                            <div>
                                <div id="TopicFieldContainer" aria-label="Topic"></div>
                            </div>
                            <div>
                                <div id="DescriptionFieldContainer" aria-label="Description"></div>
                            </div>
                            <div class="md:col-span-2">
                                <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save Course Plan</button>
                            </div>
                        </form>
                    </section>
                    <!-- Back Button -->
                        <div class="text-center mt-12">
                            <a routerLink="curriculum" class="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90 border border-gray-200/50 font-medium">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                </svg>
                                Back to Curriculum Menu
                            </a>
                        </div>
                </div>
            `);

            this.application.templateEngine.mainContainer.appendChild(wrapper);

            // prepare fields rendering using template engine (Mustache) if available
            const coursesOption = await this.getCoursesOption();

            const fields = [
                { Id: "CourseId", Label: "Course", Type: "select", Name: "CourseId", required: true, options: coursesOption },
                // เปลี่ยนเป็น datetime-local เพื่อให้ input รองรับวันที่+เวลา
                { Id: "date", Label: "Date", Type: "datetime-local", Name: "date", required: true, Placeholder: "" },
                { Id: "week", Label: "Week", Type: "number", Name: "week", required: true, Placeholder: "Enter a number of week" },
                { Id: "topic", Label: "Topic", Type: "textarea", Name: "topic", required: true, Placeholder: "Course Plan Topic" },
                { Id: "description", Label: "Description", Type: "textarea", Name: "description", required: false, Placeholder: "Course Plan Description" }
            ];

            // render each field into its container
            fields.forEach(field => {
                let html = "";
                const tpl = this.application.templateEngine.template || {};
                if (field.Type === "select" && tpl.SelectInput) {
                    html = Mustache.render(tpl.SelectInput, field);
                } else if (field.Type === "textarea" && tpl.TextArea) {
                    html = Mustache.render(tpl.TextArea, field);
                } else if (tpl.Input) {
                    // fallback to generic input template (handles date, number, text)
                    html = Mustache.render(tpl.Input, field);
                } else {
                    // final fallback: build minimal HTML
                    // if (field.Type === "select") {
                    //     const options = (field.options || []).map(o => `<option value="${o.value}">${o.label}</option>`).join('');
                    //     html = `<select name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2">${options}</select>`;
                    // } else if (field.Type === "textarea") {
                    //     html = `<textarea name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="${field.Placeholder || ''}"></textarea>`;
                    // } else {
                    //     html = `<input type="${field.Type}" name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="${field.Placeholder || ''}" />`;
                    // }
                    if (field.Type === "select") {
                        const options = (field.options || []).map(o => `<option value="${o.value}">${o.label}</option>`).join('');
                        // add a default placeholder option to avoid empty select without label
                        html = `<select name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2"><option value="">Select ${field.Label || ''}</option>${options}</select>`;
                    } else if (field.Type === "textarea") {
                        html = `<textarea name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="${field.Placeholder || ''}"></textarea>`;
                    } else {
                        html = `<input type="${field.Type}" name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="${field.Placeholder || ''}" />`;
                    }
                }

                // append to specific container
                const targetId = {
                    CourseId: 'CourseSelectContainer',
                    date: 'DateFieldContainer',
                    week: 'WeekFieldContainer',
                    topic: 'TopicFieldContainer',
                    description: 'DescriptionFieldContainer'
                }[field.Id] || null;

                if (html && targetId) {
                    const el = this.application.templateEngine.create(html);
                    const container = wrapper.querySelector(`#${targetId}`);
                    if (container) {
                        container.innerHTML = "";
                        container.appendChild(el);
                    }
                }
            });

            // attach submit handler
            const formEl = document.getElementById('coursePlanForm');
            formEl.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    if (typeof window !== 'undefined') {
        window.CoursePlanCreate = CoursePlanCreate;
    }
}