// Student Edit Feature using Core Module's FormRender
if (typeof HrStudentEditFeature === 'undefined') {
class HrStudentEditFeature {
  constructor(templateEngine, rootURL, studentCode) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.studentCode = studentCode;
    this.api = new HrApiService(this.rootURL);
    this.studentData = null;
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";
    await this.#loadStudentData();
    return true;
  }

  async #loadStudentData() {
    try {
      this.#showLoading();
      this.studentData = await this.api.fetchStudent(this.studentCode);
      this.#hideLoading();
      await this.#createDynamicStudentEditForm();
    } catch (error) {
      console.error('Error loading student data:', error);
      this.#hideLoading();
      this.#showError('Failed to load student data: ' + error.message);
    }
  }

  async #createDynamicStudentEditForm() {
    try {
      // Fetch form metadata from API
      const response = await fetch('/api/modelmeta/hr/students');
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const meta = await response.json();
      
      if (!meta || !Array.isArray(meta)) {
        throw new Error('Invalid form metadata received');
      }

      // Transform metadata to FormRender schema
      const schema = meta.map(field => ({
        type: field.type || "text",
        name: field.name,
        label: field.label || field.name,
        required: ['student_code', 'first_name', 'last_name', 'email'].includes(field.name)
      }));

      // Wait for template to be loaded
      if (!this.templateEngine.template) {
        await this.templateEngine.fetchTemplate();
      }
      
      // Create application object for FormRender
      const application = {
        template: this.templateEngine.template
      };
      
      // Create page structure using Tailwind CSS
      const pageHTML = `
        <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Edit Student</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Update student record: ${this.studentData?.student_code || this.studentCode}</p>
            </div>

            <!-- Form Container -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Student Information
                </h2>
              </div>
              
              <div class="p-8">
                <div class="student-edit-form-container">
                  <!-- Dynamic form will be inserted here -->
                </div>
                
                <!-- Status Message -->
                <div class="text-center mt-6">
                  <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
                </div>
              </div>
            </div>

            <!-- Result Box -->
            <div id="resultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Form Submission Result
                </h3>
              </div>
              <div class="p-6">
                <div id="resultContent"></div>
              </div>
            </div>

            <!-- Back Button -->
            <div class="text-center mt-8">
              <a href="#hr/students" 
                 class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Students List
              </a>
            </div>
          </div>
        </div>
      `;

      const pageElement = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageElement);

      // Clear any existing forms first
      const existingForms = document.querySelectorAll('form');
      existingForms.forEach(form => {
        form.remove();
      });

      // Now create FormRender after container exists in DOM
      const formRender = new FormRender(application, schema, '.student-edit-form-container');
      const formElement = await formRender.render();

      // Remove any duplicate forms that might have been created
      const allForms = document.querySelectorAll('form');
      if (allForms.length > 1) {
        // Keep only the first form (the one we want)
        for (let i = 1; i < allForms.length; i++) {
          allForms[i].remove();
        }
      }

      // Final cleanup - remove any forms that are not in the student-edit-form-container
      const finalForms = document.querySelectorAll('form');
      finalForms.forEach(form => {
        if (!form.closest('.student-edit-form-container')) {
          form.remove();
        }
      });

      // Pre-populate form with existing data
      this.#populateForm();

      // Add custom buttons to the form
      this.#addCustomButtons();

      // Attach event handlers
      this.#attachFormHandlers();
      this.#attachResultHandlers();

    } catch (error) {
      console.error('Error creating dynamic edit form:', error);
      this.#showError('Failed to load form metadata: ' + error.message);
    }
  }

  #populateForm() {
    const form = document.querySelector('form');
    if (!form || !this.studentData) return;

    // Pre-populate form fields with existing data
    Object.keys(this.studentData).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = this.studentData[key];
        } else if (field.type === 'date') {
          // Convert date to YYYY-MM-DD format
          const date = new Date(this.studentData[key]);
          if (!isNaN(date.getTime())) {
            field.value = date.toISOString().split('T')[0];
          }
        } else {
          field.value = this.studentData[key] || '';
        }
      }
    });
  }

  #addCustomButtons() {
    const form = document.querySelector('form');
    if (!form) return;

    // Remove any existing submit buttons from FormRender
    const existingSubmitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    existingSubmitButtons.forEach(btn => btn.remove());

    // Create custom button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';
    
    // Create Update button
    const updateButton = document.createElement('button');
    updateButton.type = 'submit';
    updateButton.className = 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1';
    updateButton.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Update Student
    `;

    // Create Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg';
    cancelButton.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Cancel
    `;
    cancelButton.onclick = () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '#hr/students';
      }
    };

    // Add buttons to container
    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(cancelButton);

    // Add container to form
    form.appendChild(buttonContainer);
  }

  #attachFormHandlers() {
    // Form submit handler
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.#handleFormSubmit(form);
      });

      // Focus first field
      const firstField = form.querySelector('input[name="student_code"]');
      if (firstField) setTimeout(() => firstField.focus(), 100);
    }
  }

  async #handleFormSubmit(form) {
    try {
      this.#setStatus('Updating student...', 'loading');
      this.#hideResult();

      const payload = this.#collectFormData(form);
      if (!this.#validatePayload(payload)) return;

      const response = await fetch(`${this.rootURL}/hr/students/${this.studentCode}/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }

      this.#setStatus('Student updated successfully!', 'success');
      this.#showResult(result, false);
      
      setTimeout(() => {
        window.location.href = '#hr/students';
      }, 2000);

    } catch (error) {
      console.error('Form submission error:', error);
      this.#setStatus(`${error.message}`, 'error');
      this.#showResult({ error: error.message }, true);
    }
  }

  #collectFormData(form) {
    const formData = new FormData(form);
    const payload = {};
    for (const [key, value] of formData.entries()) {
      const trimmedValue = String(value).trim();
      if (trimmedValue !== '') {
        payload[key] = trimmedValue;
      }
    }
    return this.#transformPayload(payload);
  }

  #transformPayload(payload) {
    const transformed = { ...payload };
    
    // Transform date fields to proper format
    const dateFields = ['StartDate', 'start_date', 'BirthDate', 'birth_date'];
    dateFields.forEach(field => {
      if (transformed[field]) {
        // Convert YYYY-MM-DD to RFC3339 format
        const date = new Date(transformed[field]);
        if (!isNaN(date.getTime())) {
          transformed[field] = date.toISOString();
        }
      }
    });
    
    // Set empty fields to null
    ['department', 'Program', 'Status', 'Gender', 'AdvisorCode'].forEach(field => {
      if (!transformed[field]) transformed[field] = null;
    });
    
    return transformed;
  }

  #validatePayload(payload) {
    // Use HrValidator if available, fallback to local validation
    if (window.HrValidator) {
      const validation = HrValidator.validateStudentData(payload);
      if (!validation.isValid) {
        this.#setStatus(`${validation.errors.join(', ')}`, 'error');
        return false;
      }
      return true;
    }

    // Fallback validation
    const requiredFields = ['student_code', 'first_name', 'last_name', 'email'];
    const missing = requiredFields.filter(field => !payload[field]);
    if (missing.length > 0) {
      this.#setStatus(`Please fill required fields: ${missing.join(', ')}`, 'error');
      return false;
    }
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      this.#setStatus('Please enter a valid email address', 'error');
      return false;
    }
    return true;
  }

  #setStatus(message, type = 'info') {
    const statusEl = document.getElementById('formStatus');
    if (!statusEl) return;
    statusEl.textContent = message;
    const classes = {
      error: 'text-red-600 font-semibold',
      success: 'text-green-600 font-semibold',
      loading: 'text-blue-600 font-medium animate-pulse',
      info: 'text-gray-600'
    };
    statusEl.className = `text-sm ${classes[type] || classes.info}`;
  }

  async #showResult(data, isError = false) {
    const resultBox = document.getElementById('resultBox');
    if (!resultBox) return;
    
    resultBox.classList.remove('hidden');
    const resultContent = resultBox.querySelector('#resultContent');
    
    if (isError) {
      const safeMessage = data?.error || data?.message || 'Unknown error occurred';
      resultContent.innerHTML = `
        <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Error</h3>
            <p class="text-red-600">${safeMessage}</p>
          </div>
        </div>
      `;
    } else {
      resultContent.innerHTML = `
        <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-green-800">Success!</h3>
            <p class="text-green-600">Student updated successfully</p>
            <details class="mt-2">
              <summary class="cursor-pointer text-sm text-green-700 hover:text-green-800">View Details</summary>
              <pre class="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">${JSON.stringify(data, null, 2)}</pre>
            </details>
          </div>
        </div>
      `;
    }
  }

  #hideResult() {
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
      resultBox.classList.add('hidden');
    }
  }

  #attachResultHandlers() {
    // Auto-hide result after 5 seconds
    setTimeout(() => {
      this.#hideResult();
    }, 5000);
  }

  #showLoading() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Loading Student Data...</h1>
            <p class="text-gray-600">Please wait while we load the student information for editing.</p>
          </div>
        </div>
      </div>
    `;
  }

  #hideLoading() {
    // Loading will be replaced by the form
  }

  async #showError(message) {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-red-800">Error Loading Student</h2>
            <p class="text-red-600 mt-2">${message}</p>
            <div class="mt-4">
              <button onclick="window.location.reload()" 
                      class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Retry
              </button>
              <button onclick="window.location.href='${this.rootURL}/hr/students'" 
                      class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-3">
                Back to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.HrStudentEditFeature = HrStudentEditFeature;
}

}
