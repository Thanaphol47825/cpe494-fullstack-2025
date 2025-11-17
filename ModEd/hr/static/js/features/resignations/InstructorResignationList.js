// Instructor Resignation List Feature using AdvanceTableRender (V2)
if (typeof HrInstructorResignationListFeature === 'undefined') {
  class HrInstructorResignationListFeature {
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
        const helpers = window.HrDOMHelpers;
        const iconPath = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';

        const pageElement = helpers ? helpers.createListPageLayout({
          title: 'Instructor Resignation Requests',
          description: 'Manage instructor resignation and exit processes',
          iconPath,
          bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
          headerGradient: 'from-orange-600 to-red-600',
          cardGradient: 'from-orange-500 to-red-600',
          addButtonText: 'New Resignation Request',
          addButtonLink: 'hr/resignation/instructor/create',
          addButtonClass: HrUiComponents.buttonClasses.success,
          tableContainerId: 'resignationsTableContainer',
          backButtonLink: 'hr',
          backButtonText: 'Back to HR Menu',
          backButtonClass: HrUiComponents.buttonClasses.secondary
        }) : this.#createListPageFallback();

        this.templateEngine.mainContainer.appendChild(pageElement);

        const resignations = await this.api.fetchInstructorResignations();

        if (!resignations || resignations.length === 0) {
          const containerElement = document.querySelector('#resignationsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyState(
            'No resignation requests found',
            'There are currently no instructor resignation requests to display.',
            'Create First Request',
            'hr/resignation/instructor/create'
          );
          window.hrInstructorResignationList = this;
          window.instructorResignationList = this;
          return;
        }

        try {
          await this.#renderWithAdvanceTableRender(resignations);
        } catch (error) {
          console.warn('AdvanceTableRender failed, falling back to manual render:', error);
          this.#renderResignationTable(resignations);
        }

        window.hrInstructorResignationList = this;
        window.instructorResignationList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load resignations: ' + error.message);
      }
    }

    async #renderWithAdvanceTableRender(resignations) {
      if (!window.AdvanceTableRender) {
        throw new Error('AdvanceTableRender not available');
      }

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return !isNaN(date.getTime())
            ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A';
        } catch {
          return 'N/A';
        }
      };

      const preparedData = resignations.map((resignation) => {
        const requestId = resignation.ID ?? resignation.id ?? resignation.request_id ?? '';
        const instructorCode = resignation.InstructorCode ?? resignation.instructor_code ?? 'N/A';
        const status = resignation.Status ?? resignation.status ?? 'Pending';

        return {
          ...resignation,
          request_id: requestId,
          instructor_code: instructorCode,
          status_display: this.#formatStatus(status),
          submission_date_display: formatDate(resignation.CreatedAt ?? resignation.created_at),
          status_badge_class: this.#getStatusColorClass(status)
        };
      });

      const schema = [
        { name: 'request_id', label: 'Request ID', type: 'text' },
        { name: 'instructor_code', label: 'Instructor Code', type: 'text' },
        { name: 'status_display', label: 'Status', type: 'text' },
        { name: 'submission_date_display', label: 'Submitted At', type: 'date' }
      ];

      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      const customColumns = [
        {
          name: 'status_display',
          template: `
            <span class="px-3 py-1 text-xs font-medium rounded-full {status_badge_class}">
              {status_display}
            </span>
          `
        },
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
              <button onclick="hrInstructorResignationList.viewResignation('{request_id}')"
                      class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
              <button onclick="hrInstructorResignationList.editResignation('{request_id}')"
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="hrInstructorResignationList.deleteResignation('{request_id}', '{instructor_code}')"
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

      this.tableRender = new AdvanceTableRender(app, {
        schema,
        data: preparedData,
        targetSelector: '#resignationsTableContainer',
        customColumns,
        enableSearch: true,
        enablePagination: true,
        pageSize: 10,
        sortConfig: {
          defaultField: 'request_id',
          defaultDirection: 'desc'
        }
      });

      await this.tableRender.render();
    }

    #renderResignationTable(resignations) {
      const container = document.querySelector('#resignationsTableContainer');
      if (!container) return;

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return !isNaN(date.getTime())
            ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A';
        } catch {
          return 'N/A';
        }
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto';

      const table = document.createElement('table');
      table.className = 'min-w-full divide-y divide-gray-200';

      const thead = document.createElement('thead');
      thead.className = 'bg-gray-50';
      const headerRow = document.createElement('tr');
      const headers = ['Request ID', 'Instructor Code', 'Status', 'Submitted At', 'Actions'];
      headers.forEach((header) => {
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

      const tbody = document.createElement('tbody');
      tbody.className = 'bg-white divide-y divide-gray-200';

      resignations.forEach((resignation) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        const requestId = resignation.ID ?? resignation.id ?? '';
        const instructorCode = resignation.InstructorCode ?? resignation.instructor_code ?? 'N/A';
        const status = resignation.Status ?? resignation.status ?? 'Pending';
        const submissionDate = formatDate(resignation.CreatedAt ?? resignation.created_at);

        const cells = [
          { content: requestId, className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' },
          { content: instructorCode, className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' },
          {
            content: '',
            className: 'px-6 py-4 whitespace-nowrap text-sm',
            render: () => {
              const span = document.createElement('span');
              span.className = `px-3 py-1 text-xs font-medium rounded-full ${this.#getStatusColorClass(status)}`;
              span.textContent = this.#formatStatus(status);
              return span;
            }
          },
          { content: submissionDate, className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }
        ];

        cells.forEach((cellData) => {
          const cell = document.createElement('td');
          cell.className = cellData.className;
          if (cellData.render) {
            cell.appendChild(cellData.render());
          } else {
            cell.textContent = cellData.content;
          }
          row.appendChild(cell);
        });

        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-2 justify-center';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => this.viewResignation(requestId);

        const editBtn = document.createElement('button');
        editBtn.className = 'inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => this.editResignation(requestId);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => this.deleteResignation(requestId, instructorCode);

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

    #createListPageFallback() {
      const container = document.createElement('div');
      container.className = 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8';

      const wrapper = document.createElement('div');
      wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

      const tableCard = document.createElement('div');
      tableCard.className = 'bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8';

      const tableContainer = document.createElement('div');
      tableContainer.id = 'resignationsTableContainer';

      tableCard.appendChild(tableContainer);
      wrapper.appendChild(tableCard);
      container.appendChild(wrapper);
      return container;
    }

    async viewResignation(resignationId) {
      try {
        const resignation = await this.api.fetchInstructorResignation(resignationId);

        const existing = document.getElementById('instructorResignationDetailModal');
        if (existing && existing.parentNode) {
          existing.parentNode.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'instructorResignationDetailModal';
        overlay.className = 'fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50';

        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 p-6 md:p-8 relative';
        modal.addEventListener('click', (e) => e.stopPropagation());
        overlay.addEventListener('click', () => overlay.remove());

        const header = document.createElement('div');
        header.className = 'flex items-start justify-between mb-6';
        header.innerHTML = `
          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-1">Resignation Request #${resignationId}</h2>
            <p class="text-sm text-slate-500">Instructor ${resignation.InstructorCode || resignation.instructor_code || 'N/A'}</p>
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

        const fields = [
          { label: 'Instructor Code', value: resignation.InstructorCode || resignation.instructor_code || 'N/A' },
          { label: 'Status', value: this.#formatStatus(resignation.Status || resignation.status) },
          { label: 'Submitted At', value: this.#formatDate(resignation.CreatedAt || resignation.created_at) },
          { label: 'Updated At', value: this.#formatDate(resignation.UpdatedAt || resignation.updated_at) },
          { label: 'Effective Date', value: this.#formatDate(resignation.EffectiveDate || resignation.effective_date) }
        ];

        fields.forEach((field) => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">${field.label}</p>
            <p class="text-sm font-medium text-slate-800">${field.value}</p>
          `;
          grid.appendChild(div);
        });

        const reasonSection = document.createElement('div');
        reasonSection.className = 'mt-6';
        reasonSection.innerHTML = `
          <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Reason</p>
          <p class="text-sm font-medium text-slate-800 bg-slate-50 rounded-xl p-4">${resignation.Reason || resignation.reason || 'No reason provided'}</p>
        `;

        if (resignation.AdditionalNotes || resignation.additional_notes) {
          const notes = document.createElement('div');
          notes.className = 'mt-4';
          notes.innerHTML = `
            <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Additional Notes</p>
            <p class="text-sm font-medium text-slate-800 bg-slate-50 rounded-xl p-4">${resignation.AdditionalNotes || resignation.additional_notes}</p>
          `;
          reasonSection.appendChild(notes);
        }

        const buttons = document.createElement('div');
        buttons.className = 'mt-6 flex flex-wrap gap-3';
        buttons.innerHTML = `
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm">
            Back to List
          </button>
          <button type="button"
                  class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl shadow-md hover:from-orange-700 hover:to-red-700">
            Edit
          </button>
        `;

        const [backBtn, editBtn] = buttons.querySelectorAll('button');
        backBtn.onclick = () => overlay.remove();
        editBtn.onclick = () => {
          overlay.remove();
          this.editResignation(resignationId);
        };

        modal.appendChild(header);
        modal.appendChild(grid);
        modal.appendChild(reasonSection);
        modal.appendChild(buttons);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
      } catch (error) {
        console.error('Error viewing resignation:', error);
        alert(`Error loading resignation: ${error.message}`);
      }
    }

    editResignation(resignationId) {
      window.location.href = `#hr/resignation/instructor/edit/${resignationId}`;
    }

    async deleteResignation(resignationId, instructorCode) {
      if (!confirm(`Are you sure you want to delete resignation request from instructor "${instructorCode}" (ID: ${resignationId})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        await this.api.deleteInstructorResignation(resignationId);
        alert(`Resignation request for instructor "${instructorCode}" deleted successfully!`);
        await this.render();
      } catch (error) {
        console.error('Error deleting resignation:', error);
        alert(`Failed to delete resignation: ${error.message}`);
      }
    }

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

    #formatStatus(status) {
      return status || 'Pending';
    }

    #getStatusColorClass(status) {
      const statusLower = (status || '').toLowerCase();
      switch (statusLower) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
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

  if (typeof window !== 'undefined') {
    window.HrInstructorResignationListFeature = HrInstructorResignationListFeature;
    window.hrInstructorResignationList = null;
    window.instructorResignationList = null;
  }
}
