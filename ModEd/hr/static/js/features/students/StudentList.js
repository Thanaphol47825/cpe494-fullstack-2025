// Student List Feature using AdvanceTableRender (V2)
if (typeof HrStudentListFeature === 'undefined') {
  class HrStudentListFeature {
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
        const studentIconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>';
        
        const pageElement = helpers ? helpers.createListPageLayout({
          title: 'Student Management',
          description: 'Manage student records and academic progress',
          iconPath: studentIconPath,
          bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
          headerGradient: 'from-green-600 to-teal-600',
          cardGradient: 'from-green-500 to-teal-600',
          addButtonText: 'Add New Student',
          addButtonLink: 'hr/students/create',
          addButtonClass: HrUiComponents.buttonClasses.success,
          tableContainerId: 'studentsTableContainer',
          backButtonLink: 'hr',
          backButtonText: 'Back to HR Menu',
          backButtonClass: HrUiComponents.buttonClasses.secondary
        }) : this.#createListPageFallback();

        this.templateEngine.mainContainer.appendChild(pageElement);

        // Fetch students data
        const students = await this.api.fetchStudents();

        // Check for empty state
        if (!students || students.length === 0) {
          const containerElement = document.querySelector('#studentsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyStudentsState();
          window.hrStudentList = this;
          return;
        }

        // Use AdvanceTableRender from core
        try {
          await this.#renderWithAdvanceTableRender(students);
        } catch (error) {
          console.warn('AdvanceTableRender failed, falling back to manual render:', error);
          // Fallback to manual render if AdvanceTableRender fails
          this.#renderStudentTable(students);
        }

        // Make globally accessible for onclick handlers
        window.hrStudentList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load students: ' + error.message);
      }
    }

    async #renderWithAdvanceTableRender(students) {
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

      const formatStatus = (status) => {
        if (status === undefined || status === null) return 'N/A';
        const statusMap = { 0: 'Active', 1: 'Inactive', 2: 'Suspended' };
        return statusMap[status] || `Status ${status}`;
      };

      const formatProgram = (program) => {
        if (program === undefined || program === null) return 'N/A';
        const programMap = { 0: 'Regular', 1: 'International', 2: 'Exchange' };
        return programMap[program] || `Program ${program}`;
      };

      const preparedData = students.map(student => ({
        ...student,
        program_display: formatProgram(student.program),
        start_date_display: formatDate(student.start_date),
        status_display: formatStatus(student.status),
        full_name: `${student.first_name || ''} ${student.last_name || ''}`.trim()
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
              <button onclick="hrStudentList.editStudent('{student_code}')" 
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="hrStudentList.deleteStudent('{student_code}', '{full_name}')" 
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
        modelPath: 'hr/students',
        data: preparedData,
        targetSelector: '#studentsTableContainer',
        customColumns: customColumns
      });

      await this.tableRender.render();
    }

    #renderStudentTable(students) {
      const container = document.querySelector('#studentsTableContainer');
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

      const formatStatus = (status) => {
        if (!status && status !== 0) return 'N/A';
        const statusMap = { 0: 'Active', 1: 'Inactive', 2: 'Suspended' };
        return statusMap[status] || `Status ${status}`;
      };

      const formatProgram = (program) => {
        if (program === undefined || program === null) return 'N/A';
        const programMap = { 0: 'Regular', 1: 'International', 2: 'Exchange' };
        return programMap[program] || `Program ${program}`;
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
        'Student Code', 'Full Name', 'Email', 'Department', 'Program',
        'Start Date', 'Status', 'Gender', 'Phone Number', 'Actions'
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

      students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        // Create cells
        const cells = [
          { content: student.student_code || '', className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' },
          { content: `${student.first_name || ''} ${student.last_name || ''}`.trim(), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' },
          { content: student.email || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: student.department || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatProgram(student.program), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatDate(student.start_date), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatStatus(student.status), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: student.Gender || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: student.PhoneNumber || 'N/A', className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }
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
        const editBtn = helpers ? helpers.createActionButton('edit', null, student.student_code, 'Edit') : this.#createEditButton(student.student_code);
        editBtn.onclick = () => this.editStudent(student.student_code);

        // Delete button
        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
        const deleteBtn = helpers ? helpers.createActionButton('delete', null, student.student_code, 'Delete') : this.#createDeleteButton(student.student_code, fullName);
        deleteBtn.onclick = () => this.deleteStudent(student.student_code, fullName);

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
      container.className = 'min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8';
      // Simple fallback - just create container for table
      const wrapper = document.createElement('div');
      wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      const tableContainer = document.createElement('div');
      tableContainer.id = 'studentsTableContainer';
      wrapper.appendChild(tableContainer);
      container.appendChild(wrapper);
      return container;
    }

    async viewStudent(studentCode) {
      try {
        const student = await this.api.fetchStudent(studentCode);
        
        // Render detail view using DOM manipulation
        const container = this.templateEngine.mainContainer;
        container.innerHTML = '';

        const mainWrapper = document.createElement('div');
        mainWrapper.className = 'min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8';

        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'max-w-4xl mx-auto px-4';

        const card = document.createElement('div');
        card.className = 'bg-white rounded-3xl shadow-2xl p-8';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-6';
        title.textContent = `${student.first_name} ${student.last_name}`;

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-4';

        const fields = [
          { label: 'Code', value: student.student_code },
          { label: 'Email', value: student.email },
          { label: 'Program', value: student.program || 'N/A' },
          { label: 'Start Date', value: HrTemplates.formatDate ? HrTemplates.formatDate(student.start_date) : (student.start_date || 'N/A') },
          { label: 'Year', value: student.year || 'N/A' },
          { label: 'Status', value: student.status || 'Active' }
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
        editBtn.className = HrUiComponents.buttonClasses.success;
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => this.editStudent(studentCode);

        buttonsContainer.appendChild(backBtn);
        buttonsContainer.appendChild(editBtn);

        card.appendChild(title);
        card.appendChild(grid);
        card.appendChild(buttonsContainer);
        innerWrapper.appendChild(card);
        mainWrapper.appendChild(innerWrapper);
        container.appendChild(mainWrapper);

      } catch (error) {
        console.error('Error viewing student:', error);
        alert(`Error loading student: ${error.message}`);
      }
    }

    editStudent(studentCode) {
      window.location.href = `#hr/students/edit/${studentCode}`;
    }

    async deleteStudent(studentCode, fullName) {
      if (!confirm(`Are you sure you want to delete student "${fullName}" (${studentCode})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        // Call delete API (using POST as per backend requirement)
        const response = await fetch(`${this.rootURL}/hr/students/${studentCode}/delete`, {
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
        alert(`Student "${fullName}" deleted successfully!`);

        // Refresh the list
        await this.render();

      } catch (error) {
        console.error('Error deleting student:', error);
        alert(`Failed to delete student: ${error.message}`);
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Students',
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
    window.HrStudentListFeature = HrStudentListFeature;
  }
}
