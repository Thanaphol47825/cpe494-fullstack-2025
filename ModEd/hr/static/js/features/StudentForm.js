// Clean Student Form Feature using Core Module's FormRender
class HrStudentFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("❌ Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";
    await this.#createDynamicStudentForm();
    return true;
  }

  async #createDynamicStudentForm() {
    try {
      // Fetch form metadata from API
      const response = await fetch('/api/modelmeta/student');
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
      
      // Create page structure first
      const pageHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4 mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Add Student</h1>
                <p class="text-gray-600 mt-2">Create a new student using dynamic form generation</p>
              </div>
              <button id="backToMain" 
                      class="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="mr-2">←</span> Back to Main
              </button>
            </div>
          </div>

          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-white rounded-2xl shadow-lg p-8">
              <div class="student-form-container">
                <!-- Dynamic form will be inserted here -->
              </div>
              
              <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <div class="flex items-center space-x-4">
                  <button type="submit" form="studentForm"
                          class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Create Student
                  </button>
                  <button type="reset" form="studentForm"
                          class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                    Reset Form
                  </button>
                </div>
                <span id="formStatus" class="text-sm font-medium"></span>
              </div>
            </div>

            <div id="resultBox" class="hidden mt-6 bg-white rounded-xl border shadow-lg p-6"></div>
          </div>
        </div>
      `;

      const pageElement = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageElement);

      // Now create FormRender after container exists in DOM
      const formRender = new FormRender(application, schema, '.student-form-container');
      const formElement = await formRender.render();

      // Attach event handlers
      this.#attachFormHandlers();
      this.#attachResultHandlers();

    } catch (error) {
      console.error('❌ Error creating dynamic form:', error);
      this.#showError('Failed to load form metadata: ' + error.message);
    }
  }

  #attachFormHandlers() {
    // Back button handler
    const backBtn = document.getElementById('backToMain');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.templateEngine && typeof this.templateEngine.render === 'function') {
          this.templateEngine.render();
        }
      });
    }

    // Form submit handler
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.#handleFormSubmit(form);
      });

      // Form reset handler
      form.addEventListener('reset', () => {
        this.#setStatus('✓ Form reset', 'info');
        this.#hideResult();
      });

      // Focus first field
      const firstField = form.querySelector('input[name="student_code"]');
      if (firstField) setTimeout(() => firstField.focus(), 100);
    }
  }

  async #handleFormSubmit(form) {
    try {
      this.#setStatus('⏳ Creating student...', 'loading');
      this.#hideResult();

      const payload = this.#collectFormData(form);
      if (!this.#validatePayload(payload)) return;

      const response = await fetch(`${this.rootURL}/hr/students`, {
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

      this.#setStatus('', 'info');
      this.#showResult(result, false);
      
      setTimeout(() => {
        form.reset();
        this.#setStatus('', 'info');
        const firstField = form.querySelector('input[name="student_code"]');
        if (firstField) firstField.focus();
      }, 3000);

    } catch (error) {
      console.error('❌ Form submission error:', error);
      this.#setStatus(`❌ ${error.message}`, 'error');
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
    return payload;
  }

  #validatePayload(payload) {
    const requiredFields = ['student_code', 'first_name', 'last_name', 'email'];
    const missing = requiredFields.filter(field => !payload[field]);
    if (missing.length > 0) {
      this.#setStatus(`❌ Please fill required fields: ${missing.join(', ')}`, 'error');
      return false;
    }
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      this.#setStatus('❌ Please enter a valid email address', 'error');
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
      loading: 'text-blue-600 font-medium',
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
      resultContent.innerHTML = `<div class="text-red-600"><strong>Error:</strong> ${safeMessage}</div>`;
    } else {
      resultContent.innerHTML = `<pre class="text-sm text-gray-700">${JSON.stringify(data, null, 2)}</pre>`;
    }
  }

  #hideResult() {
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
      resultBox.classList.add('hidden');
    }
  }

  #attachResultHandlers() {
    const closeResultButton = document.getElementById('closeResult');
    if (closeResultButton) {
      closeResultButton.addEventListener('click', () => {
        this.#hideResult();
      });
    }
  }

  async #showError(message) {
    try {
      // Use template for error page
      const errorHTML = await this.templateEngine.renderTemplate('ErrorPage', {
        title: 'Error Loading Form',
        error_title: 'Error Loading Form',
        error_message: message
      });
      
      this.templateEngine.mainContainer.innerHTML = errorHTML;
      
      // Initialize RouterLinks for navigation
      if (window.RouterLinks) {
        new RouterLinks();
      }
    } catch (error) {
      console.error('Failed to render error template:', error);
      // Fallback to simple error display
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4">
                <button onclick="window.location.reload()" 
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  Retry
                </button>
                <button onclick="window.location.href='${this.rootURL}/hr'" 
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-3">
                  Back to Main
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.HrStudentFormFeature = HrStudentFormFeature;
}

console.log("📦 HrStudentFormFeature (Clean) loaded");
