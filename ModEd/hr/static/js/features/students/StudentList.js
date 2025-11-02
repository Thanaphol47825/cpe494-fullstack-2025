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
        // Create page wrapper
        const pageHTML = `
          <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Header Section -->
              <div class="text-center mb-12">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                  </svg>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Student Management</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">Manage student records and academic progress</p>
              </div>

              <!-- Action Bar -->
              <div class="flex justify-end mb-6">
                <a routerLink="hr/students/create" class="${HrUiComponents.buttonClasses.success}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Student
                </a>
              </div>

              <!-- Table Container -->
              <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
                <div class="px-8 py-6 bg-gradient-to-r from-green-500 to-teal-600">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                    </svg>
                    Current Students
                  </h2>
                </div>
                
                <div class="p-8">
                  <div id="studentsTableContainer">
                    <!-- Table will be inserted here by AdvanceTableRender -->
                  </div>
                </div>
              </div>

              <!-- Back Button -->
              <div class="text-center">
                <a routerLink="hr" class="${HrUiComponents.buttonClasses.secondary}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to HR Menu
                </a>
              </div>
            </div>
          </div>
        `;

        const pageElement = this.templateEngine.create(pageHTML);
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

      const tableHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${students.map(student => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.student_code || ''}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(student.first_name || '') + ' ' + (student.last_name || '')}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.email || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.department || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatProgram(student.program)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(student.start_date)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatStatus(student.status)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.Gender || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.PhoneNumber || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex gap-2 justify-center">
                      <button onclick="hrStudentList.editStudent('${student.student_code}')" 
                              class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button onclick="hrStudentList.deleteStudent('${student.student_code}', '${(student.first_name || '') + ' ' + (student.last_name || '')}')" 
                              class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = tableHTML;
    }

    async viewStudent(studentCode) {
      try {
        const student = await this.api.fetchStudent(studentCode);
        
        // Render detail view (simplified)
        const detailHTML = `
          <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-white rounded-3xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold mb-6">${student.first_name} ${student.last_name}</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div><strong>Code:</strong> ${student.student_code}</div>
                  <div><strong>Email:</strong> ${student.email}</div>
                  <div><strong>Program:</strong> ${student.program || 'N/A'}</div>
                  <div><strong>Start Date:</strong> ${HrTemplates.formatDate(student.start_date)}</div>
                  <div><strong>Year:</strong> ${student.year || 'N/A'}</div>
                  <div><strong>Status:</strong> ${student.status || 'Active'}</div>
                </div>
                <div class="mt-6 flex gap-3">
                  <button onclick="hrStudentList.render()" class="${HrUiComponents.buttonClasses.secondary}">
                    Back to List
                  </button>
                  <button onclick="hrStudentList.editStudent('${studentCode}')" class="${HrUiComponents.buttonClasses.success}">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        this.templateEngine.mainContainer.innerHTML = detailHTML;
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
