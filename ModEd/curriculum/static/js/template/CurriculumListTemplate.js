if (typeof window !== 'undefined' && !window.ListTemplate) {
    class ListTemplate {

        // List Type Configurations
        static LIST_CONFIGS = {
            ClassMaterialList: {
                title: 'Class Material List',
                subtitle: 'Manage and organize your class materials and learning resources',
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                gradientFrom: 'rose-600',
                gradientTo: 'pink-700',
                createLink: 'curriculum/classmaterial/create',
                createText: 'Add New Material',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu',
                tableId: 'classmaterial-table',
                searchId: 'classmaterial-search'
            },
            CurriculumList: {
                title: 'Curriculum List',
                subtitle: 'Manage your curriculum programs and educational structures',
                icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
                gradientFrom: 'emerald-600',
                gradientTo: 'teal-700',
                createLink: 'curriculum/curriculum/create',
                createText: 'Add New Curriculum',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu',
                tableId: 'curriculum-table',
                searchId: 'curriculum-search'
            },
            CourseList: {
                title: 'Course List',
                subtitle: 'Manage courses and educational content for your programs',
                icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                gradientFrom: 'amber-600',
                gradientTo: 'orange-700',
                createLink: 'curriculum/course/create',
                createText: 'Add New Course',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu',
                tableId: 'course-table',
                searchId: 'course-search'
            },
            ClassList: {
                title: 'Class List',
                subtitle: 'Manage class sessions and course schedules',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                gradientFrom: 'purple-600',
                gradientTo: 'indigo-700',
                createLink: 'curriculum/class/create',
                createText: 'Add New Class',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu',
                tableId: 'class-table',
                searchId: 'class-search'
            },
            CoursePlanList: {
                title: 'Course Plan List',
                subtitle: 'Manage course plans and schedules',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                gradientFrom: 'cyan-600',
                gradientTo: 'blue-700',
                createLink: 'curriculum/courseplan/create',
                createText: 'Add New Course Plan',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu',
                tableId: 'courseplan-table',
                searchId: 'courseplan-search'
            }
        };

        /**
         * สร้างรายการตาม type ที่กำหนด
         * @param {string} listType - ประเภทของรายการ (ใช้ค่าจาก LIST_CONFIGS)
         * @returns {Promise<HTMLElement>} - รายการ HTML ที่สร้างขึ้น
         */
        static async getList(listType) {
            const config = this.LIST_CONFIGS[listType];
            if (!config) {
                throw new Error(`List type "${listType}" is not supported`);
            }

            return await this.generateTemplate(config);
        }

        /**
         * โหลดและสร้าง Template จากไฟล์ .tpl
         * @param {Object} config - การกำหนดค่า
         */
        static async generateTemplate(config) {
            const {
                title,
                subtitle,
                icon,
                gradientFrom,
                gradientTo,
                createLink,
                createText,
                backLink,
                backText,
                tableId,
                searchId
            } = config;

            try {
                // โหลด template จากไฟล์
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumListTemplate.tpl`);
                const templateContent = await response.text();

                // เตรียมข้อมูลสำหรับ Mustache
                const templateData = {
                    title,
                    subtitle,
                    icon,
                    gradientFrom,
                    gradientTo,
                    gradientFromDark: gradientFrom.replace('-600', '-800'),
                    gradientToDark: gradientTo.replace('-700', '-900'),
                    gradientFromLight: gradientFrom.replace('-600', '-500'),
                    gradientToLight: gradientTo.replace('-700', '-600'),
                    gradientFromHover: gradientFrom.replace('-600', '-700'),
                    gradientToHover: gradientTo.replace('-700', '-800'),
                    createLink,
                    createText,
                    backLink,
                    backText,
                    tableId,
                    searchId,
                };

                // Render template ด้วย Mustache
                const renderedHTML = Mustache.render(templateContent, templateData);

                // สร้าง DOM element จาก HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderedHTML.trim();

                return tempDiv.firstChild;

            } catch (error) {
                console.error('Error loading list template:', error);
            }
        }
    }

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ListTemplate = ListTemplate;
    }
}
