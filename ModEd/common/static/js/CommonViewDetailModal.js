if (typeof window !== 'undefined' && !window.CommonViewDetailModal) {
  /**
   * Field configurations for each entity type
   */
  const FIELD_CONFIGS = {
    Student: [
      { name: 'ID', label: 'ID', type: 'number' },
      { name: 'student_code', label: 'Student Code', type: 'text' },
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' }
    ],
    Instructor: [
      { name: 'ID', label: 'ID', type: 'number' },
      { name: 'instructor_code', label: 'Instructor Code', type: 'text' },
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'specialization', label: 'Specialization', type: 'text' }
    ],
    Faculty: [
      { name: 'ID', label: 'ID', type: 'number' },
      { name: 'name', label: 'Faculty Name', type: 'text' },
      { name: 'code', label: 'Faculty Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' }
    ],
    Department: [
      { name: 'ID', label: 'ID', type: 'number' },
      { name: 'name', label: 'Department Name', type: 'text' },
      { name: 'code', label: 'Department Code', type: 'text' },
      { name: 'description', label: 'Description', type: 'text' }
    ]
  };

  /**
   * Modal configurations for each entity type
   */
  const MODAL_CONFIGS = {
    Student: {
      title: 'Student Details',
      fields: FIELD_CONFIGS.Student
    },
    Instructor: {
      title: 'Instructor Details',
      fields: FIELD_CONFIGS.Instructor
    },
    Faculty: {
      title: 'Faculty Details',
      fields: FIELD_CONFIGS.Faculty
    },
    Department: {
      title: 'Department Details',
      fields: FIELD_CONFIGS.Department
    }
  };

  class CommonViewDetailModal {
    /**
     * Create and show modal
     * @param {Object} options - Modal options
     * @param {string} options.modalType - Type of modal (Student, Instructor, Faculty, Department)
     * @param {string} options.modalId - Unique modal ID
     * @param {Object} options.data - Data to display
     * @returns {Promise<Object>}
     */
    static async createModal(options) {
      const { modalType, modalId, data } = options;

      // Get configuration
      const config = MODAL_CONFIGS[modalType];
      if (!config) {
        throw new Error(`Modal type "${modalType}" is not supported`);
      }

      try {
        // Load template from server
        const response = await fetch(`${RootURL}/common/static/view/CommonViewDetailModal.tpl`);
        const templateContent = await response.text();

        // Prepare data for Mustache
        const templateData = {
          modalId,
          title: config.title
        };

        // Render template with Mustache
        const renderedHTML = Mustache.render(templateContent, templateData);

        // Create DOM element from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderedHTML.trim();
        const modal = tempDiv.firstChild;

        // Add modal to body
        document.body.appendChild(modal);

        // Render content
        await this.renderContent(modalId, config, data);

        // Add click outside to close
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal(modalId);
          }
        });

        return { modal, config };
      } catch (error) {
        console.error('Error creating modal:', error);
        this.showError(modalId, error.message);
        throw error;
      }
    }

    /**
     * Render modal content
     */
    static async renderContent(modalId, config, data) {
      const contentDiv = document.getElementById(`view-detail-content-${modalId}`);
      if (!contentDiv) return;

      const loadingDiv = document.getElementById(`loading-${modalId}`);
      const errorDiv = document.getElementById(`error-message-${modalId}`);

      // Show loading
      if (loadingDiv) loadingDiv.classList.remove('hidden');
      if (errorDiv) errorDiv.classList.add('hidden');

      try {
        // Build fields HTML
        let fieldsHTML = '<div class="form-container" style="max-width: 100%; box-shadow: none; padding: 0;">';

        config.fields.forEach(field => {
          const value = this.getFieldValue(data, field.name);
          const displayValue = this.formatValue(value, field.type);

          fieldsHTML += `
            <div class="form-field" style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">${field.label}</label>
              <div style="padding: 0.5rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; color: #1f2937;">
                ${displayValue}
              </div>
            </div>
          `;
        });

        fieldsHTML += '</div>';

        contentDiv.innerHTML = fieldsHTML;

        // Hide loading
        if (loadingDiv) loadingDiv.classList.add('hidden');
      } catch (error) {
        console.error('Error rendering content:', error);
        this.showError(modalId, 'Failed to render content');
        if (loadingDiv) loadingDiv.classList.add('hidden');
      }
    }

    /**
     * Get field value from data object (supports nested properties)
     */
    static getFieldValue(data, fieldName) {
      if (!data) return null;

      // Support nested properties like "Department.name"
      const keys = fieldName.split('.');
      let value = data;

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
     * Format value based on type
     */
    static formatValue(value, type) {
      if (value === null || value === undefined || value === '') {
        return '<span style="color: #9ca3af;">-</span>';
      }

      switch (type) {
        case 'boolean':
          return value ? '✓ Yes' : '✗ No';
        case 'datetime':
          return new Date(value).toLocaleString();
        case 'date':
          return new Date(value).toLocaleDateString();
        default:
          return String(value);
      }
    }

    /**
     * Show error message
     */
    static showError(modalId, message) {
      const errorDiv = document.getElementById(`error-message-${modalId}`);
      const errorText = document.getElementById(`error-text-${modalId}`);

      if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
      }
    }

    /**
     * Close modal
     */
    static closeModal(modalId) {
      const modal = document.getElementById(`view-detail-modal-${modalId}`);
      if (modal) {
        modal.remove();
      }
    }
  }

  // Global function to close modal (called from template)
  window.closeCommonViewModal = function(modalId) {
    CommonViewDetailModal.closeModal(modalId);
  };

  // Export to window
  window.CommonViewDetailModal = CommonViewDetailModal;
}
