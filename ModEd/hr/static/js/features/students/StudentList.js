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

      // Define minimal schema for AdvanceTableRender (override backend schema)
      const schema = [
        { name: 'student_code', label: 'Student Code', type: 'text' },
        { name: 'full_name', label: 'Full Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'program_display', label: 'Program', type: 'text' },
        { name: 'status_display', label: 'Status', type: 'text' }
      ];

      // Create application wrapper for AdvanceTableRender
      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      // Custom actions column only
      const customColumns = [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
              <button onclick="hrStudentList.viewStudent('{student_code}')"
                      class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
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

      // Use AdvanceTableRender from core with custom schema
      this.tableRender = new AdvanceTableRender(app, {
        schema,
        data: preparedData,
        targetSelector: '#studentsTableContainer',
        customColumns,
        enableSearch: true,
        enablePagination: true,
        pageSize: 10,
        sortConfig: {
          defaultField: 'student_code',
          defaultDirection: 'asc'
        }
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
        'Student Code', 'Full Name', 'Email', 'Program', 'Status', 'Actions'
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
          { content: formatProgram(student.program), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
          { content: formatStatus(student.status), className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }
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
        const viewBtn = helpers ? helpers.createActionButton('view', null, student.student_code, 'View') : this.#createViewButton(student.student_code);
        viewBtn.onclick = () => this.viewStudent(student.student_code);

        // Edit button
        const editBtn = helpers ? helpers.createActionButton('edit', null, student.student_code, 'Edit') : this.#createEditButton(student.student_code);
        editBtn.onclick = () => this.editStudent(student.student_code);

        // Delete button
        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
        const deleteBtn = helpers ? helpers.createActionButton('delete', null, student.student_code, 'Delete') : this.#createDeleteButton(student.student_code, fullName);
        deleteBtn.onclick = () => this.deleteStudent(student.student_code, fullName);

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

        // Remove existing modal if any
        const existing = document.getElementById('studentDetailModal');
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }

        const overlay = document.createElement('div');
        overlay.id = 'studentDetailModal';
        overlay.className = 'fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50';

        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-6 md:p-8 relative';

        modal.addEventListener('click', (e) => e.stopPropagation());
        overlay.addEventListener('click', () => overlay.remove());

        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown';
        const program = student.program ?? student.Program;
        const status = student.status ?? student.Status;

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between mb-6';
        header.innerHTML = `
          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-1">${fullName}</h2>
            <p class="text-sm text-slate-500">Student Detail Overview</p>
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

        const fields = [
          { label: 'Code', value: format(student.student_code || student.StudentCode) },
          { label: 'Email', value: format(student.email || student.Email, 'No email') },
          { label: 'Department', value: format(student.department || student.Department) },
          { label: 'Program', value: format(program) },
          { label: 'Year', value: format(student.year || student.Year) },
          { label: 'Status', value: format(status, 'Active') },
          { label: 'Advisor Code', value: format(student.advisor_code || student.AdvisorCode) },
          { label: 'Phone Number', value: format(student.phone_number || student.PhoneNumber) },
          { label: 'Citizen ID', value: format(student.citizen_id || student.CitizenID) },
          { label: 'Gender', value: format(student.gender || student.Gender) },
          { label: 'Start Date', value: formatDate(student.start_date || student.StartDate) },
          { label: 'Birth Date', value: formatDate(student.birth_date || student.BirthDate) }
        ];

        fields.forEach((field) => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">${field.label}</p>
            <p class="text-sm font-medium text-slate-800">${field.value}</p>
          `;
          grid.appendChild(div);
        });

        const buttons = document.createElement('div');
        buttons.className = 'mt-6 flex flex-wrap gap-3';
        buttons.innerHTML = `
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Back to List
          </button>
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-xl shadow-md hover:from-green-700 hover:to-teal-700"
          >
            Edit
          </button>
        `;

        const [backBtn, editBtn] = buttons.querySelectorAll('button');
        backBtn.onclick = () => {
          overlay.remove();
        };
        editBtn.onclick = () => {
          overlay.remove();
          this.editStudent(studentCode);
        };

        modal.appendChild(header);
        modal.appendChild(grid);
        modal.appendChild(buttons);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
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
