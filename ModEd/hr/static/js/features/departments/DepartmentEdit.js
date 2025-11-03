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
      // --- Page wrapper (provided by your UI lib) ---
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

      // Where the form should live
      const formHost = page.querySelector('.form-container') || page;

      // --- Build form via HrDOMHelpers (no innerHTML) ---
      const form = HrDOMHelpers.createElement('form', {
        id: 'deptEditForm',
        className: 'space-y-6'
      });

      // Department Name
      const nameGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            text: 'Department Name',
            for: 'name'
          }),
          HrDOMHelpers.createInput({
            id: 'name',
            required: true,
            attributes: { name: 'name', type: 'text' },
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          }),
          HrDOMHelpers.createParagraph({
            className: 'mt-1 text-xs text-gray-500',
            text: 'Changing the name will update the record keyed by the previous name.'
          })
        ]
      });

      // Faculty
      const facultyGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            text: 'Faculty',
            for: 'faculty'
          }),
          HrDOMHelpers.createInput({
            id: 'faculty',
            required: true,
            attributes: { name: 'faculty', type: 'text' },
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          })
        ]
      });

      // Budget
      const budgetGroup = HrDOMHelpers.createDiv({
        children: [
          HrDOMHelpers.createLabel({
            className: 'block text-sm font-medium text-gray-700 mb-2',
            text: 'Annual Budget (฿)',
            for: 'budget'
          }),
          HrDOMHelpers.createInput({
            id: 'budget',
            attributes: {
              name: 'budget',
              type: 'number',
              min: '0',
              step: '1',
              inputmode: 'numeric'
            },
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          })
        ]
      });

      // Status box
      const statusBox = HrDOMHelpers.createDiv({
        id: 'formStatus',
        className: 'hidden'
      });

      // Buttons row
      const actionsRow = HrDOMHelpers.createDiv({
        className: 'flex flex-col sm:flex-row gap-4 pt-2'
      });

      // Try to use your icon paths if they expose just a "d" path; fallback to simple paths
      const savePath = (HrTemplates?.iconPaths?.saveD) || 'M5 13l4 4L19 7';
      const trashPath = (HrTemplates?.iconPaths?.trashD) || 'M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m3 0V5a2 2 0 012-2h4a2 2 0 012 2v2M4 7h16';

      const saveBtn = HrDOMHelpers.createButton({
        className: HrUiComponents.buttonClasses.success,
        type: 'submit',
        children: [
          HrDOMHelpers.createIcon(savePath, { className: 'w-5 h-5 mr-2' }),
          'Save Changes'
        ]
      });

      const deleteBtn = HrDOMHelpers.createButton({
        className: HrUiComponents.buttonClasses.danger,
        attributes: { id: 'deptDeleteBtn' },
        children: [
          HrDOMHelpers.createIcon(trashPath, { className: 'w-5 h-5 mr-2' }),
          'Delete'
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
      actionsRow.appendChild(deleteBtn);
      actionsRow.appendChild(cancelLink);

      // Assemble form
      form.appendChild(nameGroup);
      form.appendChild(facultyGroup);
      form.appendChild(budgetGroup);
      form.appendChild(statusBox);
      form.appendChild(actionsRow);

      // Mount into page
      HrDOMHelpers.replaceContent(formHost, form);
      HrDOMHelpers.replaceContent(this.container, page);

      // --- Load data and fill ---
      try {
        const dept = await window.hrApp.apiService.fetchDepartment(this.decodedName);
        this.fillForm(dept);
      } catch (err) {
        HrUiComponents.showFormError('Failed to load department.', err);
        return;
      }

      // --- Submit handler ---
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

      // --- Delete handler ---
      deleteBtn.addEventListener('click', async () => {
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
      const $ = (sel) => this.container.querySelector(sel);
      $('#name').value = (dept.name || dept.Name || this.decodedName || '').toString();
      $('#faculty').value = (dept.faculty || dept.Faculty || '').toString();
      const b = dept.budget ?? dept.Budget;
      $('#budget').value = (b === null || b === undefined) ? '' : String(b);
    }

    readForm(formEl) {
      const fd = new FormData(formEl);
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
