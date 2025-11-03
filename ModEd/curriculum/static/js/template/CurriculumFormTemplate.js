if (typeof window !== 'undefined' && !window.FormTemplate) {
    class FormTemplate {
        
        // Form Type Configurations
        static FORM_CONFIGS = {
            ClassMaterialForm: {
                title: 'Class Material',
                subtitle: 'Add new learning materials and resources to enhance your class experience',
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                gradientFrom: 'rose-600',
                gradientTo: 'pink-700',
                formId: 'class-material-form',
                listLink: 'curriculum/classmaterial',
                listText: 'View All Class Materials',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            CourseForm: {
                title: 'Course',
                subtitle: 'Add new course to your curriculum program',
                icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                gradientFrom: 'amber-600',
                gradientTo: 'orange-700',
                formId: 'course-form',
                listLink: 'curriculum/course',
                listText: 'View All Courses',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            ClassForm: {
                title: 'Class',
                subtitle: 'Set up new class session for your course',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                gradientFrom: 'purple-600',
                gradientTo: 'indigo-700',
                formId: 'class-form',
                listLink: 'curriculum/class',
                listText: 'View All Classes',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            CurriculumForm: {
                title: 'Curriculum',
                subtitle: 'Create new curriculum structure for your educational program',
                icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
                gradientFrom: 'emerald-600',
                gradientTo: 'teal-700',
                formId: 'curriculum-form',
                listLink: 'curriculum/curriculum',
                listText: 'View All Curriculums',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            CoursePlanForm: {
                title: 'Course Plan',
                subtitle: 'Design comprehensive course planning and scheduling',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                gradientFrom: 'cyan-600',
                gradientTo: 'blue-700',
                formId: 'course-plan-form',
                listLink: 'curriculum/courseplan',
                listText: 'View All Course Plans',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            SkillForm: {
                title: 'Skill',
                subtitle: 'Create and define new skills for your curriculum',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                gradientFrom: 'yellow-600',
                gradientTo: 'orange-700',
                formId: 'skill-form',
                listLink: 'curriculum/skill',
                listText: 'View All Skills',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            },
            CourseSkillForm: {
                title: 'Course Skill',
                subtitle: 'Associate skills and competencies with courses',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                gradientFrom: 'indigo-600',
                gradientTo: 'purple-700',
                formId: 'courseskill-form',
                listLink: 'curriculum/courseskill',
                listText: 'View All Course Skills',
                backLink: 'curriculum',
                backText: 'Back to Curriculum Menu'
            }
        };

                /**
         * สร้างฟอร์มตาม type ที่กำหนด
         * @param {string} formType - ประเภทของฟอร์ม (ใช้ค่าจาก FORM_TYPES)
         * @param {string} mode - โหมดการใช้งาน ('create' หรือ 'edit')
         * @returns {Promise<HTMLElement>} - ฟอร์ม HTML ที่สร้างขึ้น
         */
        static async getForm(formType, mode = 'create') {
            const config = this.FORM_CONFIGS[formType];
            if (!config) {
                throw new Error(`Form type "${formType}" is not supported`);
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
                formId,
                listLink,
                listText,
                backLink,
                backText
            } = config;

            try {
                // โหลด template จากไฟล์
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumFormTemplate.tpl`);
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
                    formId,
                    listLink,
                    listText,
                    backLink,
                    backText
                };

                // Render template ด้วย Mustache
                const renderedHTML = Mustache.render(templateContent, templateData);

                // สร้าง DOM element จาก HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderedHTML.trim();
                
                return tempDiv.firstChild;

            } catch (error) {
                console.error('Error loading form template:', error);
            }
        }
    }

    // Make available globally
    if (typeof window !== 'undefined') {
        window.FormTemplate = FormTemplate;
    }
}
