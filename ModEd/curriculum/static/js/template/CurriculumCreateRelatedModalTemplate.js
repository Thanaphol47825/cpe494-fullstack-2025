if (typeof window !== 'undefined' && !window.CreateRelatedModalTemplate) {
    class CreateRelatedModalTemplate {

        /**
         * Modal type configurations
         */
        static MODAL_CONFIGS = {
            'CourseSkill': {
                title: 'Create Related Course Skill',
                subtitle: 'Create course skill mapping',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                gradientFrom: 'from-indigo-500',
                gradientTo: 'to-purple-600',
                submitText: 'Create Course Skill'
            }
        };

        /**
         * สร้าง Create Related modal template
         * @param {Object} options - การกำหนดค่า
         * @param {string} options.modalType - ประเภทของ modal (ใช้ค่าจาก MODAL_CONFIGS)
         * @param {string} options.modalId - ID เฉพาะของ modal
         * @param {Object} options.customConfig - การกำหนดค่าเพิ่มเติม (optional)
         * @returns {Promise<HTMLElement>} - Modal element ที่สร้างขึ้น
         */
        static async getModal(options) {
            const {
                modalType,
                modalId,
                customConfig = {}
            } = options;

            // Get base configuration
            const baseConfig = this.MODAL_CONFIGS[modalType];
            if (!baseConfig) {
                throw new Error(`Modal type "${modalType}" is not supported`);
            }

            // Merge with custom config
            const config = { ...baseConfig, ...customConfig };

            try {
                // โหลด template จากไฟล์
                const response = await fetch(`${RootURL}/curriculum/static/view/CurriculumCreateRelatedModalTemplate.tpl`);
                const templateContent = await response.text();

                // เตรียมข้อมูลสำหรับ Mustache
                const templateData = {
                    modalId,
                    title: config.title,
                    subtitle: config.subtitle,
                    icon: config.icon,
                    gradientFrom: config.gradientFrom,
                    gradientTo: config.gradientTo,
                    submitText: config.submitText
                };

                // Render template ด้วย Mustache
                const renderedHTML = Mustache.render(templateContent, templateData);

                // สร้าง DOM element จาก HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderedHTML.trim();

                return tempDiv.firstChild;

            } catch (error) {
                console.error('Error loading create related modal template:', error);

                // Fallback: สร้าง simple modal
                const fallbackDiv = document.createElement('div');
                fallbackDiv.id = `create-related-modal-${modalId}`;
                fallbackDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                fallbackDiv.innerHTML = `
                    <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900">${config.title}</h3>
                            <button onclick="closeCreateRelatedModal('${modalId}')" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form id="create-related-form-${modalId}" class="space-y-4">
                            <div id="create-related-form-fields-${modalId}"></div>
                            <div id="loading-${modalId}" class="hidden text-center py-4">Loading...</div>
                            <div id="error-message-${modalId}" class="hidden bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded"></div>
                            <div id="success-message-${modalId}" class="hidden bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded"></div>
                            
                            <div class="flex justify-end pt-4">
                                <button type="button" onclick="closeCreateRelatedModal('${modalId}')" class="bg-gray-300 text-gray-700 py-2 px-4 rounded font-medium">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                `;

                return fallbackDiv;
            }
        }

        /**
         * Show loading state
         * @param {string} modalId - ID ของ modal
         */
        static showLoading(modalId) {
            const loading = document.getElementById(`loading-${modalId}`);
            const fields = document.getElementById(`create-related-form-fields-${modalId}`);
            if (loading && fields) {
                loading.classList.remove('hidden');
                fields.style.opacity = '0.5';
                fields.style.pointerEvents = 'none';
            }
        }

        /**
         * Hide loading state
         * @param {string} modalId - ID ของ modal
         */
        static hideLoading(modalId) {
            const loading = document.getElementById(`loading-${modalId}`);
            const fields = document.getElementById(`create-related-form-fields-${modalId}`);
            if (loading && fields) {
                loading.classList.add('hidden');
                fields.style.opacity = '1';
                fields.style.pointerEvents = 'auto';
            }
        }

        /**
         * Show error message
         * @param {string} modalId - ID ของ modal
         * @param {string} message - ข้อความ error
         */
        static showError(modalId, message) {
            const errorDiv = document.getElementById(`error-message-${modalId}`);
            const errorText = document.getElementById(`error-text-${modalId}`);
            const successDiv = document.getElementById(`success-message-${modalId}`);

            if (errorDiv && errorText) {
                errorText.textContent = message;
                errorDiv.classList.remove('hidden');
            }

            if (successDiv) {
                successDiv.classList.add('hidden');
            }
        }

        /**
         * Show success message
         * @param {string} modalId - ID ของ modal
         * @param {string} message - ข้อความ success
         */
        static showSuccess(modalId, message) {
            const successDiv = document.getElementById(`success-message-${modalId}`);
            const successText = document.getElementById(`success-text-${modalId}`);
            const errorDiv = document.getElementById(`error-message-${modalId}`);

            if (successDiv && successText) {
                successText.textContent = message;
                successDiv.classList.remove('hidden');
            }

            if (errorDiv) {
                errorDiv.classList.add('hidden');
            }
        }

        /**
         * Clear all messages
         * @param {string} modalId - ID ของ modal
         */
        static clearMessages(modalId) {
            const errorDiv = document.getElementById(`error-message-${modalId}`);
            const successDiv = document.getElementById(`success-message-${modalId}`);

            if (errorDiv) errorDiv.classList.add('hidden');
            if (successDiv) successDiv.classList.add('hidden');
        }

        /**
         * สร้าง AdvanceFormRender ใน modal
         * @param {Object} options - การกำหนดค่า
         * @param {string} options.modalId - ID ของ modal
         * @param {string} options.modalType - ประเภทของ modal
         * @param {Object} options.application - Application instance
         * @param {string} options.modelPath - Path สำหรับ schema
         * @param {Object} options.data - ข้อมูลเดิมสำหรับ pre-fill (optional)
         * @param {Function} options.submitHandler - Function สำหรับจัดการ submission
         * @returns {Promise<AdvanceFormRender>} - AdvanceFormRender instance
         */
        static async createAdvanceForm(options) {
            const {
                modalId,
                modalType,
                application,
                modelPath,
                data = {},
                submitHandler
            } = options;

            try {
                // Show loading
                this.showLoading(modalId);

                // Create AdvanceFormRender instance
                const form = new AdvanceFormRender(application.templateEngine, {
                    modelPath: modelPath,
                    targetSelector: `#create-related-form-fields-${modalId}`,
                    submitHandler: async (formData, event, formInstance) => {
                        try {
                            this.showLoading(modalId);
                            this.clearMessages(modalId);

                            // Call custom submit handler
                            if (submitHandler) {
                                await submitHandler(formData, event, formInstance);
                            }

                            this.showSuccess(modalId, 'Updated successfully!');

                            // Close modal after success
                            setTimeout(() => {
                                this.closeModal(modalId);
                            }, 1500);

                        } catch (error) {
                            console.error('Form submission error:', error);
                            this.showError(modalId, error.message || 'Error updating data');
                        } finally {
                            this.hideLoading(modalId);
                        }
                    }
                });

                // Render form
                await form.render();

                // Pre-fill with existing data if provided
                if (Object.keys(data).length > 0) {
                    form.setData(data);
                }

                this.hideLoading(modalId);
                return form;

            } catch (error) {
                console.error('Error creating advance form:', error);
                this.showError(modalId, 'Error loading form: ' + error.message);
                this.hideLoading(modalId);
                throw error;
            }
        }

        /**
         * Show modal
         * @param {string} modalId - ID ของ modal
         */
        static showModal(modalId) {
            const modal = document.getElementById(`create-related-modal-${modalId}`);
            console.log('Showing modal:', modalId, modal);
            if (modal) {
                modal.style.display = 'flex';
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                modal.style.transition = 'all 0.2s ease-out';

                // Add fade in animation
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modal.style.transform = 'scale(1)';
                }, 10);
            } else {
                console.error('Modal not found:', `create-related-modal-${modalId}`);
            }
        }

        /**
         * Close modal
         * @param {string} modalId - ID ของ modal
         */
        static closeModal(modalId) {
            const modal = document.getElementById(`create-related-modal-${modalId}`);
            if (modal) {
                // Add fade out animation
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    modal.remove();
                }, 200);
            }
        }

        /**
         * Get form fields container
         * @param {string} modalId - ID ของ modal
         * @returns {HTMLElement|null} - Form fields container
         */
        static getFormFieldsContainer(modalId) {
            return document.getElementById(`create-related-form-fields-${modalId}`);
        }

        /**
         * Get form element
         * @param {string} modalId - ID ของ modal
         * @returns {HTMLElement|null} - Form element
         */
        static getFormElement(modalId) {
            return document.getElementById(`create-related-form-${modalId}`);
        }

        /**
         * สร้าง modal พร้อม AdvanceFormRender ในขั้นตอนเดียว
         * @param {Object} options - การกำหนดค่า
         * @param {string} options.modalType - ประเภทของ modal
         * @param {string} options.modalId - ID เฉพาะของ modal
         * @param {Object} options.application - Application instance
         * @param {string} options.modelPath - Path สำหรับ schema
         * @param {Object} options.data - ข้อมูลเดิมสำหรับ pre-fill (optional)
         * @param {Function} options.submitHandler - Function สำหรับจัดการ submission
         * @param {Object} options.customConfig - การกำหนดค่าเพิ่มเติม (optional)
         * @returns {Promise<{modal: HTMLElement, form: AdvanceFormRender}>} - Modal และ Form instances
         */
        static async createModalWithForm(options) {
            const {
                modalType,
                modalId,
                application,
                modelPath,
                data = {},
                submitHandler,
                customConfig = {}
            } = options;

            try {
                // Create modal
                console.log('Creating modal:', modalType, modalId);
                const modal = await this.getModal({
                    modalType,
                    modalId,
                    customConfig
                });

                console.log('Modal created:', modal);

                // Add modal to DOM
                document.body.appendChild(modal);

                // Show modal immediately
                this.showModal(modalId);

                // Create AdvanceFormRender
                const form = await this.createAdvanceForm({
                    modalId,
                    modalType,
                    application,
                    modelPath,
                    data,
                    submitHandler
                });

                return { modal, form };

            } catch (error) {
                console.error('Error creating modal with form:', error);
                // Clean up if modal was added
                const existingModal = document.getElementById(`create-related-modal-${modalId}`);
                if (existingModal) {
                    existingModal.remove();
                }
                throw error;
            }
        }
    };

    // Make closeCreateRelatedModal globally available
    if (typeof window !== 'undefined') {
        window.CreateRelatedModalTemplate = CreateRelatedModalTemplate;
        window.closeCreateRelatedModal = (modalId) => {
            window.CreateRelatedModalTemplate.closeModal(modalId);
        };
    }
}
