// Instructor Resignation List Feature
if (typeof HrInstructorResignationListFeature === 'undefined') {
  class HrInstructorResignationListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.api = new HrApiService(this.rootURL);
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
          <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <!-- Header Section -->
              <div class="text-center mb-12">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-6">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Instructor Resignation Requests</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">Manage instructor resignation and exit processes</p>
              </div>

              <!-- Action Bar -->
              <div class="flex justify-end mb-6">
                <a routerLink="hr/resignation/instructor/create" class="${HrUiComponents.buttonClasses.success}">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  New Resignation Request
                </a>
              </div>

              <!-- Table Container -->
              <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
                <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600">
                  <h2 class="text-2xl font-semibold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Current Resignation Requests
                  </h2>
                </div>
                
                <div class="p-8">
                  <div id="resignationsTableContainer">
                    <!-- Table will be inserted here -->
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

        // Fetch resignations data
        const resignations = await this.api.fetchInstructorResignations();

        // Check for empty state
        if (!resignations || resignations.length === 0) {
          const containerElement = document.querySelector('#resignationsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyState(
            'No resignation requests found',
            'There are currently no instructor resignation requests to display.',
            'Create First Request',
            'hr/resignation/instructor/create'
          );
          window.hrInstructorResignationList = this;
          return;
        }

        // Render table
        this.#renderResignationTable(resignations);

        // Make globally accessible for onclick handlers
        window.hrInstructorResignationList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load resignations: ' + error.message);
      }
    }

    #renderResignationTable(resignations) {
      const container = document.querySelector('#resignationsTableContainer');
      if (!container) return;

      const tableHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${resignations.map(resignation => this.#renderResignationRow(resignation)).join('')}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = tableHTML;
    }

    #renderResignationRow(resignation) {
      const id = resignation.ID || resignation.id || 'N/A';
      const instructorCode = resignation.InstructorCode || resignation.instructor_code || 'N/A';
      const status = resignation.Status || resignation.status || 'Pending';
      const submissionDate = this.#formatDate(resignation.CreatedAt || resignation.created_at);
      const statusColor = this.#getStatusColor(status);

      // Note: Delete functionality not implemented as backend endpoint 
      // POST /hr/resignation-instructor-requests/:id/delete does not exist
      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${instructorCode}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-3 py-1 text-xs font-medium rounded-full ${statusColor}">${status}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${submissionDate}</td>
          <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <div class="flex gap-2 justify-center">
              <button onclick="hrInstructorResignationList.viewResignation(${id})" 
                      class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
              <button onclick="hrInstructorResignationList.editResignation(${id})" 
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    async viewResignation(resignationId) {
      try {
        const resignation = await this.api.fetchInstructorResignation(resignationId);
        
        // Render detail view
        const detailHTML = `
          <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-white rounded-3xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold mb-6">Instructor Resignation Request #${resignationId}</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div><strong>Instructor Code:</strong> ${resignation.InstructorCode || resignation.instructor_code || 'N/A'}</div>
                  <div><strong>Status:</strong> <span class="px-3 py-1 text-xs font-medium rounded-full ${this.#getStatusColor(resignation.Status || resignation.status)}">${resignation.Status || resignation.status || 'Pending'}</span></div>
                  <div><strong>Submission Date:</strong> ${this.#formatDate(resignation.CreatedAt || resignation.created_at)}</div>
                  <div><strong>Updated At:</strong> ${this.#formatDate(resignation.UpdatedAt || resignation.updated_at)}</div>
                  <div><strong>Effective Date:</strong> ${this.#formatDate(resignation.EffectiveDate || resignation.effective_date)}</div>
                </div>
                <div class="mt-6">
                  <strong>Reason:</strong>
                  <p class="mt-2 p-4 bg-gray-50 rounded-lg">${resignation.Reason || resignation.reason || 'No reason provided'}</p>
                </div>
                ${resignation.AdditionalNotes || resignation.additional_notes ? `
                  <div class="mt-4">
                    <strong>Additional Notes:</strong>
                    <p class="mt-2 p-4 bg-gray-50 rounded-lg">${resignation.AdditionalNotes || resignation.additional_notes}</p>
                  </div>
                ` : ''}
                <div class="mt-6 flex gap-3">
                  <button onclick="hrInstructorResignationList.render()" class="${HrUiComponents.buttonClasses.secondary}">
                    Back to List
                  </button>
                  <button onclick="hrInstructorResignationList.editResignation(${resignationId})" class="${HrUiComponents.buttonClasses.success}">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        this.templateEngine.mainContainer.innerHTML = detailHTML;
      } catch (error) {
        console.error('Error viewing resignation:', error);
        alert(`Error loading resignation: ${error.message}`);
      }
    }

    editResignation(resignationId) {
      window.location.href = `#hr/resignation/instructor/edit/${resignationId}`;
    }

    // Delete functionality not implemented - backend endpoint does not exist
    // Backend routes do not include: POST /hr/resignation-instructor-requests/:id/delete
    // If the endpoint is added in the future, implement like this:
    /*
    async deleteResignation(resignationId, instructorCode) {
      if (!confirm(`Are you sure you want to delete resignation request from instructor "${instructorCode}" (ID: ${resignationId})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        const response = await fetch(`${this.rootURL}/hr/resignation-instructor-requests/${resignationId}/delete`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error?.message || error?.message || `Delete failed (${response.status})`);
        }

        alert(`Resignation request from instructor "${instructorCode}" deleted successfully!`);
        await this.render();

      } catch (error) {
        console.error('Error deleting resignation:', error);
        alert(`Failed to delete resignation: ${error.message}`);
      }
    }
    */

    #formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'Invalid Date';
      }
    }

    #getStatusColor(status) {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Resignations',
        message: message,
        hasRetry: true,
        retryAction: 'window.location.reload()',
        backLink: 'hr',
        backLabel: 'Back to HR Menu'
      });
    }

    async refresh() {
      await this.render();
    }

    async approveRequest(requestId) {
      if (!confirm('Are you sure you want to approve this instructor resignation request?')) return;
      
      try {
        await this.api.reviewInstructorResignation(requestId, 'approve', '');
        alert('Request approved successfully!');
        await this.render();
      } catch (error) {
        console.error('Error approving request:', error);
        alert('Failed to approve request: ' + error.message);
      }
    }

    async rejectRequest(requestId) {
      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;
      
      try {
        await this.api.reviewInstructorResignation(requestId, 'reject', reason);
        alert('Request rejected successfully!');
        await this.render();
      } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Failed to reject request: ' + error.message);
      }
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrInstructorResignationListFeature = HrInstructorResignationListFeature;
    window.instructorResignationList = null;
  }
}
