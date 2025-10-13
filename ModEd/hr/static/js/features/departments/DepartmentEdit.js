// /hr/static/js/features/departments/DepartmentEdit.js
(function () {
  if (typeof window === 'undefined') return;
  if (window.HrDepartmentEditFeature) return;

  class HrDepartmentEditFeature {
    constructor(templateEngine, rootURL = '', nameParam = '') {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || '';
      this.nameParam = nameParam || '';
      this.decodedName = decodeURIComponent(this.nameParam);
      this.container = this.templateEngine?.mainContainer || document.getElementById('MainContainer');
    }

    async render() {
      // Wrapper
      const page = HrUiComponents.createEditFormPageWrapper({
        bgGradient: 'from-indigo-50 via-slate-50 to-blue-50',
        gradientFrom: 'indigo-600',
        gradientTo: 'blue-600',
        title: `Edit Department`,
        description: `Updating: ${this.decodedName}`,
        icon: HrTemplates.iconPaths.edit,
        formTitle: 'Department Information',
        backLink: 'hr/departments',
        backLabel: 'Back to Departments'
      });

      // Insert base form first (will be filled after fetch)
      const formHTML = `
        <form id="deptEditForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
            <input id="name" name="name" type="text" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <p class="mt-1 text-xs text-gray-500">Changing the name will update the record keyed by the previous name.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
            <input id="faculty" name="faculty" type="text" required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Annual Budget (฿)</label>
            <input id="budget" name="budget" type="number" min="0" step="1"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>

          <div id="formStatus" class="hidden"></div>

          <div class="flex flex-col sm:flex-row gap-4 pt-2">
            <button type="submit" class="${HrUiComponents.buttonClasses.success}">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${HrTemplates.iconPaths.save}
              </svg>
              Save Changes
            </button>
            <button type="button" id="deptDeleteBtn" class="${HrUiComponents.buttonClasses.danger}">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${HrTemplates.iconPaths.trash}
              </svg>
              Delete
            </button>
            <a routerLink="hr/departments" class="${HrUiComponents.buttonClasses.secondary}">
              Cancel
            </a>
          </div>
        </form>
      `;

      const formContainer = page.querySelector('.form-container') || page;
      formContainer.innerHTML = formHTML;

      this.container.innerHTML = '';
      this.container.appendChild(page);

      // Load data
      try {
        const dept = await window.hrApp.apiService.fetchDepartment(this.decodedName);
        this.fillForm(dept);
      } catch (err) {
        HrUiComponents.showFormError('Failed to load department.', err);
        return;
      }

      // Bind submit
      const form = this.container.querySelector('#deptEditForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        HrUiComponents.hideFormResult();

        const patch = this.readForm(form);
        try {
          await window.hrApp.apiService.updateDepartment(this.decodedName, patch);
          HrUiComponents.showFormSuccess('Department updated successfully.');
          setTimeout(() => this.templateEngine.routerLinks.navigateTo('hr/departments'), 900);
        } catch (err) {
          HrUiComponents.showFormError('Update failed.', err);
        }
      });

      // Bind delete
      const delBtn = this.container.querySelector('#deptDeleteBtn');
      delBtn.addEventListener('click', async () => {
        const ok = confirm(`Delete department "${this.decodedName}"? This cannot be undone.`);
        if (!ok) return;
        try {
          await window.hrApp.apiService.deleteDepartment(this.decodedName);
          this.templateEngine.routerLinks.navigateTo('hr/departments');
        } catch (err) {
          HrUiComponents.showFormError('Delete failed.', err);
        }
      });
    }

    fillForm(dept) {
      const $ = (id) => this.container.querySelector(`${id}`);
      $('#name').value = (dept.name || dept.Name || this.decodedName || '').toString();
      $('#faculty').value = (dept.faculty || dept.Faculty || '').toString();
      const b = dept.budget ?? dept.Budget;
      $('#budget').value = (b === null || b === undefined) ? '' : String(b);
    }

    readForm(form) {
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const faculty = (fd.get('faculty') || '').toString().trim();
      const budgetRaw = fd.get('budget');
      const patch = { name, faculty };

      if (budgetRaw !== null && String(budgetRaw).trim() !== '') {
        const n = Number(budgetRaw);
        if (!Number.isNaN(n)) patch.budget = n;
      }
      return patch;
    }
  }

  window.HrDepartmentEditFeature = HrDepartmentEditFeature;
})();
