// Department Form Feature (Create) using dynamic meta when available
if (typeof HrDepartmentFormFeature === 'undefined') {
class HrDepartmentFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    // Prevent duplicate rendering
    if (this._isRendering) {
      return false;
    }
    
    // Check if form is already rendered
    if (this.templateEngine.mainContainer.querySelector('.department-form-container')) {
      return false;
    }
    
    // Check if there are multiple forms and clear if so
    const existingForms = this.templateEngine.mainContainer.querySelectorAll('form');
    if (existingForms.length > 0) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    this._isRendering = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 10)); // Delay for race conditions
      this.templateEngine.mainContainer.innerHTML = "";
      await this.#createDynamicForm();
      return true;
    } finally {
      this._isRendering = false;
    }
  }

  async #createDynamicForm() {
    try {
      // try to pull meta; fall back to local schema if not provided
      let schema;
      try {
        const metaRes = await fetch(`${this.rootURL}/api/modelmeta/hr/departments`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          if (Array.isArray(meta) && meta.length) {
            schema = meta.map(f => ({
              type: f.type || 'text',
              name: f.name,
              label: f.label || f.name,
              required: ['name', 'parent'].includes(f.name)
            }));
          }
        }
      } catch (_) {}
      if (!schema) {
        // Fallback based on model (NOTE: Faculty has json:"parent")
        schema = [
          { type: 'text', name: 'name', label: 'Department Name', required: true },
          { type: 'text', name: 'parent', label: 'Faculty', required: true },
          { type: 'number', name: 'budget', label: 'Budget (THB)', required: false }
        ];
      }

      if (!this.templateEngine.template) await this.templateEngine.fetchTemplate();
      const application = { template: this.templateEngine.template };

      const pageHTML = `
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Add Department</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Create a new department</p>
            </div>

            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                  </svg>
                  Department Information
                </h2>
              </div>
              <div class="p-8">
                <div class="department-form-container"></div>
                <div class="text-center mt-6">
                  <span id="deptFormStatus" class="text-sm font-medium text-gray-500"></span>
                </div>
              </div>
            </div>

            <div id="deptResultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Form Submission Result
                </h3>
              </div>
              <div class="p-6"><div id="deptResultContent"></div></div>
            </div>
          </div>
        </div>
      `;

      const pageEl = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageEl);

      // remove forms within container only (avoid nuking others)
      const container = document.querySelector('.department-form-container');
      container.querySelectorAll('form').forEach(f => f.remove());

      const formRender = new FormRender(application, schema, '.department-form-container');
      await formRender.render();

      // cleanup stray forms outside our container
      document.querySelectorAll('form').forEach(f => {
        if (!f.closest('.department-form-container')) return; // keep ours
      });

      this.#addButtons();
      this.#attachHandlers();
      this.#attachResultHandlers();

    } catch (err) {
      console.error('Error creating department form:', err);
      this.#showBlockingError('Failed to load form: ' + err.message);
    }
  }

  #addButtons() {
    const form = document.querySelector('.department-form-container form');
    if (!form) return;
    form.querySelectorAll('button[type="submit"],input[type="submit"]').forEach(b => b.remove());

    const actions = document.createElement('div');
    actions.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-lg hover:shadow-xl';
    submit.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      Create Department
    `;

    const reset = document.createElement('button');
    reset.type = 'button'; // Changed from 'reset' to 'button' to prevent default form reset behavior
    reset.className = 'inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg';
    reset.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      Reset
    `;

    // Add click handler for reset button
    reset.addEventListener('click', () => {
      this.#status('✓ Form reset', 'info');
      this.#hideResult();
      
      // Clear all form fields manually
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });
      
      // Focus first field
      const firstField = form.querySelector('input[name="name"]');
      if (firstField) firstField.focus();
    });

    actions.appendChild(submit);
    actions.appendChild(reset);
    form.appendChild(actions);
  }

  #attachHandlers() {
    const form = document.querySelector('.department-form-container form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      this.#submit(form);
    });
    // Reset handler is now handled by the reset button's click event

    const first = form.querySelector('input[name="name"]');
    if (first) setTimeout(() => first.focus(), 100);
  }

  async #submit(form) {
    try {
      this.#status('Creating department...', 'loading');
      this.#hideResult();

      const payload = this.#collect(form);
      if (!this.#validate(payload)) return;

      const res = await fetch(`${this.rootURL}/hr/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || e?.message || `HTTP ${res.status}`);
      }
      const result = await res.json().catch(() => ({}));

      this.#status('Department created successfully!', 'success');
      this.#showResult(result, false);

      setTimeout(() => {
        form.reset();
        this.#status('', 'info');
        form.querySelector('input[name="name"]')?.focus();
      }, 2500);
    } catch (err) {
      console.error('Create error:', err);
      this.#status(err.message, 'error');
      this.#showResult({ error: err.message }, true);
    }
  }

  #collect(form) {
    const fd = new FormData(form);
    const p = {};
    for (const [k, v] of fd.entries()) {
      const tv = String(v).trim();
      if (tv !== '') p[k] = k === 'budget' ? Number(tv) : tv;
    }
    return p;
  }

  #validate(p) {
    const required = ['name', 'parent']; // NOTE: Faculty json key is 'parent'
    const missing = required.filter(k => !p[k]);
    if (missing.length) {
      this.#status(`Please fill required fields: ${missing.join(', ')}`, 'error');
      return false;
    }
    if (p.budget != null && (isNaN(p.budget) || Number(p.budget) < 0)) {
      this.#status('Budget must be a non-negative number', 'error');
      return false;
    }
    return true;
  }

  #status(msg, type='info') {
    const el = document.getElementById('deptFormStatus');
    if (!el) return;
    const classes = {
      error: 'text-red-600 font-semibold',
      success: 'text-green-600 font-semibold',
      loading: 'text-blue-600 font-medium animate-pulse',
      info: 'text-gray-600'
    };
    el.textContent = msg;
    el.className = `text-sm ${classes[type] || classes.info}`;
  }

  #showResult(data, isError=false) {
    const box = document.getElementById('deptResultBox');
    const content = document.getElementById('deptResultContent');
    if (!box || !content) return;
    box.classList.remove('hidden');
    if (isError) {
      const msg = data?.error || data?.message || 'Unknown error';
      content.innerHTML = `
        <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Error</h3>
            <p class="text-red-600">${msg}</p>
          </div>
        </div>`;
    } else {
      content.innerHTML = `
        <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-green-800">Success!</h3>
            <p class="text-green-600">Department created successfully</p>
            <details class="mt-2">
              <summary class="cursor-pointer text-sm text-green-700 hover:text-green-800">View Details</summary>
              <pre class="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">${JSON.stringify(data, null, 2)}</pre>
            </details>
          </div>
        </div>`;
    }
  }
  #hideResult() { document.getElementById('deptResultBox')?.classList.add('hidden'); }

  #attachResultHandlers() { setTimeout(() => this.#hideResult(), 5000); }

  #showBlockingError(message) {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
            <p class="text-red-600 mt-2">${message}</p>
            <div class="mt-4">
              <button onclick="window.location.reload()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200">Retry</button>
              <button onclick="window.location.href='${this.rootURL}/hr'" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ml-3">Back to HR</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

if (typeof window !== 'undefined') window.HrDepartmentFormFeature = HrDepartmentFormFeature;
}
