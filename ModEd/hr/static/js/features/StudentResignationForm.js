// Student Resignation Form Feature using Core Module's FormRender
if (typeof HrStudentResignationFormFeature === 'undefined') {
class HrStudentResignationFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.api = new HrApiService(this.rootURL);
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";
    await this.#createDynamicForm();
    return true;
  }

  async #createDynamicForm() {
    try {
      // Wait for template to be loaded
      if (!this.templateEngine.template) {
        await this.templateEngine.fetchTemplate();
      }

      const application = { template: this.templateEngine.template };

      // Minimal schema for resignation request
      const schema = [
        { type: 'text', name: 'StudentCode', label: 'Student Code', required: true },
        { type: 'textarea', name: 'Reason', label: 'Reason', required: true }
      ];

      const pageHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-10">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Submit Student Resignation</h1>
              <p class="text-gray-600">Send a resignation request for a student</p>
            </div>

            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Request Information
                </h2>
              </div>
              <div class="p-8">
                <div class="student-resignation-form-container"></div>
                <div class="text-center mt-6"><span id="formStatus" class="text-sm font-medium text-gray-500"></span></div>
              </div>
            </div>

            <div id="resultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Form Submission Result</h3>
              </div>
              <div class="p-6"><div id="resultContent"></div></div>
            </div>

            <div class="text-center mt-8">
              <a routerLink="hr" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to HR Menu</a>
            </div>
          </div>
        </div>
      `;

      const pageElement = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageElement);

      // Clear old forms
      document.querySelectorAll('form').forEach(f => f.remove());

      const formRender = new FormRender(application, schema, '.student-resignation-form-container');
      await formRender.render();

      // Remove extra/duplicate forms
      const allForms = document.querySelectorAll('form');
      for (let i = 1; i < allForms.length; i++) allForms[i].remove();
      document.querySelectorAll('form').forEach(f => { if (!f.closest('.student-resignation-form-container')) f.remove(); });

      // Remove any submit buttons that FormRender might have created
      const form = document.querySelector('form');
      if (form) {
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        submitButtons.forEach(btn => btn.remove());
        
        // Remove any text content that might contain "Submit"
        const formElements = form.querySelectorAll('*');
        formElements.forEach(el => {
          if (el.textContent && el.textContent.trim() === 'Submit' && el.tagName !== 'BUTTON') {
            el.remove();
          }
        });
      }

      this.#addCustomButtons();
      this.#attachFormHandlers();
      this.#attachResultHandlers();
    } catch (error) {
      console.error('Error creating resignation form:', error);
      this.#showError('Failed to initialize form: ' + error.message);
    }
  }

  #addCustomButtons() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Create button container outside of form
    const container = document.createElement('div');
    container.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';
    container.id = 'custom-buttons-container';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button'; // Change from 'submit' to 'button'
    submitBtn.className = 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1';
    submitBtn.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>Submit Request';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button'; // Change from 'reset' to 'button'
    resetBtn.className = 'inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg';
    resetBtn.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>Reset';

    container.appendChild(submitBtn);
    container.appendChild(resetBtn);
    
    // Insert buttons after the form container, not inside the form
    const formContainer = document.querySelector('.student-resignation-form-container');
    if (formContainer && formContainer.parentNode) {
      formContainer.parentNode.insertBefore(container, formContainer.nextSibling);
    }
  }

  #attachFormHandlers() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Remove default form submission behavior
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
    
    // Add click handlers for custom buttons
    const submitBtn = document.querySelector('#custom-buttons-container button[type="button"]:first-child');
    const resetBtn = document.querySelector('#custom-buttons-container button[type="button"]:last-child');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.#handleSubmit(form);
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        this.#setStatus('✓ Form reset', 'info');
        this.#hideResult();
      });
    }
    
    const firstField = form.querySelector('input[name="StudentCode"]');
    if (firstField) setTimeout(() => firstField.focus(), 100);
  }

  async #handleSubmit(form) {
    try {
      this.#setStatus('⏳ Submitting request...', 'loading');
      this.#hideResult();
      const payload = this.#collect(form);
      if (!this.#validate(payload)) return;
      const result = await this.api.createStudentResignation(payload);
      this.#setStatus('Request submitted successfully!', 'success');
      this.#showResult(result, false);
      setTimeout(() => { form.reset(); this.#setStatus('', 'info'); }, 3000);
    } catch (error) {
      console.error('Submit error:', error);
      this.#setStatus(`❌ ${error.message}`, 'error');
      this.#showResult({ error: error.message }, true);
    }
  }

  #collect(form) {
    const fd = new FormData(form);
    const p = {};
    for (const [k, v] of fd.entries()) {
      const t = String(v).trim();
      if (t !== '') p[k] = t;
    }
    return p;
  }

  #validate(payload) {
    const missing = ['StudentCode', 'Reason'].filter(f => !payload[f]);
    if (missing.length) {
      this.#setStatus(`❌ Please fill required fields: ${missing.join(', ')}`, 'error');
      return false;
    }
    return true;
  }

  #setStatus(message, type = 'info') {
    const el = document.getElementById('formStatus');
    if (!el) return;
    el.textContent = message;
    const classes = { error: 'text-red-600 font-semibold', success: 'text-green-600 font-semibold', loading: 'text-blue-600 font-medium animate-pulse', info: 'text-gray-600' };
    el.className = `text-sm ${classes[type] || classes.info}`;
  }

  #showResult(data, isError = false) {
    const box = document.getElementById('resultBox');
    if (!box) return;
    box.classList.remove('hidden');
    const content = box.querySelector('#resultContent');
    if (isError) {
      const msg = data?.error || data?.message || 'Unknown error';
      content.innerHTML = `
        <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div><h3 class="text-lg font-semibold text-red-800">Error</h3><p class="text-red-600">${msg}</p></div>
        </div>`;
    } else {
      content.innerHTML = `
        <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="text-lg font-semibold text-green-800">Success!</h3>
            <p class="text-green-600">Resignation request submitted</p>
            <details class="mt-2"><summary class="cursor-pointer text-sm text-green-700 hover:text-green-800">View Details</summary>
              <pre class="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">${JSON.stringify(data, null, 2)}</pre>
            </details>
          </div>
        </div>`;
    }
  }

  #hideResult() {
    const box = document.getElementById('resultBox');
    if (box) box.classList.add('hidden');
  }

  #attachResultHandlers() {
    setTimeout(() => this.#hideResult(), 5000);
  }

  async #showError(message) {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
            <p class="text-red-600 mt-2">${message}</p>
            <div class="mt-4">
              <button onclick="window.location.reload()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200">Retry</button>
              <button onclick="window.location.href='${this.rootURL}/hr/resignation/student'" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ml-3">Back</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

if (typeof window !== 'undefined') {
  window.HrStudentResignationFormFeature = HrStudentResignationFormFeature;
}

console.log('HrStudentResignationFormFeature loaded');
}


