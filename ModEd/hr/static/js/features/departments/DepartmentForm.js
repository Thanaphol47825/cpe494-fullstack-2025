// /hr/static/js/features/departments/DepartmentForm.js
(function () {
  if (typeof window === 'undefined') return;
  if (window.HrDepartmentFormFeature) return;

  class HrDepartmentFormFeature {
    constructor(templateEngine, rootURL = '') {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || '';
      this.container = this.templateEngine?.mainContainer || document.getElementById('MainContainer');
    }

    async render() {
      // Page wrapper using templates util
      const page = HrUiComponents.createFormPageWrapper({
        bgGradient: 'from-indigo-50 via-slate-50 to-blue-50',
        gradientFrom: 'indigo-600',
        gradientTo: 'blue-600',
        title: 'Add Department',
        description: 'Create a new department',
        icon: HrTemplates.iconPaths.department,
        formTitle: 'Department Information',
        backLink: 'hr/departments',
        backLabel: 'Back to Departments'
      });

      // Build form
      const formHTML = `
        <form id="deptForm" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Department Name <span class="text-red-500">*</span>
            </label>
            <input id="name" name="name" type="text" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label for="faculty" class="block text-sm font-medium text-gray-700 mb-2">
              Faculty <span class="text-red-500">*</span>
            </label>
            <input id="faculty" name="faculty" type="text" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
              Annual Budget (฿)
            </label>
            <input id="budget" name="budget" type="number" min="0" step="1" placeholder="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>

          <div id="formStatus" class="hidden"></div>

          <div class="flex flex-col sm:flex-row gap-4 pt-2">
            <button type="submit" class="${HrUiComponents.buttonClasses.success}">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${HrTemplates.iconPaths.save}
              </svg>
              Save Department
            </button>
            <a routerLink="hr/departments" class="${HrUiComponents.buttonClasses.secondary}">
              Cancel
            </a>
          </div>
        </form>
      `;

      // Mount
      const slot = page.querySelector('.formCard .container, .formCard .form-container') || page.querySelector('.featureCard') || page;
      const cardContainer = page.querySelector('.formCard') || page;
      // Insert form into the .containerClass placeholder we generated
      const formContainer = page.querySelector('.form-container') || page.querySelector('[class*="containerClass"]') || page;
      formContainer.innerHTML = formHTML;

      this.container.innerHTML = '';
      this.container.appendChild(page);

      // Bind submit
      const form = this.container.querySelector('#deptForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        HrUiComponents.hideFormResult();

        const data = this.readForm(form);
        try {
          const created = await window.hrApp.apiService.createDepartment(data);
          HrUiComponents.showFormSuccess('Department created successfully.', created);
          setTimeout(() => this.templateEngine.routerLinks.navigateTo('hr/departments'), 900);
        } catch (err) {
          HrUiComponents.showFormError('Failed to create department.', err);
        }
      });
    }

    readForm(form) {
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const faculty = (fd.get('faculty') || '').toString().trim();
      const budgetRaw = fd.get('budget');
      const payload = { name, faculty };

      if (budgetRaw !== null && String(budgetRaw).trim() !== '') {
        const n = Number(budgetRaw);
        if (!Number.isNaN(n)) payload.budget = n;
      }
      return payload;
    }
  }

  window.HrDepartmentFormFeature = HrDepartmentFormFeature;
})();
