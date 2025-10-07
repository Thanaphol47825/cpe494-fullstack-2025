if (typeof window !== 'undefined' && !window.ClassCreate) {
    class ClassCreate {
        constructor(application) {
            this.application = application;
        }

        getCoursesOption = async () => {
            try {
                const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json().catch(() => ([]));
                if (!res.ok) {
                    const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
                    throw new Error(msg);
                }

                let select = [];
                data.result.forEach(item => {
                    select.push({ value: item.ID, label: item.Name });
                });
                return select;
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                return [];
            }
        }

        handleSubmit = async (e) => {
            e.preventDefault();
            const form = document.getElementById('curriculum-form');
            const formData = new FormData(form);
            const scheduleLocal = formData.get('Schedule');
            const scheduleISO = scheduleLocal ? new Date(scheduleLocal).toISOString() : null;
            
            const payload = {
                CourseId: parseInt(formData.get('CourseId')),
                Section: parseInt(formData.get('Section')),
                Schedule: scheduleISO,
            };

            if (!payload.CourseId) {
                alert("Please select a course.");
                return;
            }

            try {
                const resp = await fetch(`${RootURL}/curriculum/Class/createClass`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await resp.json();
                if (data.isSuccess) {
                    alert("Class saved!");
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

            // create form wrapper
            const formWrapper = this.application.templateEngine.create(`
                <div class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
                    <!-- Background Decorative Elements -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
                    </div>

                    <!-- Main Content -->
                    <div class="relative z-10 container mx-auto px-4 py-12">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-lg mb-6">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-4">
                                Create Class
                            </h1>
                            <div class="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 mx-auto mb-4 rounded-full"></div>
                            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                Create a new class session with course, section, and schedule information
                            </p>
                        </div>

                        <!-- Form Card -->
                        <div class="max-w-2xl mx-auto">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
                                <form method="POST" id="curriculum-form" class="space-y-6">
                                    <div id="form-fields" class="space-y-6"></div>
                                    
                                    <!-- Submit Button -->
                                    <div class="pt-6">
                                        <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                            Create Class
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

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
                </div>
            `);
            this.application.templateEngine.mainContainer.appendChild(formWrapper);

            // fetch course options
            const coursesOption = await this.getCoursesOption();

            // define form fields
            const fields = [
                {
                    Id: "CourseId", Label: "Course", Type: "select", Name: "CourseId", required: true,
                    options: coursesOption
                },
                { Id: "section", Label: "Section", Type: "number", Name: "Section", Required: true, Placeholder: "Enter Section Number" },
                { Id: "schedule", Label: "Schedule", Type: "datetime-local", Name: "Schedule", Required: true, Placeholder: "Select Schedule" },
            ];

            // render form template
            const fieldsContainer = document.getElementById('form-fields');
            fieldsContainer.innerHTML = '';
            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select" && this.application.templateEngine.template && this.application.templateEngine.template.SelectInput) {
                    inputHTML = Mustache.render(this.application.templateEngine.template.SelectInput, field);
                }
                else if (this.application.templateEngine.template && this.application.templateEngine.template.Input) {
                    inputHTML = Mustache.render(this.application.templateEngine.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.templateEngine.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            let formHandler = document.getElementById('curriculum-form');
            formHandler.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ClassCreate = ClassCreate;
    }
}
