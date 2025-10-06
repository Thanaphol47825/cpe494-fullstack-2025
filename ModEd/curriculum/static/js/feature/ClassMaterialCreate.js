if (typeof window !== 'undefined' && !window.ClassMaterialCreate) {
    class ClassMaterialCreate {
        constructor(application) {
            this.application = application;
        }

        getClassesOption = async () => {
            const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let select = []
            data.result.forEach(item => {
                let formattedSchedule = "";
                if (item.Schedule) {
                    const d = new Date(item.Schedule);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    formattedSchedule = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
                }

                let label = item.Course.Name + " - " + formattedSchedule;

                select.push({ value: item.ID, label: label });
            });
            return select;
        }

        handleSubmit = async (e) => {
            e.preventDefault(); // prevent default form submission
            const form = document.getElementById('curriculum-form');
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            if (!payload.ClassId) {
                alert("Please select a class.");
                return;
            }
            payload.ClassId = parseInt(payload.ClassId);

            try {
                const res = await fetch(`${RootURL}/curriculum/ClassMaterial/createClassMaterial`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.isSuccess) {
                    alert("Class Material saved!");
                    form.reset();
                } else {
                    alert("Error: " + (data.result || "Failed to save"));
                }
            } catch (err) {
                alert("Network error: " + err.message);
            }
        };

        render = async () => {
            // clear application container
            this.application.mainContainer.innerHTML = "";

            // create form wrapper
            const formWrapper = this.application.create(`
                <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                    <!-- Background Decorative Elements -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                        <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
                        <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
                    </div>

                    <!-- Main Content -->
                    <div class="relative z-10 container mx-auto px-4 py-12">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-6">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
                                Create Class Material
                            </h1>
                            <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4 rounded-full"></div>
                            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                Add new learning materials and resources to enhance your class experience
                            </p>
                        </div>

                        <!-- Form Card -->
                        <div class="max-w-2xl mx-auto">
                            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
                                <form method="POST" id="curriculum-form" class="space-y-6">
                                    <div id="form-fields" class="space-y-6"></div>
                                    
                                    <!-- Submit Button -->
                                    <div class="pt-6">
                                        <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                            Create Class Material
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
            this.application.mainContainer.appendChild(formWrapper);

            // fetch class options
            const classesOption = await this.getClassesOption();

            // define form fields
            const fields = [
                {
                    Id: "ClassId", Label: "Class", Type: "select", Name: "ClassId", required: true,
                    options: classesOption
                },
                { Id: "file_name", Label: "File Name", Type: "text", Name: "FileName", Required: true, Placeholder: "Enter Class Material File Name" },
                { Id: "file_path", Label: "File Path", Type: "text", Name: "FilePath", Required: true, Placeholder: "Enter Class Material File Path" },
            ];

            // render form template
            const fieldsContainer = document.getElementById('form-fields');
            fieldsContainer.innerHTML = '';
            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select" && this.application.template && this.application.template.SelectInput) {
                    inputHTML = Mustache.render(this.application.template.SelectInput, field);
                }

                else if (this.application.template && this.application.template.Input) {
                    inputHTML = Mustache.render(this.application.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            let formHandler = document.getElementById('curriculum-form');
            formHandler.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ClassMaterialCreate = ClassMaterialCreate;
    }
}