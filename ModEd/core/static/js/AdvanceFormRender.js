class AdvanceFormRender {
    constructor(application, options = {}) {
        this.application = application;
        this.schema = options.schema || null;
        this.targetSelector = options.targetSelector || "#MainContainer";
        this.modelPath = options.modelPath || null;
        this.submitHandler = options.submitHandler || this.defaultSubmitHandler.bind(this);
        this.validationRules = this.initValidationRules();
        this.form = null;
        this.isLoading = false;

        // Configuration
        this.config = {
            autoFocus: options.autoFocus !== false, // Default true
            showErrors: options.showErrors !== false, // Default true
            validateOnBlur: options.validateOnBlur !== false, // Default true
            submitUrl: options.submitUrl || null,
            method: options.method || "POST",
            ...options.config
        };
    }

    /**
     * Initialize validation rules with regex patterns
     */
    initValidationRules() {
        return {
            email: {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address"
            },
            tel: {
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: "Please enter a valid phone number"
            },
            url: {
                pattern: /^https?:\/\/.+\..+/,
                message: "Please enter a valid URL"
            },
            password: {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                message: "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
            },
            number: {
                pattern: /^-?\d*\.?\d+$/,
                message: "Please enter a valid number"
            },
            required: {
                pattern: /.+/,
                message: "This field is required"
            }
        };
    }

    /**
     * Load schema from API endpoint
     */
    async loadSchema(modelPath = null) {
        if (!modelPath && !this.modelPath) {
            throw new Error("Model path is required to load schema");
        }

        const path = modelPath || this.modelPath;
        this.isLoading = true;

        try {
            // Try enhanced endpoint first, fallback to legacy
            let response = await fetch(`${RootURL}/api/modelmeta/${path}`);

            if (!response.ok) {
                // Fallback to legacy endpoint
                throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
            }

            this.schema = await response.json();
            return this.schema;

        } catch (error) {
            console.error("Error loading schema:", error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render the complete form
     */
    async render() {
        try {
            // Load schema if not provided
            if (!this.schema) {
                await this.loadSchema();
            }

            if (!this.schema || !Array.isArray(this.schema)) {
                throw new Error("Invalid schema format");
            }

            // Create main form container
            await this.createForm();

            // Render form fields
            this.renderFields();

            // Setup form events
            this.setupFormEvents();

            // Mount to DOM
            this.mountForm();

            // Focus first field if enabled
            if (this.config.autoFocus) {
                this.focusFirstField();
            }

            console.log("✅ FormRenderV2 rendered successfully");
            return this.form;

        } catch (error) {
            console.error("Error rendering form:", error);
            this.renderError(error.message);
            throw error;
        }
    }

    /**
     * Create the main form structure using templates
     */
    async createForm() {
        if (!this.application.template) {
            await this.application.fetchTemplate();
        }

        const formAction = this.config.submitUrl || `${RootURL}/handle`;

        this.form = new DOMObject(this.application.template.Form, {
            action: formAction,
            method: this.config.method
        }, false);
    }

    /**
     * Render individual form fields based on schema
     */
    renderFields() {
        for (const fieldSchema of this.schema) {
            // Skip hidden or excluded fields
            if (fieldSchema.type === 'hidden' || fieldSchema.type === '-') {
                continue;
            }

            try {
                const fieldElement = this.createField(fieldSchema);
                if (fieldElement) {
                    this.form.dom.inputContainer.append(fieldElement);
                }
            } catch (error) {
                console.error(`Error creating field ${fieldSchema.name}:`, error);
            }
        }
    }

    /**
     * Create individual form field based on type
     */
    createField(fieldSchema) {
        const fieldType = fieldSchema.type || 'text';

        switch (fieldType) {
            case 'select':
                return this.createSelectField(fieldSchema);
            case 'textarea':
                return this.createTextareaField(fieldSchema);
            case 'checkbox':
                return this.createCheckboxField(fieldSchema);
            case 'radio':
                return this.createRadioField(fieldSchema);
            case 'date':
            case 'datetime-local':
            case 'time':
                return this.createDateField(fieldSchema);
            case 'email':
            case 'tel':
            case 'url':
            case 'password':
            case 'number':
            case 'text':
                console.log("Creating input field:", fieldSchema);
                return this.createInputField(fieldSchema);
            default:
                return this.createInputField(fieldSchema);
        }
    }

    /**
     * Create input field (text, email, number, etc.)
     */
    createInputField(fieldSchema) {
        const { name, label, type = 'text', placeholder = '', required } = fieldSchema;
        const field = new DOMObject(this.application.template.TextInput, {
            id: name,
            name,
            label: label || name,
            type,
            placeholder,
            required
        }, false);

        return field;
    }

    /**
     * Create select field with options
     */
    createSelectField(fieldSchema) {
        const { name, label, required } = fieldSchema;
        const options = this.transformSelectData(fieldSchema);

        const field = new DOMObject(this.application.template.SelectInput, {
            Id: name,
            Name: name,
            Label: label || name,
            Required: required,
            options
        }, false);


        return field;
    }

    /**
     * Create textarea field
     */
    createTextareaField(fieldSchema) {
        const { name, label, placeholder = '', rows = 4, required } = fieldSchema;
        const field = new DOMObject(this.application.template.TextareaInput, {
            id: name,
            name,
            label: label || name,
            placeholder,
            rows,
            required
        }, false);


        return field;
    }

    /**
     * Create checkbox field
     */
    createCheckboxField(fieldSchema) {
        const { name, label, required } = fieldSchema;
        return new DOMObject(this.application.template.CheckboxInput, {
            id: name,
            name,
            label: label || name,
            required
        }, false);
    }

    /**
     * Create radio field group
     */
    createRadioField(fieldSchema) {
        const { name, label, required } = fieldSchema;
        const options = this.transformSelectData(fieldSchema);

        return new DOMObject(this.application.template.RadioInput, {
            name,
            label: label || name,
            options,
            required
        }, false);
    }

    /**
     * Create date field (date, datetime-local, time)
     */
    createDateField(fieldSchema) {
        const { name, label, type = 'date', required } = fieldSchema;
        const field = new DOMObject(this.application.template.DatetimeInput, {
            id: name,
            name,
            label: label || name,
            type,
            required
        }, false);

        return field;
    }

    /**
     * Transform select data from different formats
     */
    transformSelectData(fieldSchema) {
        let options = [];

        if (fieldSchema.data && Array.isArray(fieldSchema.data)) {
            // Enhanced format: [{label: "...", value: "..."}]
            options = fieldSchema.data;
        } else if (fieldSchema.option_list && Array.isArray(fieldSchema.option_list)) {
            // Legacy format: [{label: "...", value: "..."}]
            options = fieldSchema.option_list;
        } else if (fieldSchema.options && Array.isArray(fieldSchema.options)) {
            // Direct options format
            options = fieldSchema.options;
        }

        return options;
    }

    /**
     * Validate a single field
     */
    validateField(element, fieldSchema) {
        const value = element.value.trim();
        const errors = [];

        // Required validation
        if (fieldSchema.required && !value) {
            errors.push(this.validationRules.required.message);
        }

        // Type-specific validation
        if (value && fieldSchema.type && this.validationRules[fieldSchema.type]) {
            const rule = this.validationRules[fieldSchema.type];
            if (!rule.pattern.test(value)) {
                errors.push(rule.message);
            }
        }

        // Custom pattern validation
        if (value && fieldSchema.pattern) {
            const pattern = new RegExp(fieldSchema.pattern);
            if (!pattern.test(value)) {
                errors.push(fieldSchema.patternMessage || "Invalid format");
            }
        }

        // Show/hide errors
        if (errors.length > 0) {
            this.showFieldError(element, errors[0]);
            return false;
        } else {
            this.clearFieldError(element);
            return true;
        }
    }

    /**
     * Show field error
     */
    showFieldError(element, message) {
        if (!this.config.showErrors) return;

        element.classList.add('error');

        // Remove existing error message
        this.clearFieldError(element, false);

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(element, removeClass = true) {
        if (removeClass) {
            element.classList.remove('error');
        }

        const errorDiv = element.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Setup form events (submit, etc.)
     */
    setupFormEvents() {
        this.form.html.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (this.isLoading) return;

            try {
                await this.handleSubmit(e);
            } catch (error) {
                console.error('Submit error:', error);
                this.showFormError(error.message);
            }
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        // Validate all fields
        const isValid = this.validateForm();

        if (!isValid) {
            this.showFormError("Please fix the errors above");
            return;
        }

        // Get form data
        const formData = this.getFormData();

        // Call submit handler
        await this.submitHandler(formData, event, this);
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;

        this.schema.forEach(fieldSchema => {
            if (fieldSchema.type === 'hidden' || fieldSchema.type === '-') return;

            const element = this.form.html.querySelector(`[name="${fieldSchema.name}"]`);
            if (element) {
                const fieldValid = this.validateField(element, fieldSchema);
                if (!fieldValid) isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Get form data as object
     */
    getFormData() {
        const formData = {};
        const formElement = this.form.html;

        this.schema.forEach(fieldSchema => {
            const element = formElement.querySelector(`[name="${fieldSchema.name}"]`);
            if (!element) return;

            switch (fieldSchema.type) {
                case 'checkbox':
                    formData[fieldSchema.name] = element.checked;
                    break;
                case 'number':
                    formData[fieldSchema.name] = element.value ? parseFloat(element.value) : null;
                    break;
                case 'radio':
                    const checkedRadio = formElement.querySelector(`[name="${fieldSchema.name}"]:checked`);
                    formData[fieldSchema.name] = checkedRadio ? checkedRadio.value : null;
                    break;
                default:
                    formData[fieldSchema.name] = element.value;
            }
        });

        return formData;
    }

    /**
     * Default submit handler
     */
    async defaultSubmitHandler(formData, event, formInstance) {
        console.log("📤 Form submitted with data:", formData);

        if (this.config.submitUrl) {
            try {
                const response = await fetch(this.config.submitUrl, {
                    method: this.config.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    this.showFormSuccess("Form submitted successfully!");
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } catch (error) {
                this.showFormError(`Submit failed: ${error.message}`);
            }
        } else {
            this.showFormSuccess("Form validation passed! (No submit URL configured)");
        }
    }

    /**
     * Mount form to target container
     */
    mountForm() {
        const container = document.querySelector(this.targetSelector);
        if (container) {
            container.innerHTML = ''; // Clear existing content
            container.appendChild(this.form.html);
        } else {
            console.warn(`Container '${this.targetSelector}' not found`);
        }
    }

    /**
     * Focus first field
     */
    focusFirstField() {
        const firstInput = this.form.html.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Show form-level error message
     */
    showFormError(message) {
        this.clearFormMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        this.form.html.prepend(errorDiv);
    }

    /**
     * Show form-level success message
     */
    showFormSuccess(message) {
        this.clearFormMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.textContent = message;
        this.form.html.prepend(successDiv);
    }

    /**
     * Clear form messages
     */
    clearFormMessages() {
        const messages = this.form.html.querySelectorAll('.form-error, .form-success');
        messages.forEach(msg => msg.remove());
    }

    /**
     * Render error state
     */
    renderError(message) {
        const container = document.querySelector(this.targetSelector);
        if (container) {
            container.innerHTML = `
                <div class="form-error">
                    <h3>Form Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Reset form to initial state
     */
    reset() {
        if (this.form && this.form.html) {
            this.form.html.reset();
            this.clearFormMessages();

            // Clear all field errors
            const errorElements = this.form.html.querySelectorAll('.error, .field-error');
            errorElements.forEach(el => {
                if (el.classList.contains('field-error')) {
                    el.remove();
                } else {
                    el.classList.remove('error');
                }
            });
        }
    }

    /**
     * Destroy form and cleanup
     */
    destroy() {
        if (this.form && this.form.html && this.form.html.parentNode) {
            this.form.html.parentNode.removeChild(this.form.html);
        }
        this.form = null;
        this.schema = null;
    }

    /**
     * Update form with new data
     */
    setData(data) {
        if (!this.form || !data) return;

        Object.keys(data).forEach(key => {
            const element = this.form.html.querySelector(`[name="${key}"]`);
            if (!element) return;

            switch (element.type) {
                case 'checkbox':
                    element.checked = !!data[key];
                    break;
                case 'radio':
                    const radioButton = this.form.html.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radioButton) radioButton.checked = true;
                    break;
                default:
                    element.value = data[key] || '';
            }
        });
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormRenderV2;
} else {
    window.FormRenderV2 = FormRenderV2;
}