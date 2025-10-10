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
        // Create page wrapper
        const pageHTML = `
          <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Header Section -->
              <div class="text-center mb-12">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Instructor Management</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">Manage teaching staff and academic personnel</p>
              </div>

              <!-- Action Bar -->
              <div class="flex justify-end mb-6">
                <a routerLink="hr/instructors/create" class="${HrUiComponents.buttonClasses.success}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Instructor
                </a>
              </div>

              <!-- Table Container -->
              <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
                <div class="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Current Instructors
                  </h2>
                </div>
                
                <div class="p-8">
                  <div id="instructorsTableContainer">
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

        // Fetch instructors data
        const instructors = await this.api.fetchInstructors();

        // Check for empty state
        if (!instructors || instructors.length === 0) {
          const containerElement = document.querySelector('#instructorsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyState();
          window.hrInstructorList = this;
          return;
        }

        // Fetch schema from API
        const schemaResponse = await fetch(`${this.rootURL}/api/modelmeta/hr/instructors`);
        const schema = await schemaResponse.json();

        // Render table manually (simpler than AdvanceTableRender which needs template definitions)
        this.#renderInstructorTable(instructors);

        // Make globally accessible for onclick handlers
        window.hrInstructorList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load instructors: ' + error.message);
      }
    }

    #renderInstructorTable(instructors) {
      const container = document.querySelector('#instructorsTableContainer');
      if (!container) return;

      const tableHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${instructors.map(instructor => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${instructor.instructor_code || ''}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${instructor.first_name || ''} ${instructor.last_name || ''}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${instructor.email || ''}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${instructor.rank || 'N/A'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex gap-2 justify-center">
                      <button onclick="hrInstructorList.viewInstructor('${instructor.instructor_code}')" 
                              class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View
                      </button>
                      <button onclick="hrInstructorList.editInstructor('${instructor.instructor_code}')" 
                              class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                      <button onclick="hrInstructorList.deleteInstructor('${instructor.instructor_code}', '${instructor.first_name} ${instructor.last_name}')" 
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

    async viewInstructor(instructorCode) {
      try {
        const instructor = await this.api.fetchInstructor(instructorCode);
        
        // Render detail view (simplified)
        const detailHTML = `
          <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-white rounded-3xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold mb-6">${instructor.first_name} ${instructor.last_name}</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div><strong>Code:</strong> ${instructor.instructor_code}</div>
                  <div><strong>Email:</strong> ${instructor.email}</div>
                  <div><strong>Department:</strong> ${instructor.department || 'N/A'}</div>
                  <div><strong>Start Date:</strong> ${HrTemplates.formatDate(instructor.start_date)}</div>
                </div>
                <div class="mt-6 flex gap-3">
                  <button onclick="hrInstructorList.render()" class="${HrUiComponents.buttonClasses.secondary}">
                    Back to List
                  </button>
                  <button onclick="hrInstructorList.editInstructor('${instructorCode}')" class="${HrUiComponents.buttonClasses.primary}">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        this.templateEngine.mainContainer.innerHTML = detailHTML;
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
