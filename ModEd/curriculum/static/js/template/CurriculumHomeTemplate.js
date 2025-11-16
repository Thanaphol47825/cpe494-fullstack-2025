if (typeof window !== 'undefined' && !window.CurriculumHomeTemplate) {
    class CurriculumHomeTemplate {
        
        /**
         * Icon configurations สำหรับแต่ละ model
         */
        static MODEL_ICONS = {
            "Curriculum": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>`,
            "Course": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>`,
            "Class": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>`,
            "Class Material": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
            "Course Plan": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
            "Course Skill": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`,
            "Skill": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>`
        };

        /**
         * Color configurations สำหรับแต่ละ model
         */
        static MODEL_COLORS = {
            "Curriculum": "from-emerald-500 to-teal-600",
            "Course": "from-amber-500 to-orange-600", 
            "Class": "from-purple-500 to-indigo-600",
            "Class Material": "from-rose-500 to-pink-600",
            "Course Plan": "from-cyan-500 to-blue-600",
            "Course Skill": "from-blue-500 to-indigo-600",
            "Skill": "from-yellow-500 to-amber-600"
        };

        /**
         * Border colors สำหรับ hover effects
         */
        static MODEL_BORDER_COLORS = {
            "Curriculum": "emerald",
            "Course": "amber",
            "Class": "purple", 
            "Class Material": "rose",
            "Course Plan": "cyan",
            "Course Skill": "blue",
            "Skill": "yellow"
        };

        /**
         * สร้าง home template จากข้อมูล models
         * @param {Array} models - รายการ models ที่จะแสดง
         * @returns {Promise<HTMLElement>} - Template element ที่สร้างขึ้น
         */
        static async getTemplate(models) {
            try {
                // โหลด template จากไฟล์
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumHomeTemplate.tpl`);
                const templateContent = await response.text();

                // เตรียมข้อมูลสำหรับ Mustache
                const templateData = {
                    models: models.map(model => ({
                        label: model.label,
                        route: model.route,
                        icon: this.MODEL_ICONS[model.label] || this.MODEL_ICONS["Course"],
                        color: this.MODEL_COLORS[model.label] || "from-gray-500 to-gray-600",
                        borderColor: this.MODEL_BORDER_COLORS[model.label] || "gray",
                        description: `Educational ${model.label.toLowerCase()} management and administration tools`
                    }))
                };

                // Render template ด้วย Mustache
                const renderedHTML = Mustache.render(templateContent, templateData);

                // สร้าง DOM element จาก HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderedHTML.trim();
                
                const element = tempDiv.firstChild;

                // Initialize RoleManager after template is added to DOM
                setTimeout(() => {
                    if (window.roleManager) {
                        window.roleManager.updateRoleDisplay();
                    }
                }, 100);

                return element;

            } catch (error) {
                console.error('Error loading curriculum home template:', error);
                
                // Fallback: สร้าง simple template
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'p-8 bg-white rounded-lg shadow-md';
                fallbackDiv.innerHTML = `
                    <h1 class="text-3xl font-bold mb-6 text-center">Curriculum Management</h1>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${models.map(model => `
                            <div class="bg-gray-100 p-4 rounded-lg">
                                <h3 class="text-lg font-semibold mb-2">${model.label}</h3>
                                <div class="space-y-2">
                                    <button routerLink="${model.route}" class="w-full bg-blue-600 text-white py-2 px-4 rounded">Browse</button>
                                    <button routerLink="${model.route}/create" class="w-full bg-green-600 text-white py-2 px-4 rounded">Create New</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                return fallbackDiv;
            }
        }
    };

    // Make available globally
    if (typeof window !== 'undefined') {
        window.CurriculumHomeTemplate = CurriculumHomeTemplate;
    }
}
