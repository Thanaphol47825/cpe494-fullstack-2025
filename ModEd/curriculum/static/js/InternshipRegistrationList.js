// Internship Registration List Feature using AdvanceTableRender
if (typeof window !== 'undefined' && !window.InternshipRegistrationList) {
  class InternshipRegistrationList {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
      this.tableRender = null;
      this.userRole = localStorage.getItem('role') || 'Student'; // Default to Student if not set
      this.currentUserId = parseInt(localStorage.getItem('userId')) || null; // Student ID for Student role
    }

    // Check if user can edit/delete a registration
    #canModifyRegistration(registration) {
      const userRole = this.userRole;
      
      if (userRole === 'Admin') {
        return true; // Admin can modify everything
      }
      
      if (userRole === 'Instructor') {
        return false; // Instructor can only read
      }
      
      if (userRole === 'Student') {
        // Student can only modify their own registrations
        console.log("this currentUserId:", this.currentUserId, "registration.StudentId:", registration.StudentId, "registration.student_id:", registration.student_id);
        return registration.StudentId === this.currentUserId || registration.student_id === this.currentUserId;
      }
      
      return false;
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
        // Create page wrapper using DOM
        const pageElement = this.#createListPageLayout();
        this.templateEngine.mainContainer.appendChild(pageElement);

        // Fetch registrations data
        const registrations = await this.#fetchRegistrations();

        // Check for empty state
        if (!registrations || registrations.length === 0) {
          const containerElement = document.querySelector('#registrationsTableContainer');
          containerElement.innerHTML = this.#renderEmptyState();
          window.InternshipRegistrationListInstance = this;
          return;
        }

        // Use AdvanceTableRender from core
        try {
          await this.#renderWithAdvanceTableRender(registrations);
        } catch (error) {
          console.warn('AdvanceTableRender failed, falling back to manual render:', error);
          this.#renderRegistrationTable(registrations);
        }

        // Make globally accessible for onclick handlers
        window.InternshipRegistrationListInstance = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load internship registrations: ' + error.message);
      }
    }

    #createListPageLayout() {
      const container = document.createElement('div');
      container.className = 'min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8';

      const wrapper = document.createElement('div');
      wrapper.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

      // Header section
      const header = document.createElement('div');
      header.className = 'mb-8';

      const headerCard = document.createElement('div');
      headerCard.className = 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white';

      const headerContent = document.createElement('div');
      headerContent.className = 'flex items-center justify-between';

      const headerLeft = document.createElement('div');
      headerLeft.className = 'flex items-center space-x-4';

      const headerText = document.createElement('div');
      
      const title = document.createElement('h1');
      title.className = 'text-4xl font-bold';
      title.textContent = 'Internship Registrations';
      
      const description = document.createElement('p');
      description.className = 'text-blue-100 mt-2 text-lg';
      description.textContent = 'Manage student internship registrations and approvals';

      headerText.appendChild(title);
      headerText.appendChild(description);
      headerLeft.appendChild(headerText);

      // Back button
      const backButton = document.createElement('button');
      backButton.className = 'inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg';
      backButton.onclick = () => window.location.href = '#internship';
      backButton.appendChild(document.createTextNode('Back to Internship'));

      headerContent.appendChild(headerLeft);
      headerContent.appendChild(backButton);
      headerCard.appendChild(headerContent);
      header.appendChild(headerCard);

      // Content card
      const contentCard = document.createElement('div');
      contentCard.className = 'bg-white rounded-3xl shadow-2xl overflow-hidden';

      const cardHeader = document.createElement('div');
      cardHeader.className = 'bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 flex items-center justify-between';

      const cardTitle = document.createElement('h2');
      cardTitle.className = 'text-2xl font-bold text-white';
      cardTitle.textContent = 'Registration List';

      // Show Add button only for Admin and Student (not Instructor)
      if (this.userRole === 'Admin' || this.userRole === 'Student') {
        const addButton = document.createElement('button');
        addButton.className = 'inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg font-semibold';
        addButton.onclick = () => window.location.href = '#internship/internshipregistration/create';
        addButton.appendChild(document.createTextNode('Add New Registration'));
        cardHeader.appendChild(addButton);
      }

      cardHeader.appendChild(cardTitle);
      if (cardHeader.querySelector('button')) {
        // If button exists, keep the flex layout
      } else {
        cardHeader.classList.remove('justify-between');
      }

      const tableContainer = document.createElement('div');
      tableContainer.id = 'registrationsTableContainer';
      tableContainer.className = 'p-8';

      contentCard.appendChild(cardHeader);
      contentCard.appendChild(tableContainer);

      wrapper.appendChild(header);
      wrapper.appendChild(contentCard);
      container.appendChild(wrapper);

      return container;
    }

    async #fetchRegistrations() {
      const response = await fetch(`${this.rootURL}/curriculum/internshipRegistration/getAll`);
      const data = await response.json();
      
      if (!data.isSuccess) {
        throw new Error('Failed to fetch internship registrations');
      }
      
      let registrations = data.result;
      
      // Filter based on role
      if (this.userRole === 'Student') {
        // Students only see their own registrations
        registrations = registrations.filter(reg => 
          reg.StudentId === this.currentUserId || reg.student_id === this.currentUserId
        );
      }
      // Admin and Instructor can see all registrations
      
      return registrations;
    }

    async #renderWithAdvanceTableRender(registrations) {
      if (!window.AdvanceTableRender) {
        throw new Error('AdvanceTableRender not available');
      }

      const preparedData = registrations.map(reg => ({
        ...reg,
        // Ensure StudentId is available (use either field name from API)
        StudentId: reg.StudentId || reg.student_id,
        student_id: reg.StudentId || reg.student_id,
        student_name: reg.Student?.Student?.first_name && reg.Student?.Student?.last_name 
          ? `${reg.Student.Student.first_name} ${reg.Student.Student.last_name}`
          : 'N/A',
        student_code: reg.Student?.Student?.student_code || 'N/A',
        company_name: reg.Company?.company_name || 'N/A',
        turnin_date_formatted: reg.turnin_date ? new Date(reg.turnin_date).toLocaleDateString() : 'N/A',
        approval_university_status: reg.approval_university_status || 'Not Started',
        approval_company_status: reg.approval_company_status || 'Not Started'
      }));

      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      const customColumns = [
        {
          name: 'student_code',
          label: 'Student Code',
          template: '{student_code}'
        },
        {
          name: 'student_name',
          label: 'Student Name',
          template: '{student_name}'
        },
        {
          name: 'company_name',
          label: 'Company',
          template: '{company_name}'
        },
        {
          name: 'turnin_date_formatted',
          label: 'Turn-in Date',
          template: '{turnin_date_formatted}'
        },
        {
          name: 'approval_university_status',
          label: 'University Status',
          template: `
            <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full
              {approval_university_status|equals:Approved|then:bg-green-100 text-green-800}
              {approval_university_status|equals:Rejected|then:bg-red-100 text-red-800}
              {approval_university_status|equals:In Progress|then:bg-yellow-100 text-yellow-800}
              {approval_university_status|equals:Not Started|then:bg-gray-100 text-gray-800}">
              {approval_university_status}
            </span>
          `
        },
        {
          name: 'approval_company_status',
          label: 'Company Status',
          template: `
            <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full
              {approval_company_status|equals:Approved|then:bg-green-100 text-green-800}
              {approval_company_status|equals:Rejected|then:bg-red-100 text-red-800}
              {approval_company_status|equals:In Progress|then:bg-yellow-100 text-yellow-800}
              {approval_company_status|equals:Not Started|then:bg-gray-100 text-gray-800}">
              {approval_company_status}
            </span>
          `
        },
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2">
              <button onclick="window.InternshipRegistrationListInstance.checkAndEdit({ID}, {StudentId})" 
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors"
                      id="edit-btn-{ID}">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="window.InternshipRegistrationListInstance.checkAndDelete({ID}, '{student_name}', {StudentId})" 
                      class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors"
                      id="delete-btn-{ID}">
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
        modelPath: 'curriculum/internshipRegistration',
        schema: customColumns.map(col => ({ 
          name: col.name, 
          label: col.label,
          display: false  // Hide schema columns, only use for sorting
        })), 
        data: preparedData,
        targetSelector: '#registrationsTableContainer',
        customColumns: customColumns,

        enableSearch: true,
        searchConfig: {
          placeholder: "Search registrations...",
          fields: [
            { value: "all", label: "All" },
            { value: "student_code", label: "Student Code" },
            { value: "student_name", label: "Student Name" },
            { value: "company_name", label: "Company" },
            { value: "approval_university_status", label: "University Status" },
            { value: "approval_company_status", label: "Company Status" }
          ]
        },

        enableSorting: true,
        sortConfig: {
          defaultField: "ID",
          defaultDirection: "desc"
        },

        enablePagination: true,
        pageSize: 10
      });

      await this.tableRender.render();
    }

    #renderRegistrationTable(registrations) {
      const container = document.querySelector('#registrationsTableContainer');
      if (!container) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto';

      const table = document.createElement('table');
      table.className = 'min-w-full divide-y divide-gray-200';

      // Header
      const thead = document.createElement('thead');
      thead.className = 'bg-gray-50';
      const headerRow = document.createElement('tr');
      
      const headers = ['ID', 'Student Code', 'Student Name', 'Company', 'Turn-in Date', 'University Status', 'Company Status', 'Actions'];
      console.log("=====================================================");
      headers.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = header;
        console.log(header);
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body
      const tbody = document.createElement('tbody');
      tbody.className = 'bg-white divide-y divide-gray-200';

      registrations.forEach(reg => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        // ID cell
        const idCell = document.createElement('td');
        idCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
        idCell.textContent = reg.ID || 'N/A';
        row.appendChild(idCell);

        // Student Code cell
        const codeCell = document.createElement('td');
        codeCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        codeCell.textContent = reg.Student?.Student?.student_code || 'N/A';
        row.appendChild(codeCell);

        // Student Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        nameCell.textContent = reg.Student?.Student?.first_name && reg.Student?.Student?.last_name
          ? `${reg.Student.Student.first_name} ${reg.Student.Student.last_name}`
          : 'N/A';
        row.appendChild(nameCell);

        // Company cell
        const companyCell = document.createElement('td');
        companyCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        companyCell.textContent = reg.Company?.company_name || 'N/A';
        row.appendChild(companyCell);

        // Turn-in Date cell
        const dateCell = document.createElement('td');
        dateCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
        dateCell.textContent = reg.turnin_date ? new Date(reg.turnin_date).toLocaleDateString() : 'N/A';
        row.appendChild(dateCell);

        // University Status cell
        const uniStatusCell = document.createElement('td');
        uniStatusCell.className = 'px-6 py-4 whitespace-nowrap';
        uniStatusCell.appendChild(this.#createStatusBadge(reg.approval_university_status || 'Not Started'));
        row.appendChild(uniStatusCell);

        // Company Status cell
        const compStatusCell = document.createElement('td');
        compStatusCell.className = 'px-6 py-4 whitespace-nowrap';
        compStatusCell.appendChild(this.#createStatusBadge(reg.approval_company_status || 'Not Started'));
        row.appendChild(compStatusCell);

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium';
        
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-2';

        // Check if user can modify this registration
        const canModify = this.#canModifyRegistration(reg);
        
        if (canModify) {
          // Edit button
          const editBtn = this.#createEditButton(reg.ID);
          editBtn.onclick = () => this.editRegistration(reg.ID);

          // Delete button
          const studentName = reg.Student?.Student?.first_name && reg.Student?.Student?.last_name
            ? `${reg.Student.Student.first_name} ${reg.Student.Student.last_name}`
            : 'Unknown';
          const deleteBtn = this.#createDeleteButton(reg.ID, studentName);
          deleteBtn.onclick = () => this.deleteRegistration(reg.ID, studentName);

          actionsContainer.appendChild(editBtn);
          actionsContainer.appendChild(deleteBtn);
        } else {
          // Show "View Only" for Instructor or other students' records
          const viewOnlySpan = document.createElement('span');
          viewOnlySpan.className = 'text-sm text-gray-500 italic';
          viewOnlySpan.textContent = this.userRole === 'Instructor' ? 'View Only' : 'No Access';
          actionsContainer.appendChild(viewOnlySpan);
        }
        actionsCell.appendChild(actionsContainer);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      wrapper.appendChild(table);
      
      container.innerHTML = '';
      container.appendChild(wrapper);
    }

    #createStatusBadge(status) {
      const badge = document.createElement('span');
      badge.className = 'inline-flex px-3 py-1 text-xs font-semibold rounded-full';
      badge.textContent = status;

      switch (status) {
        case 'Approved':
          badge.className += ' bg-green-100 text-green-800';
          break;
        case 'Rejected':
          badge.className += ' bg-red-100 text-red-800';
          break;
        case 'In Progress':
          badge.className += ' bg-yellow-100 text-yellow-800';
          break;
        case 'Not Started':
        default:
          badge.className += ' bg-gray-100 text-gray-800';
          break;
      }

      return badge;
    }

    #createEditButton(id) {
      const button = document.createElement('button');
      button.className = 'inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors';
      button.type = 'button';
      button.appendChild(document.createTextNode('Edit'));
      return button;
    }

    #createDeleteButton(id, name) {
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

    #renderEmptyState() {
      return `
        <div class="text-center py-12">
          <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No registrations found</h3>
          <p class="mt-2 text-sm text-gray-500">Get started by creating a new internship registration.</p>
          <div class="mt-6">
            <button onclick="window.location.href='#internship/internshipregistration/create'" 
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Registration
            </button>
          </div>
        </div>
      `;
    }

    // Wrapper methods with role checking
    checkAndEdit(id, studentId) {
      const registration = { ID: id, StudentId: studentId };
      
      if (!this.#canModifyRegistration(registration)) {
        alert('Access Denied: You do not have permission to edit this registration.');
        return;
      }
      
      this.editRegistration(id);
    }

    checkAndDelete(id, studentName, studentId) {
      const registration = { ID: id, StudentId: studentId };
      
      if (!this.#canModifyRegistration(registration)) {
        alert('Access Denied: You do not have permission to delete this registration.');
        return;
      }
      
      this.deleteRegistration(id, studentName);
    }

    editRegistration(id) {
      window.location.href = `#internship/internshipregistration/edit/${id}`;
    }

    async deleteRegistration(id, studentName) {
      if (!confirm(`Are you sure you want to delete registration for "${studentName}" (ID: ${id})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        const response = await fetch(`${this.rootURL}/curriculum/internshipRegistration/delete/${id}`, {
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

        alert(`Registration for "${studentName}" deleted successfully!`);
        await this.render();

      } catch (error) {
        console.error('Error deleting registration:', error);
        alert(`Failed to delete registration: ${error.message}`);
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Registrations</h2>
              <p class="text-red-600 mt-2">${message}</p>
              <div class="mt-4 flex gap-3">
                <button onclick="window.location.reload()" 
                        class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Retry
                </button>
                <button onclick="window.location.href='#internship'" 
                        class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Back to Internship
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (typeof window !== 'undefined') {
    window.InternshipRegistrationList = InternshipRegistrationList;
  }
}
