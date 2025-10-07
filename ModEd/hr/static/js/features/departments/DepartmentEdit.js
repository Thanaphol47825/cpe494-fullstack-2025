// Department Edit Feature (Update) using dynamic meta when available
if (typeof HrDepartmentEditFeature === 'undefined') {
class HrDepartmentEditFeature {
  constructor(templateEngine, rootURL, deptName) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.deptName = decodeURIComponent(deptName || '');
    this.departmentData = null;
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }
    this.templateEngine.mainContainer.innerHTML = "";
    await this.#loadData();
    return true;
  }

  async #loadData() {
    try {
      this.#showLoading();
      const res = await fetch(`${this.rootURL}/hr/departments/${encodeURIComponent(this.deptName)}`, { headers: { Accept: 'application/json' }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.departmentData = await res.json();
      await this.#buildForm();
    } catch (err) {
      console.error('Error loading department:', err);
      this.#showError('Failed to load department: ' + err.message);
    }
  }

  async #buildForm() {
    try {
      // meta → fallback
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
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Edit Department</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Update: ${this.departmentData?.name || this.deptName}</p>
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
                <div class="department-edit-form-container"></div>
                <div class="text-center mt-6"><span id="deptEditStatus" class="text-sm font-medium text-gray-500"></span></div>
              </div>
            </div>

            <div id="deptEditResultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Form Submission Result
                </h3>
              </div>
              <div class="p-6"><div id="deptEditResultContent"></div></div>
            </div>

            <div class="text-center mt-8">
              <a href="#hr/departments" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Departments
              </a>
            </div>
          </div>
        </div>
      `;

      const pageEl = this.templateEngine.create(pageHTML);
      this.templateEngine.mainContainer.appendChild(pageEl);

      // render form
      const container = document.querySelector('.department-edit-form-container');
      container.querySelectorAll('form').forEach(f => f.remove());

      const formRender = new FormRender(application, schema, '.department-edit-form-container');
      await formRender.render();

      // populate
      this.#populate();

      // buttons + handlers
      this.#addButtons();
      this.#bind();
      this.#attachResultHandlers();

    } catch (err) {
      console.error('Error building department edit form:', err);
      this.#showError('Failed to build form: ' + err.message);
    }
  }

  #populate() {
    const form = document.querySelector('.department-edit-form-container form');
    if (!form || !this.departmentData) return;
    const data = this.departmentData;

    const set = (name, val) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field) return;
      if (field.type === 'number') field.value = (val ?? '').toString();
      else field.value = val ?? '';
    };

    set('name', data.name);
    set('parent', data.parent ?? data.faculty); // Faculty marshals as "parent"
    set('budget', data.budget);
  }

  #addButtons() {
    const form = document.querySelector('.department-edit-form-container form');
    if (!form) return;
    form.querySelectorAll('button[type="submit"],input[type="submit"]').forEach(b => b.remove());

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-6 border-t border-gray-200';

    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-lg hover:shadow-xl';
    save.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Update Department
    `;

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg';
    cancel.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Cancel
    `;
    cancel.onclick = () => {
      if (confirm('Discard changes?')) window.location.href = '#hr/departments';
    };

    wrap.appendChild(save);
    wrap.appendChild(cancel);
    form.appendChild(wrap);
  }

  #bind() {
    const form = document.querySelector('.department-edit-form-container form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#submit(form);
    });
    const first = form.querySelector('input[name="name"]');
    if (first) setTimeout(() => first.focus(), 100);
  }

  async #submit(form) {
    try {
      this.#status('Updating department...', 'loading');
      this.#hideResult();

      const payload = this.#collect(form);
      if (!this.#validate(payload)) return;

      // update by name (controller: POST /hr/departments/:name/update)
      const res = await fetch(`${this.rootURL}/hr/departments/${encodeURIComponent(this.deptName)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || e?.message || `HTTP ${res.status}`);
      }
      const result = await res.json().catch(() => ({}));

      this.#status('Department updated successfully!', 'success');
      this.#showResult(result, false);

      setTimeout(() => { window.location.href = '#hr/departments'; }, 2000);
    } catch (err) {
      console.error('Update error:', err);
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
    // don't let user change primary key name easily; backend allows, but safer to rely on path param
    delete p.id;
    return p;
  }

  #validate(p) {
    const missing = ['name', 'parent'].filter(k => !p[k]);
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
    const el = document.getElementById('deptEditStatus');
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
    const box = document.getElementById('deptEditResultBox');
    const content = document.getElementById('deptEditResultContent');
    if (!box || !content) return;
    box.classList.remove('hidden');
    if (isError) {
      const msg = data?.error || data?.message || 'Unknown error';
      content.innerHTML = `
        <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div><h3 class="text-lg font-semibold text-red-800">Error</h3><p class="text-red-600">${msg}</p></div>
        </div>`;
    } else {
      content.innerHTML = `
        <div class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-green-800">Success!</h3>
            <p class="text-green-600">Department updated successfully</p>
            <details class="mt-2">
              <summary class="cursor-pointer text-sm text-green-700 hover:text-green-800">View Details</summary>
              <pre class="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">${JSON.stringify(data, null, 2)}</pre>
            </details>
          </div>
        </div>`;
    }
  }

  #attachResultHandlers() { setTimeout(() => this.#hideResult(), 5000); }
  #hideResult() { document.getElementById('deptEditResultBox')?.classList.add('hidden'); }

  #showLoading() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Loading Department...</h1>
            <p class="text-gray-600">Please wait.</p>
          </div>
        </div>
      </div>
    `;
  }

  #showError(msg) {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-red-800">Error Loading Department</h2>
            <p class="text-red-600 mt-2">${msg}</p>
            <div class="mt-4">
              <button onclick="window.location.reload()" class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200">Retry</button>
              <button onclick="window.location.href='${this.rootURL}/hr/departments'" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ml-3">Back to Departments</button>
            </div>
          </div>
        </div>
      </div>`;
  }
}

if (typeof window !== 'undefined') window.HrDepartmentEditFeature = HrDepartmentEditFeature;
}
