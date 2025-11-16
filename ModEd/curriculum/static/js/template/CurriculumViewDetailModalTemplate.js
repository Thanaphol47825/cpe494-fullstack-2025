if (typeof window !== 'undefined' && !window.ViewDetailModalTemplate) {
    /**
     * Shared field configurations (reusable across models)
     */
    const FIELD_CONFIGS = {
        ClassMaterial: [
            { name: 'ID', label: 'No', type: 'number' },
            { name: 'FileName', label: 'File Name', type: 'text' },
            { name: 'FilePath', label: 'File Path', type: 'text' },
        ],
        CoursePlan: [
            { name: 'ID', label: 'No', type: 'number' },
            { name: 'Week', label: 'Week', type: 'number' },
            { name: 'Date', label: 'Schedule', type: 'datetime' },
            { name: 'Topic', label: 'Topic', type: 'text' },
            { name: 'Description', label: 'Description', type: 'text' },
        ],
        Class: [
            { name: 'ID', label: 'No', type: 'number' },
            { name: 'Section', label: 'Section', type: 'text' },
            { name: 'Schedule', label: 'Schedule', type: 'datetime' },
        ],
        Course: [
            { name: 'ID', label: 'No', type: 'number' },
            { name: 'Name', label: 'Name', type: 'text' },
            { name: 'Description', label: 'Description', type: 'text' },
            { name: 'Optional', label: 'Optional', type: 'boolean' },
            { name: 'CourseStatus', label: 'Course Status', type: 'courseStatus' },
        ],
        Curriculum: [
            { name: 'ID', label: 'No', type: 'number' },
            { name: 'Name', label: 'Name', type: 'text' },
            { name: 'StartYear', label: 'Start Year', type: 'text' },
            { name: 'EndYear', label: 'End Year', type: 'text' },
            { name: 'Department.name', label: 'Department', type: 'text' },
            { name: 'ProgramType', label: 'Program Type', type: 'programType' },
        ]
    };

    /**
     * Shared nested object configurations
     */
    const NESTED_OBJECT_CONFIGS = {
        Class: {
            name: 'Class',
            label: 'Class Information',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            gradient: 'from-purple-500 to-indigo-600',
            fields: FIELD_CONFIGS.Class
        },
        Course: {
            name: 'Course',
            label: 'Course Information',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            gradient: 'from-amber-500 to-orange-600',
            fields: FIELD_CONFIGS.Course
        },
        Curriculum: {
            name: 'Curriculum',
            label: 'Curriculum Information',
            icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
            gradient: 'from-emerald-500 to-teal-600',
            fields: FIELD_CONFIGS.Curriculum
        }
    };

    class ViewDetailModalTemplate {
        
        /**
         * Modal type configurations
         */
        static MODAL_CONFIGS = {
            'ClassMaterial': {
                title: 'Class Material Details',
                subtitle: 'View detailed information about this class material',
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                gradientFrom: 'from-rose-600',
                gradientTo: 'to-pink-700',
                gradientFromHover: 'from-rose-700',
                gradientToHover: 'to-pink-800',
                fields: FIELD_CONFIGS.ClassMaterial,
                nestedObjects: [
                    {
                        ...NESTED_OBJECT_CONFIGS.Class,
                        nestedObjects: [
                            {
                                ...NESTED_OBJECT_CONFIGS.Course,
                                nestedObjects: [NESTED_OBJECT_CONFIGS.Curriculum]
                            }
                        ]
                    }
                ]
            },
            'CoursePlan': {
                title: 'Course Plan Details',
                subtitle: 'View detailed information about this course plan',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                gradientFrom: 'from-cyan-600',
                gradientTo: 'to-blue-700',
                gradientFromHover: 'from-cyan-700',
                gradientToHover: 'to-blue-800',
                fields: FIELD_CONFIGS.CoursePlan,
                nestedObjects: [
                    {
                        ...NESTED_OBJECT_CONFIGS.Course,
                        nestedObjects: []
                    }
                ]
            },
            'Course': {
                title: 'Course Details',
                subtitle: 'View detailed information about this course',
                icon: NESTED_OBJECT_CONFIGS.Course.icon,
                gradientFrom: 'from-amber-500',
                gradientTo: 'to-orange-600',
                gradientFromHover: 'from-amber-600',
                gradientToHover: 'to-orange-700',
                fields: FIELD_CONFIGS.Course,
                nestedObjects: [NESTED_OBJECT_CONFIGS.Curriculum]
            },
            'Class': {
                title: 'Class Details',
                subtitle: 'View detailed information about this class',
                icon: NESTED_OBJECT_CONFIGS.Class.icon,
                gradientFrom: 'from-purple-500',
                gradientTo: 'to-indigo-600',
                gradientFromHover: 'from-purple-600',
                gradientToHover: 'to-indigo-700',
                fields: FIELD_CONFIGS.Class,
                nestedObjects: [
                    {
                        ...NESTED_OBJECT_CONFIGS.Course,
                        nestedObjects: [NESTED_OBJECT_CONFIGS.Curriculum]
                    }
                ]
            },
            'Curriculum': {
                title: 'Curriculum Details',
                subtitle: 'View detailed information about this curriculum',
                icon: NESTED_OBJECT_CONFIGS.Curriculum.icon,
                gradientFrom: 'from-emerald-500',
                gradientTo: 'to-teal-600',
                gradientFromHover: 'from-emerald-600',
                gradientToHover: 'to-teal-700',
                fields: FIELD_CONFIGS.Curriculum,
                nestedObjects: []
            }
        };

        /**
         * สร้าง view detail modal
         * @param {Object} options - การกำหนดค่า
         * @param {string} options.modalType - ประเภทของ modal
         * @param {string} options.modalId - ID เฉพาะของ modal
         * @param {Object} options.data - ข้อมูลที่จะแสดง
         * @returns {Promise<Object>} - { modal: HTMLElement, config: Object }
         */
        static async createModal(options) {
            const {
                modalType,
                modalId,
                data
            } = options;

            // Get configuration
            const config = this.MODAL_CONFIGS[modalType];
            if (!config) {
                throw new Error(`Modal type "${modalType}" is not supported`);
            }

            try {
                // โหลด template จากไฟล์
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumViewDetailModalTemplate.tpl`);
                const templateContent = await response.text();

                // เตรียมข้อมูลสำหรับ Mustache
                const templateData = {
                    modalId,
                    title: config.title,
                    subtitle: config.subtitle,
                    icon: config.icon,
                    gradientFrom: config.gradientFrom,
                    gradientTo: config.gradientTo,
                    gradientFromHover: config.gradientFromHover,
                    gradientToHover: config.gradientToHover
                };

                // Render template ด้วย Mustache
                const renderedHTML = Mustache.render(templateContent, templateData);

                // สร้าง DOM element จาก HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderedHTML.trim();
                const modal = tempDiv.firstChild;

                // เพิ่ม modal เข้า body
                document.body.appendChild(modal);

                // Render content
                await this.renderContent(modalId, config, data);

                // Show modal with animation
                this.showModal(modalId);

                return { modal, config };

            } catch (error) {
                console.error('Error creating view detail modal:', error);
                throw error;
            }
        }

        /**
         * Render content ภายใน modal
         */
        static async renderContent(modalId, config, data) {
            const contentContainer = document.getElementById(`view-detail-content-${modalId}`);
            if (!contentContainer) return;

            contentContainer.innerHTML = '';

            // Collect all sections in order (main first, then nested)
            const sections = [];
            
            // Add main section first
            const mainSection = this.createSection(
                'Main Information', 
                config.fields, 
                data, 
                config.gradientFrom + ' ' + config.gradientTo
            );
            sections.push(mainSection);
            
            // Collect nested sections (shallow to deep: Class → Course → Curriculum)
            if (config.nestedObjects && config.nestedObjects.length > 0) {
                this.collectNestedSections(sections, config.nestedObjects, data);
            }

            // Reverse the array to show deepest nested object first (Curriculum → Course → Class → Main)
            sections.reverse();

            // Append all sections to container
            sections.forEach(section => {
                contentContainer.appendChild(section);
            });
        }

        /**
         * Collect nested sections แบบ recursive (shallow to deep)
         */
        static collectNestedSections(sections, nestedConfigs, data) {
            for (const nestedConfig of nestedConfigs) {
                const nestedData = data[nestedConfig.name];
                
                if (nestedData && typeof nestedData === 'object') {
                    // Add this section first (shallow)
                    const section = this.createSection(
                        nestedConfig.label,
                        nestedConfig.fields,
                        nestedData,
                        nestedConfig.gradient,
                        nestedConfig.icon
                    );
                    sections.push(section);

                    // Then recursively collect deeper nested objects
                    if (nestedConfig.nestedObjects && nestedConfig.nestedObjects.length > 0) {
                        this.collectNestedSections(sections, nestedConfig.nestedObjects, nestedData);
                    }
                }
            }
        }

        /**
         * สร้าง SVG icon element
         */
        static createSVGIcon(iconPath) {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'w-5 h-5 text-white');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('viewBox', '0 0 24 24');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('d', iconPath);
            
            svg.appendChild(path);
            return svg;
        }

        /**
         * สร้าง section header
         */
        static createSectionHeader(title, gradient, icon = null) {
            const header = document.createElement('div');
            header.className = `bg-gradient-to-r ${gradient} px-6 py-4`;
            
            const headerContent = document.createElement('div');
            headerContent.className = 'flex items-center gap-3';
            
            // Add icon if provided
            if (icon) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center';
                iconContainer.appendChild(this.createSVGIcon(icon));
                headerContent.appendChild(iconContainer);
            }
            
            // Create title
            const headerTitle = document.createElement('h4');
            headerTitle.className = 'text-lg font-bold text-white';
            headerTitle.textContent = title;
            
            headerContent.appendChild(headerTitle);
            header.appendChild(headerContent);
            
            return header;
        }

        /**
         * สร้าง field row (label + value)
         */
        static createFieldRow(label, value, fieldType) {
            const formattedValue = this.formatValue(value, fieldType);
            
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'flex flex-col sm:flex-row sm:items-center border-b border-gray-100 pb-3';
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'font-semibold text-gray-700 sm:w-1/3 mb-1 sm:mb-0';
            labelDiv.textContent = label + ':';
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'text-gray-900 sm:w-2/3';
            
            // Check if formattedValue is a DOM element
            if (formattedValue instanceof HTMLElement) {
                valueDiv.appendChild(formattedValue);
            } else {
                valueDiv.textContent = formattedValue;
            }
            
            fieldDiv.appendChild(labelDiv);
            fieldDiv.appendChild(valueDiv);
            
            return fieldDiv;
        }

        /**
         * สร้าง section (ใช้ได้ทั้ง main และ nested sections)
         */
        static createSection(title, fields, data, gradient, icon = null) {
            const section = document.createElement('div');
            section.className = 'bg-white rounded-2xl shadow-md border-2 border-opacity-50 overflow-hidden';

            // Create and append header
            section.appendChild(this.createSectionHeader(title, gradient, icon));

            // Create content
            const content = document.createElement('div');
            content.className = 'p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white';

            // Add all fields
            for (const field of fields) {
                const value = this.getNestedValue(data, field.name);
                content.appendChild(this.createFieldRow(field.label, value, field.type));
            }

            section.appendChild(content);
            return section;
        }

        /**
         * Get nested value from object using dot notation (e.g., 'Department.name')
         */
        static getNestedValue(obj, path) {
            if (!path.includes('.')) {
                return obj[path];
            }
            
            const keys = path.split('.');
            let value = obj;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return null;
                }
            }
            
            return value;
        }

        /**
         * สร้าง badge element
         */
        static createBadge(text, colorClass) {
            const badge = document.createElement('span');
            badge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`;
            badge.textContent = text;
            return badge;
        }

        /**
         * Format value based on type
         */
        static formatValue(value, type) {
            if (value === null || value === undefined || value === '') {
                return this.createBadge('N/A', 'text-gray-400 italic bg-transparent px-0');
            }

            switch (type) {
                case 'date':
                    const date = new Date(value);
                    return date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                case 'datetime':
                    const datetime = new Date(value);
                    const dateStr = datetime.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const timeStr = datetime.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    return `${dateStr} ${timeStr}`;
                    
                case 'boolean':
                    return this.createBadge(
                        value ? 'Yes' : 'No',
                        value ? 'text-green-600 bg-transparent font-medium px-0' : 'text-red-600 bg-transparent font-medium px-0'
                    );
                    
                case 'courseStatus':
                    const statusMap = {
                        0: { text: 'Active', color: 'bg-green-100 text-green-800' },
                        1: { text: 'Inactive', color: 'bg-gray-100 text-gray-800' }
                    };
                    const status = statusMap[value] || { text: 'Unknown', color: 'text-gray-400 italic bg-transparent px-0' };
                    return this.createBadge(status.text, status.color);
                    
                case 'programType':
                    const programMap = {
                        0: { text: 'Regular', color: 'bg-blue-100 text-blue-800' },
                        1: { text: 'International', color: 'bg-purple-100 text-purple-800' }
                    };
                    const program = programMap[value] || { text: 'Unknown', color: 'text-gray-400 italic bg-transparent px-0' };
                    return this.createBadge(program.text, program.color);
                    
                case 'number':
                    return typeof value === 'number' ? value.toLocaleString() : value;
                    
                default:
                    return String(value);
            }
        }

        /**
         * Show modal
         */
        static showModal(modalId) {
            const modal = document.getElementById(`view-detail-modal-${modalId}`);
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.opacity = '1';
                }, 10);
            }
        }

        /**
         * Close modal
         */
        static closeModal(modalId) {
            const modal = document.getElementById(`view-detail-modal-${modalId}`);
            if (modal) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        }

        /**
         * Show loading state
         */
        static showLoading(modalId) {
            const loading = document.getElementById(`loading-${modalId}`);
            const content = document.getElementById(`view-detail-content-${modalId}`);
            if (loading && content) {
                loading.classList.remove('hidden');
                content.classList.add('hidden');
            }
        }

        /**
         * Hide loading state
         */
        static hideLoading(modalId) {
            const loading = document.getElementById(`loading-${modalId}`);
            const content = document.getElementById(`view-detail-content-${modalId}`);
            if (loading && content) {
                loading.classList.add('hidden');
                content.classList.remove('hidden');
            }
        }

        /**
         * Show error
         */
        static showError(modalId, message) {
            const errorDiv = document.getElementById(`error-message-${modalId}`);
            const errorText = document.getElementById(`error-text-${modalId}`);
            if (errorDiv && errorText) {
                errorText.textContent = message;
                errorDiv.classList.remove('hidden');
            }
        }
    }

    // Global function to close modal
    window.closeViewDetailModal = function(modalId) {
        ViewDetailModalTemplate.closeModal(modalId);
    };

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ViewDetailModalTemplate = ViewDetailModalTemplate;
    }
}
