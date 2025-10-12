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

        // handleSubmit accepts plain formData object (AdvanceFormRender style)
        async handleSubmit(formData) {
            try {
                // basic validation
                if (!formData.CourseId) {
                    alert("Please select a course.");
                    return false;
                }
                formData.CourseId = parseInt(formData.CourseId);

                // convert datetime-local to ISO
                let dateISO = null;
                if (formData.date) {
                    const dt = new Date(formData.date);
                    if (!isNaN(dt)) dateISO = dt.toISOString();
                }
                if (!dateISO) {
                    alert("Please select a valid date/time.");
                    return false;
                }

                const payload = {
                    CourseId: formData.CourseId,
                    date: dateISO,
                    week: formData.week ? parseInt(formData.week) : null,
                    topic: formData.topic || "",
                    description: formData.description || ""
                };

                if (!payload.week) {
                    alert("Please enter week number.");
                    return false;
                }

                const ROOT = (typeof RootURL !== 'undefined' ? RootURL : (window.__ROOT_URL__ || ""));
                const resp = await fetch(`${ROOT}/curriculum/CoursePlan/createCoursePlan`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await resp.json().catch(() => ({}));
                if (data.isSuccess) {
                    alert("Course Plan saved!");
                    // reset form if present
                    const formEl = document.querySelector('#coursePlanForm');
                    if (formEl) formEl.reset();
                    return true;
                } else {
                    alert("Error: " + (data.result || data.message || "Failed to save"));
                    return false;
                }
            } catch (err) {
                alert("Network error: " + (err && err.message ? err.message : err));
                return false;
            }
        }

        async render() {
            // follow CurriculumCreate pattern
            this.application.mainContainer.innerHTML = "";
            const formWrapper = this.application.create(`
                <div class="bg-gray-50 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-6">Create Course Plan</h1>
                    <form id="coursePlanForm" method="POST">
                        <div id="form-fields"></div>
                        <div style="margin-top:12px;">
                            <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700">Save Course Plan</button>
                        </div>
                    </form>
                    <div style="margin-top:16px; text-align:center;">
                        <a routerLink="curriculum" style="color:#6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(formWrapper);

            // Use AdvanceFormRender like CurriculumCreate
            this.form = new AdvanceFormRender(this.application, {
                modelPath: "curriculum/coursePlan",
                targetSelector: "#coursePlanForm",
                submitHandler: async (formData) => {
                    await this.handleSubmit(formData);
                }
            });

            await this.form.render();
        }
    }

    if (typeof window !== 'undefined') {
        window.CoursePlanCreate = CoursePlanCreate;
    }
}