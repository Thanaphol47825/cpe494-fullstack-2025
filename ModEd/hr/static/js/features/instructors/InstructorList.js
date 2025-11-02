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

      // Create application wrapper for AdvanceTableRender
      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      // Create custom columns for actions
      const customColumns = [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
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

      // Use AdvanceTableRender - let it fetch schema automatically via modelPath
      this.tableRender = new AdvanceTableRender(app, {
        modelPath: 'hr/instructors',
        data: preparedData,
        targetSelector: '#instructorsTableContainer',
        customColumns: customColumns
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
        'Instructor Code', 'Full Name', 'Email', 'Department', 'Start Date',
        'Academic Position', 'Dept Position', 'Salary', 'Gender', 'Phone Number', 'Actions'
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
          { content: formatDate(instructor.start_date), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatAcademicPosition(instructor.AcademicPosition), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatDepartmentPosition(instructor.DepartmentPosition), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatSalary(instructor.Salary), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: instructor.Gender || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: instructor.PhoneNumber || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }
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

        // Edit button
        const editBtn = helpers ? helpers.createActionButton('edit', null, instructor.instructor_code, 'Edit') : this.#createEditButton(instructor.instructor_code);
        editBtn.onclick = () => this.editInstructor(instructor.instructor_code);

        // Delete button
        const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim();
        const deleteBtn = helpers ? helpers.createActionButton('delete', null, instructor.instructor_code, 'Delete') : this.#createDeleteButton(instructor.instructor_code, fullName);
        deleteBtn.onclick = () => this.deleteInstructor(instructor.instructor_code, fullName);

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
        
        // Render detail view using DOM manipulation
        const container = this.templateEngine.mainContainer;
        container.innerHTML = '';

        const mainWrapper = document.createElement('div');
        mainWrapper.className = 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8';

        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'max-w-4xl mx-auto px-4';

        const card = document.createElement('div');
        card.className = 'bg-white rounded-3xl shadow-2xl p-8';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-6';
        title.textContent = `${instructor.first_name} ${instructor.last_name}`;

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-4';

        const fields = [
          { label: 'Code', value: instructor.instructor_code },
          { label: 'Email', value: instructor.email },
          { label: 'Department', value: instructor.department || 'N/A' },
          { label: 'Start Date', value: HrTemplates.formatDate ? HrTemplates.formatDate(instructor.start_date) : (instructor.start_date || 'N/A') }
        ];

        fields.forEach(field => {
          const div = document.createElement('div');
          const strong = document.createElement('strong');
          strong.textContent = `${field.label}: `;
          div.appendChild(strong);
          div.appendChild(document.createTextNode(field.value));
          grid.appendChild(div);
        });

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'mt-6 flex gap-3';

        const backBtn = document.createElement('button');
        backBtn.className = HrUiComponents.buttonClasses.secondary;
        backBtn.textContent = 'Back to List';
        backBtn.onclick = () => this.render();

        const editBtn = document.createElement('button');
        editBtn.className = HrUiComponents.buttonClasses.primary;
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => this.editInstructor(instructorCode);

        buttonsContainer.appendChild(backBtn);
        buttonsContainer.appendChild(editBtn);

        card.appendChild(title);
        card.appendChild(grid);
        card.appendChild(buttonsContainer);
        innerWrapper.appendChild(card);
        mainWrapper.appendChild(innerWrapper);
        container.appendChild(mainWrapper);

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
