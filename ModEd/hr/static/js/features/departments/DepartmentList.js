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

        // --- Render list page ---
        const page = this.renderPage(departments);
        HrDOMHelpers.replaceContent(this.container, page);

        // --- Wire events ---
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
      return await window.hrApp.apiService.fetchDepartments();
    }

    // Build the whole page using HrDOMHelpers
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
            className: 'inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-4',
            children: [HrDOMHelpers.createIcon(iconPathFallback, { className: 'w-8 h-8 text-white' })]
          }),
          HrDOMHelpers.createHeading(1, {
            className: 'text-3xl font-bold text-gray-900 mb-2',
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
      const refreshIconPath = 'M4 4v6h6M20 20v-6h-6M5 19A9 9 0 1019 5'; // refresh-ish
      const addIconPath = 'M12 6v12m6-6H6';

      const leftCount = HrDOMHelpers.createDiv({
        className: 'flex items-center space-x-3',
        children: [
          HrDOMHelpers.createIcon(countIconPath, { className: 'w-6 h-6 text-green-600' }),
          HrDOMHelpers.createElement('span', {
            className: 'text-lg text-gray-700 font-medium',
            textContent: `${hasItems ? departments.length : 0} Department${hasItems && departments.length !== 1 ? 's' : ''}`
          })
        ]
      });

      const refreshBtn = HrDOMHelpers.createButton({
        id: 'deptRefreshBtn',
        className:
          'inline-flex items-center px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50',
        children: [
          HrDOMHelpers.createIcon(refreshIconPath, { className: 'w-5 h-5 mr-2' }),
          'Refresh'
        ]
      });

      const addLink = HrDOMHelpers.createElement('a', {
        className:
          'inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800',
        attributes: { routerLink: 'hr/departments/create', href: '#hr/departments/create' },
        children: [HrDOMHelpers.createIcon(addIconPath, { className: 'w-5 h-5 mr-2' }), 'Add Department']
      });

      const rightActions = HrDOMHelpers.createDiv({
        className: 'flex items-center gap-3',
        children: [refreshBtn, addLink]
      });

      const actionBar = HrDOMHelpers.createDiv({
        className: 'flex justify-between items-center mb-8',
        children: [leftCount, rightActions]
      });

      // --- List Section ---
      const listCard = HrDOMHelpers.createDiv({
        className: 'bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6'
      });

      if (hasItems) {
        departments.forEach((d) => listCard.appendChild(this.renderCard(d)));
      } else {
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
                  'mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800',
                attributes: { routerLink: 'hr/departments/create', href: '#hr/departments/create' },
                children: [HrDOMHelpers.createIcon(addIconPath, { className: 'w-5 h-5 mr-2' }), 'Add First Department']
              })
            ]
          })
        );
      }

      // --- Back Button ---
      const backIconPath = 'M10 19l-7-7m0 0l7-7m-7 7h18';
      const backRow = HrDOMHelpers.createDiv({
        className: 'text-center mt-8',
        children: [
          HrDOMHelpers.createElement('a', {
            className:
              'inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50',
            attributes: { routerLink: 'hr', href: '#hr' },
            children: [HrDOMHelpers.createIcon(backIconPath, { className: 'w-5 h-5 mr-2' }), 'Back to HR Menu']
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

    // Render one department "card" (DOM only)
    renderCard(row) {
      const name = row.name || row.Name || 'Unnamed';
      const faculty = row.faculty || row.Faculty || 'Not specified';
      const budgetRaw = row.budget ?? row.Budget;
      const budget = HrTemplates.formatCurrency(budgetRaw);
      const encoded = encodeURIComponent(String(name));

      const deptIconPath = 'M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7'; // simple building icon
      const editIconPath = 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      const trashIconPath = 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';

      const card = HrDOMHelpers.createDiv({
        className:
          'rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow mb-4 p-5 bg-white'
      });

      const rowWrap = HrDOMHelpers.createDiv({
        className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-4'
      });

      const left = HrDOMHelpers.createDiv({
        className: 'flex items-center gap-4'
      });

      const iconWrap = HrDOMHelpers.createDiv({
        className: 'w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center',
        children: [HrDOMHelpers.createIcon(deptIconPath, { className: 'w-6 h-6 text-white' })]
      });

      const titleWrap = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createHeading(3, {
            className: 'text-lg font-semibold text-gray-900',
            textContent: name
          }),
          HrDOMHelpers.createDiv({
            className: 'text-sm text-gray-600',
            children: [
              'Faculty: ',
              HrDOMHelpers.createElement('span', { className: 'font-medium', textContent: faculty })
            ]
          }),
          HrDOMHelpers.createDiv({
            className: 'text-sm text-gray-600',
            children: [
              'Budget: ',
              HrDOMHelpers.createElement('span', { className: 'font-medium', textContent: budget })
            ]
          })
        ]
      });

      left.appendChild(iconWrap);
      left.appendChild(titleWrap);

      const editLink = HrDOMHelpers.createElement('a', {
        className: 'inline-flex items-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100',
        attributes: {
          routerLink: `hr/departments/edit/${encoded}`,
          href: `#hr/departments/edit/${encoded}`
        },
        children: [HrDOMHelpers.createIcon(editIconPath, { className: 'w-4 h-4 mr-1' }), 'Edit']
      });

      const delBtn = HrDOMHelpers.createButton({
        className: 'js-dept-del inline-flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100',
        attributes: { 'data-name': encodeURIComponent(String(name)) },
        children: [HrDOMHelpers.createIcon(trashIconPath, { className: 'w-4 h-4 mr-1' }), 'Delete']
      });

      const right = HrDOMHelpers.createDiv({
        className: 'flex items-center gap-2',
        children: [editLink, delBtn]
      });

      rowWrap.appendChild(left);
      rowWrap.appendChild(right);
      card.appendChild(rowWrap);

      return card;
    }

    bindEvents() {
      const refresh = this.container.querySelector('#deptRefreshBtn');
      if (refresh) refresh.addEventListener('click', () => this.render());

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
