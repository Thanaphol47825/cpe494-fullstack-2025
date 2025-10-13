// /hr/static/js/features/departments/DepartmentList.js
(function () {
  if (typeof window === 'undefined') return;
  if (window.HrDepartmentListFeature) return;

  class HrDepartmentListFeature {
    constructor(templateEngine, rootURL = '') {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || '';
      this.container = this.templateEngine?.mainContainer || document.getElementById('MainContainer');
      this._abort = null;
    }

    async render() {
      try {
        // Page skeleton (loading state)
        this.container.innerHTML = HrUiComponents.renderLoadingState(
          'Departments',
          'Manage departments and budgets'
        );

        const departments = await this.fetchDepartments();

        // Render list page
        this.container.innerHTML = this.renderPage(departments);

        // Wire events
        this.bindEvents();
      } catch (err) {
        console.error('DepartmentList render error:', err);
        this.container.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 class="text-lg font-semibold text-red-800">Error Loading Departments</h2>
                <p class="text-red-600 mt-2">${err?.message || 'Unknown error'}</p>
                <div class="mt-4">
                  <a routerLink="hr" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back to HR</a>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    async fetchDepartments() {
      return await window.hrApp.apiService.fetchDepartments();
    }

    renderPage(departments) {
      const hasItems = Array.isArray(departments) && departments.length > 0;

      const header = `
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${HrTemplates.iconPaths.department}
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
          <p class="text-lg text-gray-600">Manage academic departments and budgets</p>
        </div>
      `;

      const actionBar = `
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${HrTemplates.iconPaths.success}
            </svg>
            <span class="text-lg text-gray-700 font-medium">
              ${hasItems ? departments.length : 0} Department${hasItems && departments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button id="deptRefreshBtn" class="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${HrTemplates.iconPaths.reset}
              </svg>
              Refresh
            </button>
            <a routerLink="hr/departments/create" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${HrTemplates.iconPaths.add}
              </svg>
              Add Department
            </a>
          </div>
        </div>
      `;

      const list = hasItems
        ? `
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
            ${departments.map((d) => this.renderCard(d)).join('')}
          </div>
        `
        : `
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
            ${HrTemplates.render('emptyState', {
              icon: HrTemplates.iconPaths.department,
              title: 'No Departments Found',
              message: 'Get started by adding your first department.',
              hasAction: true,
              actionLink: 'hr/departments/create',
              actionLabel: 'Add First Department'
            })}
          </div>
        `;

      const backBtn = `
        <div class="text-center mt-8">
          <a routerLink="hr" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${HrTemplates.iconPaths.back}
            </svg>
            Back to HR Menu
          </a>
        </div>
      `;

      return `
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
          <div class="max-w-7xl mx-auto px-4">
            ${header}
            ${actionBar}
            ${list}
            ${backBtn}
          </div>
        </div>
      `;
    }

    renderCard(row) {
      const name = row.name || row.Name || 'Unnamed';
      const faculty = row.faculty || row.Faculty || 'Not specified';
      const budgetRaw = row.budget ?? row.Budget;
      const budget = HrTemplates.formatCurrency(budgetRaw);

      const encoded = encodeURIComponent(String(name));
      return `
        <div class="rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow mb-4 p-5 bg-white">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${HrTemplates.iconPaths.department}
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">${name}</h3>
                <div class="text-sm text-gray-600">Faculty: <span class="font-medium">${faculty}</span></div>
                <div class="text-sm text-gray-600">Budget: <span class="font-medium">${budget}</span></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a routerLink="hr/departments/edit/${encoded}" class="inline-flex items-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${HrTemplates.iconPaths.edit}
                </svg>
                Edit
              </a>
              <button class="js-dept-del inline-flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                      data-name="${encodeURIComponent(String(name))}">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  ${HrTemplates.iconPaths.trash}
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }

    bindEvents() {
      // Router links are handled globally by your custom navigation
      const refresh = this.container.querySelector('#deptRefreshBtn');
      if (refresh) {
        refresh.addEventListener('click', () => this.render());
      }

      this.container.querySelectorAll('.js-dept-del').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const encoded = e.currentTarget.getAttribute('data-name');
          const name = decodeURIComponent(encoded || '');
          if (!name) return;

          const ok = confirm(`Delete department "${name}"? This cannot be undone.`);
          if (!ok) return;

          try {
            await window.hrApp.apiService.deleteDepartment(name);
            await this.render();
          } catch (err) {
            alert(`Delete failed: ${err?.message || 'Unknown error'}`);
          }
        });
      });
    }
  }

  window.HrDepartmentListFeature = HrDepartmentListFeature;
})();
