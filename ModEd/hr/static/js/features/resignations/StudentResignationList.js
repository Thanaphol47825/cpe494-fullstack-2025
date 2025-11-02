// Student Resignation List Feature
if (typeof HrStudentResignationListFeature === 'undefined') {
  class HrStudentResignationListFeature {
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
        // Build page with DOM helpers
        const pageElement = this.#buildListPageLayout();
        this.templateEngine.mainContainer.appendChild(pageElement);

        // Fetch resignations data
        const resignations = await this.api.fetchStudentResignations();

        // Check for empty state
        if (!resignations || resignations.length === 0) {
          const containerElement = document.querySelector('#resignationsTableContainer');
          containerElement.innerHTML = HrUiComponents.renderEmptyState(
            'No resignation requests found',
            'There are currently no student resignation requests to display.',
            'Create First Request',
            'hr/resignation/student/create'
          );
          window.hrStudentResignationList = this;
          return;
        }

        // Render table
        this.#renderResignationTable(resignations);

        // Make globally accessible for onclick handlers
        window.hrStudentResignationList = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load resignations: ' + error.message);
      }
    }

    #buildListPageLayout() {
      const Hel = HrDOMHelpers;

      // Main container
      const container = Hel.createDiv({
        className: 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8'
      });

      // Inner wrapper
      const wrapper = Hel.createDiv({
        className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      });

      // Header Section
      const headerSection = Hel.createDiv({
        className: 'text-center mb-12',
        children: [
          Hel.createDiv({
            className: 'inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-6',
            children: [
              Hel.createIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', {
                className: 'w-8 h-8 text-white'
              })
            ]
          }),
          Hel.createHeading(1, {
            className: 'text-4xl font-bold text-gray-900 mb-4',
            textContent: 'Student Resignation Requests'
          }),
          Hel.createParagraph({
            className: 'text-xl text-gray-600 max-w-2xl mx-auto',
            textContent: 'Manage student withdrawal and resignation requests'
          })
        ]
      });

      // Action Bar
      const actionBar = Hel.createDiv({
        className: 'flex justify-end mb-6',
        children: [
          Hel.createElement('a', {
            attributes: { 'routerLink': 'hr/resignation/student/create' },
            className: HrUiComponents.buttonClasses.success,
            children: [
              Hel.createIcon('M12 6v6m0 0v6m0-6h6m-6 0H6', {
                className: 'w-5 h-5 mr-2'
              }),
              document.createTextNode(' New Resignation Request')
            ]
          })
        ]
      });

      // Table Container
      const tableCard = Hel.createDiv({
        className: 'bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8',
        children: [
          Hel.createDiv({
            className: 'px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600',
            children: [
              Hel.createHeading(2, {
                className: 'text-2xl font-semibold text-white flex items-center',
                children: [
                  Hel.createIcon('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', {
                    className: 'w-6 h-6 mr-3'
                  }),
                  document.createTextNode(' Current Resignation Requests')
                ]
              })
            ]
          }),
          Hel.createDiv({
            className: 'p-8',
            children: [
              Hel.createDiv({
                id: 'resignationsTableContainer'
              })
            ]
          })
        ]
      });

      // Back Button
      const backButtonSection = Hel.createDiv({
        className: 'text-center',
        children: [
          Hel.createElement('a', {
            attributes: { 'routerLink': 'hr' },
            className: HrUiComponents.buttonClasses.secondary,
            children: [
              Hel.createIcon('M10 19l-7-7m0 0l7-7m-7 7h18', {
                className: 'w-5 h-5 mr-2'
              }),
              document.createTextNode(' Back to HR Menu')
            ]
          })
        ]
      });

      // Assemble page
      wrapper.appendChild(headerSection);
      wrapper.appendChild(actionBar);
      wrapper.appendChild(tableCard);
      wrapper.appendChild(backButtonSection);
      container.appendChild(wrapper);

      return container;
    }

    #renderResignationTable(resignations) {
      const container = document.querySelector('#resignationsTableContainer');
      if (!container) return;

      const tableElement = this.#buildTable(resignations);
      container.appendChild(tableElement);
    }

    #buildTable(resignations) {
      const Hel = HrDOMHelpers;

      // Table wrapper with overflow
      const tableWrapper = Hel.createDiv({
        className: 'overflow-x-auto'
      });

      // Table
      const table = Hel.createTable({
        children: [
          // Table header
          Hel.createTableHead({
            children: [
              Hel.createTableRow({
                children: [
                  Hel.createTableHeader({ text: 'ID' }),
                  Hel.createTableHeader({ text: 'Student Code' }),
                  Hel.createTableHeader({ text: 'Status' }),
                  Hel.createTableHeader({ text: 'Submission Date' }),
                  Hel.createTableHeader({ 
                    text: 'Actions',
                    className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                  })
                ]
              })
            ]
          }),
          // Table body
          Hel.createTableBody({
            children: resignations.map(resignation => this.#buildResignationRow(resignation))
          })
        ]
      });

      tableWrapper.appendChild(table);
      return tableWrapper;
    }

    #buildResignationRow(resignation) {
      const Hel = HrDOMHelpers;
      const id = resignation.ID || resignation.id || 'N/A';
      const studentCode = resignation.StudentCode || resignation.student_code || 'N/A';
      const status = resignation.Status || resignation.status || 'Pending';
      const submissionDate = this.#formatDate(resignation.CreatedAt || resignation.created_at);
      const statusColor = this.#getStatusColor(status);

      // Actions container
      const actionsContainer = Hel.createDiv({
        className: 'flex gap-2 justify-center',
        children: [
          // View button
          Hel.createButton({
            className: 'inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors',
            attributes: {
              onclick: `hrStudentResignationList.viewResignation(${id})`
            },
            children: [
              Hel.createIcon('M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', {
                className: 'w-4 h-4 mr-1'
              }),
              document.createTextNode('View')
            ]
          }),
          // Edit button
          Hel.createButton({
            className: 'inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors',
            attributes: {
              onclick: `hrStudentResignationList.editResignation(${id})`
            },
            children: [
              Hel.createIcon('M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', {
                className: 'w-4 h-4 mr-1'
              }),
              document.createTextNode('Edit')
            ]
          }),
          // Delete button
          Hel.createButton({
            className: 'inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors',
            attributes: {
              onclick: `hrStudentResignationList.deleteResignation(${id}, '${studentCode}')`
            },
            children: [
              Hel.createIcon('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', {
                className: 'w-4 h-4 mr-1'
              }),
              document.createTextNode('Delete')
            ]
          })
        ]
      });

      return Hel.createTableRow({
        className: 'hover:bg-gray-50 transition-colors',
        children: [
          Hel.createTableCell({
            className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',
            text: id
          }),
          Hel.createTableCell({
            className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
            text: studentCode
          }),
          Hel.createTableCell({
            className: 'px-6 py-4 whitespace-nowrap text-sm',
            children: [
              Hel.createElement('span', {
                className: `px-3 py-1 text-xs font-medium rounded-full ${statusColor}`,
                textContent: status
              })
            ]
          }),
          Hel.createTableCell({
            className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
            text: submissionDate
          }),
          Hel.createTableCell({
            className: 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium',
            children: [actionsContainer]
          })
        ]
      });
    }

    async viewResignation(resignationId) {
      try {
        const resignation = await this.api.fetchStudentResignation(resignationId);
        
        // Build detail view with DOM
        const detailElement = this.#buildDetailView(resignationId, resignation);
        this.templateEngine.mainContainer.innerHTML = '';
        this.templateEngine.mainContainer.appendChild(detailElement);
      } catch (error) {
        console.error('Error viewing resignation:', error);
        alert(`Error loading resignation: ${error.message}`);
      }
    }

    #buildDetailView(resignationId, resignation) {
      const Hel = HrDOMHelpers;
      const status = resignation.Status || resignation.status || 'Pending';
      const statusColor = this.#getStatusColor(status);

      // Main container
      const container = Hel.createDiv({
        className: 'min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8'
      });

      // Inner wrapper
      const wrapper = Hel.createDiv({
        className: 'max-w-4xl mx-auto px-4'
      });

      // Detail card
      const card = Hel.createDiv({
        className: 'bg-white rounded-3xl shadow-2xl p-8',
        children: [
          // Title
          Hel.createHeading(2, {
            className: 'text-2xl font-bold mb-6',
            textContent: `Student Resignation Request #${resignationId}`
          }),
          // Info grid
          Hel.createDiv({
            className: 'grid grid-cols-2 gap-4',
            children: [
              Hel.createDiv({
                children: [
                  document.createTextNode('Student Code: '),
                  Hel.createElement('strong', {
                    textContent: resignation.StudentCode || resignation.student_code || 'N/A'
                  })
                ]
              }),
              Hel.createDiv({
                children: [
                  document.createTextNode('Status: '),
                  Hel.createElement('span', {
                    className: `px-3 py-1 text-xs font-medium rounded-full ${statusColor}`,
                    textContent: status
                  })
                ]
              }),
              Hel.createDiv({
                children: [
                  document.createTextNode('Submission Date: '),
                  Hel.createElement('strong', {
                    textContent: this.#formatDate(resignation.CreatedAt || resignation.created_at)
                  })
                ]
              }),
              Hel.createDiv({
                children: [
                  document.createTextNode('Updated At: '),
                  Hel.createElement('strong', {
                    textContent: this.#formatDate(resignation.UpdatedAt || resignation.updated_at)
                  })
                ]
              })
            ]
          }),
          // Reason section
          Hel.createDiv({
            className: 'mt-6',
            children: [
              Hel.createElement('strong', {
                textContent: 'Reason:'
              }),
              Hel.createParagraph({
                className: 'mt-2 p-4 bg-gray-50 rounded-lg',
                textContent: resignation.Reason || resignation.reason || 'No reason provided'
              })
            ]
          }),
          // Buttons
          Hel.createDiv({
            className: 'mt-6 flex gap-3',
            children: [
              Hel.createButton({
                className: HrUiComponents.buttonClasses.secondary,
                attributes: {
                  onclick: 'hrStudentResignationList.render()'
                },
                text: 'Back to List'
              }),
              Hel.createButton({
                className: HrUiComponents.buttonClasses.success,
                attributes: {
                  onclick: `hrStudentResignationList.editResignation(${resignationId})`
                },
                text: 'Edit'
              })
            ]
          })
        ]
      });

      wrapper.appendChild(card);
      container.appendChild(wrapper);
      return container;
    }

    editResignation(resignationId) {
      window.location.href = `#hr/resignation/student/edit/${resignationId}`;
    }

    async deleteResignation(resignationId, studentCode) {
      if (!confirm(`Are you sure you want to delete resignation request from student "${studentCode}" (ID: ${resignationId})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        // Call delete API (using POST as per backend requirement)
        const response = await fetch(`${this.rootURL}/hr/resignation-student-requests/${resignationId}/delete`, {
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

        // Show success message
        alert(`Resignation request from student "${studentCode}" deleted successfully!`);

        // Refresh the list
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
      const errorPage = HrDOMHelpers.createErrorPage({
        title: 'Error Loading Resignations',
        message: message,
        retryText: 'Try Again',
        backText: 'Back to HR Menu',
        backUrl: `${this.rootURL}/#hr`,
        retryButtonClass: HrUiComponents.buttonClasses.danger,
        backButtonClass: `${HrUiComponents.buttonClasses.secondary} ml-3`
      });
      
      this.templateEngine.mainContainer.innerHTML = '';
      this.templateEngine.mainContainer.appendChild(errorPage);
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.HrStudentResignationListFeature = HrStudentResignationListFeature;
  }
}
