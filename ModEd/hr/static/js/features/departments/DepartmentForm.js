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
      // Page wrapper (your UI component)
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

      // Find where the form should be placed
      const formHost =
        page.querySelector('.formCard .container, .formCard .form-container') ||
        page.querySelector('.featureCard') ||
        page.querySelector('.form-container') ||
        page;

      // --- Build the form with HrDOMHelpers ---
      const form = HrDOMHelpers.createElement('form', {
        id: 'deptForm',
        className: 'space-y-6'
      });

      // Small helper to create a red required asterisk
      const requiredStar = () =>
        HrDOMHelpers.createElement('span', {
          className: 'text-red-500',
          textContent: ' *'
        });

      // Department Name
      const nameGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            for: 'name',
            children: ['Department Name', requiredStar()]
          }),
          HrDOMHelpers.createInput({
            id: 'name',
            required: true,
            attributes: { name: 'name', type: 'text' },
            className:
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          })
        ]
      });

      // Faculty
      const facultyGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            for: 'parent',
            children: ['Faculty', requiredStar()]
          }),
          HrDOMHelpers.createInput({
            id: 'parent',
            required: true,
            attributes: { name: 'parent', type: 'text' },
            className:
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          })
        ]
      });

      // Budget
      const budgetGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            for: 'budget',
            text: 'Annual Budget (฿)'
          }),
          HrDOMHelpers.createInput({
            id: 'budget',
            attributes: {
              name: 'budget',
              type: 'number',
              min: '0',
              step: '1',
              placeholder: '0',
              inputmode: 'numeric'
            },
            className:
              'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          })
        ]
      });

      // Status area
      const statusBox = HrDOMHelpers.createDiv({
        id: 'formStatus',
        className: 'hidden'
      });

      // Actions row
      const actionsRow = HrDOMHelpers.createDiv({
        className: 'flex flex-col sm:flex-row gap-4 pt-2'
      });

      // Prefer a simple "d" path if available; otherwise fall back
      const savePath =
        (HrTemplates?.iconPaths?.saveD) || 'M5 13l4 4L19 7';

      const saveBtn = HrDOMHelpers.createButton({
        type: 'submit',
        className: HrUiComponents.buttonClasses.success,
        children: [
          HrDOMHelpers.createIcon(savePath, { className: 'w-5 h-5 mr-2' }),
          'Save Department'
        ]
      });

      const cancelLink = HrDOMHelpers.createElement('a', {
        className: HrUiComponents.buttonClasses.secondary,
        attributes: {
          routerLink: 'hr/departments',
          href: '#hr/departments'
        },
        textContent: 'Cancel'
      });

      actionsRow.appendChild(saveBtn);
      actionsRow.appendChild(cancelLink);

      // Assemble form
      form.appendChild(nameGroup);
      form.appendChild(facultyGroup);
      form.appendChild(budgetGroup);
      form.appendChild(statusBox);
      form.appendChild(actionsRow);

      // Mount
      HrDOMHelpers.replaceContent(formHost, form);
      HrDOMHelpers.replaceContent(this.container, page);

      // Submit handler
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        HrUiComponents.hideFormResult();

        const data = this.readForm(form);
        console.log('[dept] payload before send:', data);
        try {
          const created = await window.hrApp.apiService.createDepartment(data);
          console.log('[dept] server ok:', created);
          HrUiComponents.showFormSuccess('Department created successfully.', created);
          setTimeout(() => this.templateEngine.routerLinks.navigateTo('hr/departments'), 900);
        } catch (err) {
          HrUiComponents.showFormError('Failed to create department.', err);
          try {
            const r = await fetch(`${window.hrApp.apiService.rootURL}/hr/departments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            console.log('[dept] debug status:', r.status, r.statusText);
            console.log('[dept] debug text:', await r.text());
          } catch {}
          throw e;
        }
      });
    }

    readForm(form) {
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const parent = (fd.get('parent') || '').toString().trim();
      const budgetRaw = fd.get('budget');

      const payload = { name, parent };
      if (budgetRaw != null && String(budgetRaw).trim() !== '') {
        const n = Number(String(budgetRaw).replace(/,/g, ''));
        if (!Number.isNaN(n)) payload.budget = n;
      }
      return payload;
    }
  }

  window.HrDepartmentFormFeature = HrDepartmentFormFeature;
})();
