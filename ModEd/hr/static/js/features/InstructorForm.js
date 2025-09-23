// 📍 File: /hr/static/js/features/InstructorForm.js
// Encapsulated feature module for rendering and handling the Add Instructor form

class HrInstructorFormFeature {
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
    this.#createInstructorForm();
    this.#attachFormHandlers();
    return true;
  }

  #createInstructorForm() {
    const instructorTemplate = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Add Instructor</h1>
            </div>
            <button id="backToMain" 
                    class="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span class="mr-2">←</span> Back to Main
            </button>
          </div>
        </div>

        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <form id="instructorFormCore" class="space-y-6">
              <div class="border-b border-gray-200 pb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Required Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Code <span class="text-red-500">*</span>
                    </label>
                    <input name="instructor_code" type="text" required
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="e.g., INS001" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span class="text-red-500">*</span>
                    </label>
                    <input name="email" type="email" required
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="name@university.edu" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span class="text-red-500">*</span>
                    </label>
                    <input name="first_name" type="text" required
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="First name" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span class="text-red-500">*</span>
                    </label>
                    <input name="last_name" type="text" required
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="Last name" />
                  </div>
                </div>
              </div>

              <div class="pb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information (Optional)</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input name="department" type="text"
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="e.g., Computer Engineering" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Salary (THB)</label>
                    <input name="Salary" type="number" step="0.01" min="0"
                           class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                           placeholder="50000" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Academic Position</label>
                    <select name="AcademicPosition"
                            class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3">
                      <option value="">— Select Position —</option>
                      <option value="assistant">Assistant Professor</option>
                      <option value="associate">Associate Professor</option>
                      <option value="professor">Professor</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select name="Gender"
                            class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3">
                      <option value="">— Select Gender —</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                <div class="flex items-center space-x-4">
                  <button type="submit" 
                          class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Create Instructor
                  </button>
                  <button type="reset" 
                          class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                    Reset Form
                  </button>
                </div>
                <span id="formStatusCore" class="text-sm font-medium"></span>
              </div>
            </form>
          </div>

          <div id="resultBoxCore" class="hidden mt-6 bg-white rounded-xl border shadow-lg p-6"></div>
        </div>
      </div>
    `;

    const html = Mustache.render(instructorTemplate, { title: "Add Instructor", rootURL: this.rootURL });
    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);
  }

  #attachFormHandlers() {
    const backBtn = document.getElementById('backToMain');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.templateEngine && typeof this.templateEngine.render === 'function') {
          this.templateEngine.render();
        }
      });
    }

    const form = document.getElementById('instructorFormCore');
    if (!form) {
      console.error("❌ Form not found");
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#handleFormSubmit();
    });
    form.addEventListener('reset', () => this.#handleFormReset());

    const firstField = form.querySelector('input[name="instructor_code"]');
    if (firstField) setTimeout(() => firstField.focus(), 100);
  }

  async #handleFormSubmit() {
    const form = document.getElementById('instructorFormCore');
    try {
      this.#setStatus('⏳ Creating instructor...', 'loading');
      this.#hideResult();
      const payload = this.#collectFormData(form);
      if (!this.#validatePayload(payload)) return;
      const transformedPayload = this.#transformPayload(payload);

      const response = await fetch(`${this.rootURL}/hr/instructors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(transformedPayload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);

      // Show only raw API response (no success message)
      this.#setStatus('', 'info');
      this.#showResult(result, false);
      setTimeout(() => {
        form.reset();
        this.#setStatus('', 'info');
        const firstField = form.querySelector('input[name="instructor_code"]');
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
      if (trimmedValue !== '') payload[key] = trimmedValue;
    }
    return payload;
  }

  #validatePayload(payload) {
    const requiredFields = ['instructor_code', 'email', 'first_name', 'last_name'];
    const missing = requiredFields.filter((field) => !payload[field]);
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

  #transformPayload(payload) {
    const transformed = { ...payload };
    if (transformed.Salary) {
      const salary = parseFloat(transformed.Salary);
      transformed.Salary = Number.isFinite(salary) ? salary : null;
    }
    ['department', 'AcademicPosition', 'Gender'].forEach((field) => {
      if (!transformed[field]) transformed[field] = null;
    });
    return transformed;
  }

  #handleFormReset() {
    this.#setStatus('✓ Form reset', 'info');
    this.#hideResult();
    setTimeout(() => {
      const firstField = document.querySelector('input[name="instructor_code"]');
      if (firstField) firstField.focus();
    }, 100);
  }

  #setStatus(message, type = 'info') {
    const statusEl = document.getElementById('formStatusCore');
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

  #showResult(data, isError = false) {
    const resultBox = document.getElementById('resultBoxCore');
    if (!resultBox) return;
    resultBox.classList.remove('hidden');
    if (isError) {
      const safeMessage = data?.error || data?.message || 'Unknown error occurred';
      resultBox.innerHTML = `<div><strong>Error:</strong> ${safeMessage}</div>`;
    }
    // Show raw API response only
    resultBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    resultBox.style.opacity = '0';
    resultBox.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      resultBox.style.transition = 'all 0.3s ease-out';
      resultBox.style.opacity = '1';
      resultBox.style.transform = 'translateY(0)';
    }, 50);
  }

  #hideResult() {
    const resultBox = document.getElementById('resultBoxCore');
    if (resultBox) {
      resultBox.classList.add('hidden');
      resultBox.style.transition = '';
      resultBox.style.opacity = '';
      resultBox.style.transform = '';
    }
  }
}

if (typeof window !== 'undefined') {
  window.HrInstructorFormFeature = HrInstructorFormFeature;
}

console.log("📦 HrInstructorFormFeature loaded");


