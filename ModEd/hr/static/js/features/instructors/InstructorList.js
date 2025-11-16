// Instructor List Feature using AdvanceTableRender (V2)
if (typeof HrInstructorListFeature === 'undefined') {
  class HrInstructorListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.api = new HrApiService(this.rootURL);
      this.tableRender = null;
    }

    async render() {
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      this.templateEngine.mainContainer.innerHTML = "";
      await this.#createListPage();
      return true;
    }

    async #createListPage() {
      try {
        // Create page wrapper using DOM helpers
        const helpers = window.HrDOMHelpers;
        const instructorIconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>';
        
        const pageElement = helpers ? helpers.createListPageLayout({
          title: 'Instructor Management',
          description: 'Manage teaching staff and academic personnel',
          iconPath: instructorIconPath,
          bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
          headerGradient: 'from-blue-600 to-purple-600',
          cardGradient: 'from-blue-500 to-purple-600',
          addButtonText: 'Add New Instructor',
          addButtonLink: 'hr/instructors/create',
          addButtonClass: HrUiComponents.buttonClasses.success,
          tableContainerId: 'instructorsTableContainer',
          backButtonLink: 'hr',
          backButtonText: 'Back to HR Menu',
          backButtonClass: HrUiComponents.buttonClasses.secondary
        }) : this.#createListPageFallback();

        this.templateEngine.mainContainer.appendChild(pageElement);

        // Fetch instructors data
        const instructors = await this.api.fetchInstructors();

        // Check for empty state
        if (!instructors || instructors.length === 0) {
          const containerElement = document.querySelector('#instructorsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyState();
          window.hrInstructorList = this;
          return;
        }

        // Use AdvanceTableRender from core
        try {
          await this.#renderWithAdvanceTableRender(instructors);
        } catch (error) {
          console.warn('AdvanceTableRender failed, falling back to manual render:', error);
          // Fallback to manual render if AdvanceTableRender fails
          this.#renderInstructorTable(instructors);
        }

        // Make globally accessible for onclick handlers
        window.hrInstructorList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load instructors: ' + error.message);
      }
    }

    async #renderWithAdvanceTableRender(instructors) {
      if (!window.AdvanceTableRender) {
        throw new Error('AdvanceTableRender not available');
      }

      // Prepare data with formatted values
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : 'N/A';
        } catch {
          return 'N/A';
        }
      };

      const formatAcademicPosition = (pos) => {
        if (pos === undefined || pos === null) return 'N/A';
        const posMap = { 0: 'None', 1: 'Assistant Prof', 2: 'Associate Prof', 3: 'Professor' };
        return posMap[pos] || `Position ${pos}`;
      };

      const formatDepartmentPosition = (pos) => {
        if (pos === undefined || pos === null) return 'N/A';
        const posMap = { 0: 'None', 1: 'Head', 2: 'Deputy', 3: 'Secretary' };
        return posMap[pos] || `Position ${pos}`;
      };

      const formatSalary = (salary) => {
        if (!salary && salary !== 0) return 'N/A';
        return `฿${Number(salary).toLocaleString('en-US')}`;
      };

      const preparedData = instructors.map(instructor => ({
        ...instructor,
        start_date_display: formatDate(instructor.start_date),
        AcademicPosition_display: formatAcademicPosition(instructor.AcademicPosition),
        DepartmentPosition_display: formatDepartmentPosition(instructor.DepartmentPosition),
        Salary_display: formatSalary(instructor.Salary),
        full_name: `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim()
      }));

      // Define minimal schema for AdvanceTableRender
      const schema = [
        { name: 'instructor_code', label: 'Instructor Code', type: 'text' },
        { name: 'full_name', label: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'start_date_display', label: 'Start Date', type: 'date' }
      ];

      // Create application wrapper for AdvanceTableRender
      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      // Actions column only
      const customColumns = [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
              <button onclick="hrInstructorList.viewInstructor('{instructor_code}')"
                      class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
              <button onclick="hrInstructorList.editInstructor('{instructor_code}')" 
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="hrInstructorList.deleteInstructor('{instructor_code}', '{full_name}')"
                      class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          `
        }
      ];

      // Use AdvanceTableRender with custom schema
      this.tableRender = new AdvanceTableRender(app, {
        schema,
        data: preparedData,
        targetSelector: '#instructorsTableContainer',
        customColumns,
        enableSearch: true,
        enablePagination: true,
        pageSize: 10,
        sortConfig: {
          defaultField: 'instructor_code',
          defaultDirection: 'asc'
        }
      });

      await this.tableRender.render();
    }

    #renderInstructorTable(instructors) {
      const container = document.querySelector('#instructorsTableContainer');
      if (!container) return;

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : 'N/A';
        } catch {
          return 'N/A';
        }
      };

      const formatAcademicPosition = (pos) => {
        if (pos === undefined || pos === null) return 'N/A';
        const posMap = { 0: 'None', 1: 'Assistant Prof', 2: 'Associate Prof', 3: 'Professor' };
        return posMap[pos] || `Position ${pos}`;
      };

      const formatDepartmentPosition = (pos) => {
        if (pos === undefined || pos === null) return 'N/A';
        const posMap = { 0: 'None', 1: 'Head', 2: 'Deputy', 3: 'Secretary' };
        return posMap[pos] || `Position ${pos}`;
      };

      const formatSalary = (salary) => {
        if (!salary && salary !== 0) return 'N/A';
        return `฿${Number(salary).toLocaleString('en-US')}`;
      };

      const helpers = window.HrDOMHelpers;
      
      // Create table wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto';

      // Create table
      const table = document.createElement('table');
      table.className = 'min-w-full divide-y divide-gray-200';

      // Create header
      const thead = document.createElement('thead');
      thead.className = 'bg-gray-50';
      const headerRow = document.createElement('tr');
      
      const headers = [
        'Instructor Code', 'Full Name', 'Email', 'Department', 'Start Date', 'Actions'
      ];
      
      headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        if (header === 'Actions') {
          th.className += ' text-center';
        }
        th.textContent = header;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');
      tbody.className = 'bg-white divide-y divide-gray-200';

      instructors.forEach(instructor => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        // Create cells
        const cells = [
          { content: instructor.instructor_code || '', className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' },
          { content: `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim(), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' },
          { content: instructor.email || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: instructor.department || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatDate(instructor.start_date), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }
        ];

        cells.forEach(cellData => {
          const cell = document.createElement('td');
          cell.className = cellData.className;
          cell.textContent = cellData.content;
          row.appendChild(cell);
        });

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';
        
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-2 justify-center';

        // View button
        const viewBtn = helpers ? helpers.createActionButton('view', null, instructor.instructor_code, 'View') : this.#createViewButton(instructor.instructor_code);
        viewBtn.onclick = () => this.viewInstructor(instructor.instructor_code);

        // Edit button
        const editBtn = helpers ? helpers.createActionButton('edit', null, instructor.instructor_code, 'Edit') : this.#createEditButton(instructor.instructor_code);
        editBtn.onclick = () => this.editInstructor(instructor.instructor_code);

        // Delete button
        const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim();
        const deleteBtn = helpers ? helpers.createActionButton('delete', null, instructor.instructor_code, 'Delete') : this.#createDeleteButton(instructor.instructor_code, fullName);
        deleteBtn.onclick = () => this.deleteInstructor(instructor.instructor_code, fullName);

        actionsContainer.appendChild(viewBtn);
        actionsContainer.appendChild(editBtn);
        actionsContainer.appendChild(deleteBtn);
        actionsCell.appendChild(actionsContainer);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      wrapper.appendChild(table);
      
      container.innerHTML = '';
      container.appendChild(wrapper);
    }

    // Helper methods for creating buttons (fallback)
    #createViewButton(code) {
      const button = document.createElement('button');
      button.className = 'inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors';
      button.type = 'button';
      
      const icon = document.createElement('svg');
      icon.className = 'w-4 h-4 mr-1';
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
      
      button.appendChild(icon);
      button.appendChild(document.createTextNode('View'));
      return button;
    }
    #createEditButton(code) {
      const button = document.createElement('button');
      button.className = 'inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors';
      button.type = 'button';
      
      const icon = document.createElement('svg');
      icon.className = 'w-4 h-4 mr-1';
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>';
      
      button.appendChild(icon);
      button.appendChild(document.createTextNode('Edit'));
      return button;
    }

    #createDeleteButton(code, fullName) {
      const button = document.createElement('button');
      button.className = 'inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors';
      button.type = 'button';
      
      const icon = document.createElement('svg');
      icon.className = 'w-4 h-4 mr-1';
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>';
      
      button.appendChild(icon);
      button.appendChild(document.createTextNode('Delete'));
      return button;
    }

    // Fallback for creating list page if helpers not available
    #createListPageFallback() {
      const container = document.createElement('div');
      container.className = 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8';
      // Simple fallback - just create container for table
      const wrapper = document.createElement('div');
      wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      const tableContainer = document.createElement('div');
      tableContainer.id = 'instructorsTableContainer';
      wrapper.appendChild(tableContainer);
      container.appendChild(wrapper);
      return container;
    }

    async viewInstructor(instructorCode) {
      try {
        const instructor = await this.api.fetchInstructor(instructorCode);

        const existing = document.getElementById('instructorDetailModal');
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }

        const overlay = document.createElement('div');
        overlay.id = 'instructorDetailModal';
        overlay.className = 'fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50';

        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-6 md:p-8 relative';

        modal.addEventListener('click', (e) => e.stopPropagation());
        overlay.addEventListener('click', () => overlay.remove());

        const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between mb-6';
        header.innerHTML = `
          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-1">${fullName}</h2>
            <p class="text-sm text-slate-500">Instructor Detail Overview</p>
          </div>
          <button class="text-slate-400 hover:text-slate-600" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        `;
        header.querySelector('button')?.addEventListener('click', () => overlay.remove());

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700';

        const format = (v, fallback = 'N/A') => (v !== null && v !== undefined && v !== '' ? v : fallback);
        const formatDate = (d) =>
          d ? (HrTemplates.formatDate ? HrTemplates.formatDate(d) : new Date(d).toLocaleDateString()) : 'N/A';
        const formatCurrency = (v) =>
          v || v === 0 ? (HrTemplates.formatCurrency ? HrTemplates.formatCurrency(v) : `฿${Number(v).toLocaleString()}`) : 'N/A';

        const fields = [
          { label: 'Code', value: format(instructor.instructor_code || instructor.InstructorCode) },
          { label: 'Email', value: format(instructor.email || instructor.Email, 'No email') },
          { label: 'Department', value: format(instructor.department || instructor.Department) },
          { label: 'Start Date', value: formatDate(instructor.start_date || instructor.StartDate) },
          { label: 'Academic Position', value: format(instructor.academic_position || instructor.AcademicPosition_display) },
          { label: 'Department Position', value: format(instructor.department_position || instructor.DepartmentPosition_display) },
          { label: 'Salary', value: formatCurrency(instructor.salary || instructor.Salary) },
          { label: 'Phone Number', value: format(instructor.phone_number || instructor.PhoneNumber) },
          { label: 'Citizen ID', value: format(instructor.citizen_id || instructor.CitizenID) },
          { label: 'Gender', value: format(instructor.gender || instructor.Gender) }
        ];

        fields.forEach((field) => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">${field.label}</p>
            <p class="text-sm font-medium text-slate-800">${field.value}</p>
          `;
          grid.appendChild(div);
        });

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'mt-6 flex flex-wrap gap-3';
        buttonsContainer.innerHTML = `
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Back to List
          </button>
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700"
          >
            Edit
          </button>
        `;

        const [backBtn, editBtn] = buttonsContainer.querySelectorAll('button');
        backBtn.onclick = () => overlay.remove();
        editBtn.onclick = () => {
          overlay.remove();
          this.editInstructor(instructorCode);
        };

        modal.appendChild(header);
        modal.appendChild(grid);
        modal.appendChild(buttonsContainer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
      } catch (error) {
        console.error('Error viewing instructor:', error);
        alert(`Error loading instructor: ${error.message}`);
      }
    }

    editInstructor(instructorCode) {
      window.location.href = `#hr/instructors/edit/${instructorCode}`;
    }

    async deleteInstructor(instructorCode, fullName) {
      if (!confirm(`Are you sure you want to delete instructor "${fullName}" (${instructorCode})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        // Call delete API (using POST as per backend requirement)
        const response = await fetch(`${this.rootURL}/hr/instructors/${instructorCode}/delete`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.message || `Delete failed (${response.status})`);
        }

        // Show success message
        alert(`Instructor "${fullName}" deleted successfully!`);

        // Refresh the list
        await this.render();

      } catch (error) {
        console.error('Error deleting instructor:', error);
        alert(`Failed to delete instructor: ${error.message}`);
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Instructors',
        message: message,
        hasRetry: true,
        retryAction: 'window.location.reload()',
        backLink: 'hr',
        backLabel: 'Back to HR Menu'
      });
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrInstructorListFeature = HrInstructorListFeature;
  }
}
