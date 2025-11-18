// /hr/static/js/features/departments/DepartmentList.js
(function () {
  if (typeof window === 'undefined') return;
  if (window.HrDepartmentListFeature) return;

  class HrDepartmentListFeature {
    constructor(templateEngine, rootURL = '') {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || '';
      this.container = this.templateEngine?.mainContainer || document.getElementById('MainContainer');
      this._abort = null;
      this.tableRender = null;
      this._rawDepartments = [];
    }

    async render() {
      try {
        // --- Loading state (DOM only) ---
        const loading = HrDOMHelpers.createDiv({
          className: 'min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8',
          children: [
            HrDOMHelpers.createDiv({
              className: 'max-w-4xl mx-auto px-4',
              children: [
                HrDOMHelpers.createDiv({
                  className: 'bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-3',
                  children: [
                    HrDOMHelpers.createDiv({
                      className: 'w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 animate-pulse'
                    }),
                    HrDOMHelpers.createParagraph({
                      className: 'text-gray-700',
                      text: 'Loading departments...'
                    })
                  ]
                })
              ]
            })
          ]
        });
        HrDOMHelpers.replaceContent(this.container, loading);

        const departments = await this.fetchDepartments();
        this._rawDepartments = Array.isArray(departments) ? departments : [];

        // --- Render list page skeleton (header + action bar + list card) ---
        const page = this.renderPage(departments);
        HrDOMHelpers.replaceContent(this.container, page);

        // --- Render table with AdvanceTableRender ---
        await this.renderTable(departments);

        // --- Wire events (refresh + view + delete) ---
        this.bindEvents();
      } catch (err) {
        console.error('DepartmentList render error:', err);
        const errorPage = HrDOMHelpers.createErrorPage({
          title: 'Error Loading Departments',
          message: err?.message || 'Unknown error',
          backUrl: '#hr'
        });
        HrDOMHelpers.replaceContent(this.container, errorPage);
      }
    }

    async fetchDepartments() {
      // ใช้ apiService กลางจาก hrApp ถ้ามี
      if (window.hrApp?.apiService?.fetchDepartments) {
        return await window.hrApp.apiService.fetchDepartments();
      }
      // fallback: ใช้ HrApiService โดยตรง
      if (window.HrApiService) {
        const api = new HrApiService(this.rootURL);
        return await api.fetchDepartments();
      }
      throw new Error('HrApiService not available');
    }

    formatCurrency(value) {
      if (window.HrTemplates?.formatCurrency) {
        return HrTemplates.formatCurrency(value);
      }
      if (value === null || value === undefined || value === '') return 'N/A';
      return String(value);
    }

    // Build the whole page using HrDOMHelpers (header + action bar + empty table area)
    renderPage(departments) {
      const hasItems = Array.isArray(departments) && departments.length > 0;

      // --- Top-level page container ---
      const page = HrDOMHelpers.createDiv({
        className: 'min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8'
      });

      const wrapper = HrDOMHelpers.createDiv({
        className: 'max-w-7xl mx-auto px-4'
      });

      // --- Header ---
      const iconPathFallback = 'M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7'; // simple "building" shape
      const header = HrDOMHelpers.createDiv({
        className: 'text-center mb-8',
        children: [
          HrDOMHelpers.createDiv({
            className:
              'inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg mb-4',
            children: [
              HrDOMHelpers.createIcon(iconPathFallback, {
                className: 'w-8 h-8 text-white',
                strokeWidth: 1.8
              })
            ]
          }),
          HrDOMHelpers.createHeading(1, {
            className: 'text-3xl font-bold text-gray-900 tracking-tight',
            textContent: 'Departments'
          }),
          HrDOMHelpers.createParagraph({
            className: 'text-lg text-gray-600',
            textContent: 'Manage academic departments and budgets'
          })
        ]
      });

      // --- Action Bar ---
      const countIconPath = 'M5 13l4 4L19 7'; // check
      const refreshIconPath = 'M4 4v6h6M20 20v-6h-6M5 19A9 9 0 1019 5';
      const addIconPath = 'M12 6v12m6-6H6';

      const leftCount = HrDOMHelpers.createDiv({
        className: 'flex items-center space-x-3',
        children: [
          HrDOMHelpers.createIcon(countIconPath, { className: 'w-6 h-6 text-green-600' }),
          HrDOMHelpers.createElement('span', {
            className: 'text-lg text-gray-700 font-medium',
            textContent: `${hasItems ? departments.length : 0} Department${
              hasItems && departments.length !== 1 ? 's' : ''
            }`
          })
        ]
      });

      const refreshBtn = HrDOMHelpers.createButton({
        id: 'deptRefreshBtn',
        className:
          'inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50',
        children: [
          HrDOMHelpers.createIcon(refreshIconPath, { className: 'w-5 h-5 mr-2' }),
          'Refresh'
        ]
      });

      const addLink = HrDOMHelpers.createElement('a', {
        className:
          'inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700',
        attributes: {
          routerLink: 'hr/departments/create',
          href: '#hr/departments/create'
        },
        children: [HrDOMHelpers.createIcon(addIconPath, { className: 'w-5 h-5 mr-2' }), 'Add Department']
      });

      const rightActions = HrDOMHelpers.createDiv({
        className: 'flex items-center space-x-3',
        children: [refreshBtn, addLink]
      });

      const actionBar = HrDOMHelpers.createDiv({
        className: 'flex justify-between items-center mb-8',
        children: [leftCount, rightActions]
      });

      // --- List Section Card ---
      const listCard = HrDOMHelpers.createDiv({
        className: 'bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6',
        attributes: { id: 'departmentsListCard' }
      });

      if (hasItems) {
        // จองที่ไว้ให้ AdvanceTableRender ใส่ table เข้ามา
        const tableContainer = HrDOMHelpers.createDiv({
          className: 'mt-2',
          attributes: { id: 'departmentsTableContainer' }
        });
        listCard.appendChild(tableContainer);
      } else {
        // Empty state
        listCard.appendChild(
          HrDOMHelpers.createDiv({
            className: 'rounded-xl border border-dashed border-gray-300 p-6 text-center',
            children: [
              HrDOMHelpers.createHeading(3, {
                className: 'text-lg font-semibold text-gray-900',
                textContent: 'No Departments Found'
              }),
              HrDOMHelpers.createParagraph({
                className: 'text-gray-600 mt-1',
                textContent: 'Get started by adding your first department.'
              }),
              HrDOMHelpers.createElement('a', {
                className:
                  'inline-flex items-center mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100',
                attributes: {
                  routerLink: 'hr/departments/create',
                  href: '#hr/departments/create'
                },
                children: ['+ Add Department']
              })
            ]
          })
        );
      }

      // --- Back Button row ---
      const backIconPath = 'M10 19l-7-7m0 0l7-7m-7 7h18';
      const backRow = HrDOMHelpers.createDiv({
        className: 'text-center mt-8',
        children: [
          HrDOMHelpers.createElement('a', {
            className:
              'inline-flex items-center px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50',
            attributes: {
              routerLink: 'hr',
              href: '#hr'
            },
            children: [HrDOMHelpers.createIcon(backIconPath, { className: 'w-5 h-5 mr-2' }), 'Back to HR Home']
          })
        ]
      });

      // --- Assemble ---
      wrapper.appendChild(header);
      wrapper.appendChild(actionBar);
      wrapper.appendChild(listCard);
      wrapper.appendChild(backRow);
      page.appendChild(wrapper);

      return page;
    }

    // ใช้ AdvanceTableRender สร้างตาราง
    async renderTable(departments) {
      if (!Array.isArray(departments) || departments.length === 0) {
        // ไม่มีข้อมูล ไม่ต้องทำตาราง
        return;
      }
      if (typeof window.AdvanceTableRender === 'undefined') {
        console.warn('AdvanceTableRender not available, skip advanced table render.');
        return;
      }

      const tableContainer = this.container.querySelector('#departmentsTableContainer');
      if (!tableContainer) {
        console.warn('departmentsTableContainer not found');
        return;
      }

      const preparedData = departments.map((row) => {
        const name = row.name || row.Name || 'Unnamed';
        const faculty = row.faculty || row.Faculty || row.parent || row.Parent || 'Not specified';
        const budgetRaw = row.budget ?? row.Budget ?? null;

        return {
          name,
          faculty,
          budget_display: this.formatCurrency(budgetRaw),
          encodedName: encodeURIComponent(String(name))
        };
      });

      const schema = [
        { name: 'name', label: 'Department', type: 'text' },
        { name: 'faculty', label: 'Faculty', type: 'text' },
        { name: 'budget_display', label: 'Budget', type: 'text' }
      ];

      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      const customColumns = [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
              <!-- View -->
              <button type="button"
                      class="js-dept-view inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      data-name="{encodedName}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View
              </button>

              <!-- Edit -->
              <a href="#hr/departments/edit/{encodedName}"
                 routerLink="hr/departments/edit/{encodedName}"
                 class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M16.862 4.487l1.651-1.65a1.875 1.875 0 112.652 2.652L10.5 16.5l-4 1 1-4 9.362-9.013z" />
                </svg>
                Edit
              </a>

              <!-- Delete -->
              <button type="button"
                      class="js-dept-del inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                      data-name="{encodedName}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                        d="M9 4.5h6M4.5 7.5h15M10 10.5v6M14 10.5v6M6.75 7.5l.75 11.25h9l.75-11.25" />
                </svg>
                Delete
              </button>
            </div>
          `
        }
      ];

      this.tableRender = new AdvanceTableRender(app, {
        schema,
        data: preparedData,
        targetSelector: '#departmentsTableContainer',
        customColumns,
        enableSearch: true,
        enablePagination: true,
        pageSize: 10,
        sortConfig: {
          defaultField: 'name',
          defaultDirection: 'asc'
        }
      });

      await this.tableRender.render();
    }

    bindEvents() {
      // Refresh
      const refresh = this.container.querySelector('#deptRefreshBtn');
      if (refresh) refresh.addEventListener('click', () => this.render());

      // View
      this.container.querySelectorAll('.js-dept-view').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const encoded = e.currentTarget.getAttribute('data-name');
          const name = decodeURIComponent(encoded || '');
          if (!name) return;

          const row = this._rawDepartments.find(
            (d) => (d.name || d.Name || '').toString() === name.toString()
          );
          if (!row) {
            alert('Department not found.');
            return;
          }

          const deptName = row.name || row.Name || 'Unnamed';
          const faculty = row.faculty || row.Faculty || row.parent || row.Parent || 'Not specified';
          const budgetRaw = row.budget ?? row.Budget ?? null;
          const budget = this.formatCurrency(budgetRaw);

          this.openViewModal(row);
        });
      });

      // Delete
      this.container.querySelectorAll('.js-dept-del').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const encoded = e.currentTarget.getAttribute('data-name');
          const name = decodeURIComponent(encoded || '');
          if (!name) return;

          const ok = confirm(`Delete department "${name}"? This cannot be undone.`);
          if (!ok) return;

          try {
            if (window.hrApp?.apiService?.deleteDepartment) {
              await window.hrApp.apiService.deleteDepartment(name);
            } else if (window.HrApiService) {
              const api = new HrApiService(this.rootURL);
              await api.deleteDepartment(name);
            } else {
              throw new Error('No API service for deleteDepartment');
            }
            await this.render();
          } catch (err) {
            alert(`Delete failed: ${err?.message || 'Unknown error'}`);
          }
        });
      });
    }

    openViewModal(row) {
      const name = row.name || row.Name || 'Unnamed';
      const faculty = row.faculty || row.Faculty || row.parent || row.Parent || 'Not specified';
      const budgetRaw = row.budget ?? row.Budget ?? null;
      const budget = this.formatCurrency(budgetRaw);

      // modal container
      const overlay = HrDOMHelpers.createDiv({
        className:
          'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 js-dept-modal'
      });

      // modal card
      const card = HrDOMHelpers.createDiv({
        className:
          'bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in-up'
      });

      // title
      card.appendChild(
        HrDOMHelpers.createHeading(2, {
          className: 'text-xl font-semibold text-gray-900',
          textContent: 'Department Details'
        })
      );

      // content
      const table = HrDOMHelpers.createElement('div', {
        className: 'space-y-2',
        children: [
          HrDOMHelpers.createParagraph({
            className: 'text-gray-700',
            textContent: `Department: ${name}`
          }),
          HrDOMHelpers.createParagraph({
            className: 'text-gray-700',
            textContent: `Faculty: ${faculty}`
          }),
          HrDOMHelpers.createParagraph({
            className: 'text-gray-700',
            textContent: `Budget: ${budget}`
          })
        ]
      });

      card.appendChild(table);

      // close button
      const closeBtn = HrDOMHelpers.createButton({
        className:
          'mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700',
        text: 'Close',
        onClick: () => overlay.remove()
      });

      card.appendChild(closeBtn);
      overlay.appendChild(card);

      document.body.appendChild(overlay);
    }
  }

  window.HrDepartmentListFeature = HrDepartmentListFeature;
})();
