// Company List Feature using AdvanceTableRender (V2)
if (typeof window !== 'undefined' && !window.CompanyList) {
  class CompanyList {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
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
        // Create page wrapper using DOM
        const pageElement = this.#createListPageLayout();
        this.templateEngine.mainContainer.appendChild(pageElement);

        // Fetch companies data
        const companies = await this.#fetchCompanies();

        // Check for empty state
        if (!companies || companies.length === 0) {
          const containerElement = document.querySelector('#companiesTableContainer');
          containerElement.innerHTML = this.#renderEmptyState();
          window.CompanyListInstance = this;
          return;
        }

        // Use AdvanceTableRender from core
        try {
          await this.#renderWithAdvanceTableRender(companies);
        } catch (error) {
          console.warn('AdvanceTableRender failed, falling back to manual render:', error);
          this.#renderCompanyTable(companies);
        }

        // Make globally accessible for onclick handlers
        window.CompanyListInstance = this;

      } catch (error) {
        console.error('Error creating list page:', error);
        this.#showError('Failed to load companies: ' + error.message);
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

      const iconContainer = document.createElement('div');
      iconContainer.className = 'bg-white/20 backdrop-blur-sm rounded-2xl p-4';
      
      const icon = document.createElement('svg');
      icon.className = 'w-12 h-12 text-white';
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>';
      iconContainer.appendChild(icon);

      const headerText = document.createElement('div');
      
      const title = document.createElement('h1');
      title.className = 'text-4xl font-bold';
      title.textContent = 'Company Management';
      
      const description = document.createElement('p');
      description.className = 'text-blue-100 mt-2 text-lg';
      description.textContent = 'Manage internship companies and their information';

      headerText.appendChild(title);
      headerText.appendChild(description);
      headerLeft.appendChild(iconContainer);
      headerLeft.appendChild(headerText);

      // Back button
      const backButton = document.createElement('button');
      backButton.className = 'inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg';
      backButton.onclick = () => window.location.href = '#internship';
      
      const backIcon = document.createElement('svg');
      backIcon.className = 'w-5 h-5 mr-2';
      backIcon.setAttribute('fill', 'none');
      backIcon.setAttribute('stroke', 'currentColor');
      backIcon.setAttribute('viewBox', '0 0 24 24');
      backIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>';
      
      backButton.appendChild(backIcon);
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
      cardTitle.textContent = 'Companies';

      const addButton = document.createElement('button');
      addButton.className = 'inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg font-semibold';
      addButton.onclick = () => window.location.href = '#internship/company/create';
      
      const addIcon = document.createElement('svg');
      addIcon.className = 'w-5 h-5 mr-2';
      addIcon.setAttribute('fill', 'none');
      addIcon.setAttribute('stroke', 'currentColor');
      addIcon.setAttribute('viewBox', '0 0 24 24');
      addIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>';
      
      addButton.appendChild(addIcon);
      addButton.appendChild(document.createTextNode('Add New Company'));

      cardHeader.appendChild(cardTitle);
      cardHeader.appendChild(addButton);

      const tableContainer = document.createElement('div');
      tableContainer.id = 'companiesTableContainer';
      tableContainer.className = 'p-8';

      contentCard.appendChild(cardHeader);
      contentCard.appendChild(tableContainer);

      wrapper.appendChild(header);
      wrapper.appendChild(contentCard);
      container.appendChild(wrapper);

      return container;
    }

    async #fetchCompanies() {
      const response = await fetch(`${this.rootURL}/curriculum/company/getAll`);
      const data = await response.json();
      
      if (!data.isSuccess) {
        throw new Error('Failed to fetch companies');
      }
      
      return data.result;
    }

    async #renderWithAdvanceTableRender(companies) {
      if (!window.AdvanceTableRender) {
        throw new Error('AdvanceTableRender not available');
      }

      const preparedData = companies.map(company => ({
        ...company,
        company_name: company.company_name || company.CompanyName || 'N/A',
        company_address: company.company_address || company.CompanyAddress || 'N/A'
      }));

      const app = this.templateEngine || {
        template: {},
        fetchTemplate: async () => {}
      };

      const customColumns = [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div class="flex gap-2 justify-center">
              <button onclick="window.CompanyListInstance.editCompany({ID})" 
                      class="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button onclick="window.CompanyListInstance.deleteCompany({ID}, '{company_name}')" 
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
        modelPath: 'curriculum/company',
        data: preparedData,
        targetSelector: '#companiesTableContainer',
        customColumns: customColumns
      });

      await this.tableRender.render();
    }

    #renderCompanyTable(companies) {
      const container = document.querySelector('#companiesTableContainer');
      if (!container) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'overflow-x-auto';

      const table = document.createElement('table');
      table.className = 'min-w-full divide-y divide-gray-200';

      // Header
      const thead = document.createElement('thead');
      thead.className = 'bg-gray-50';
      const headerRow = document.createElement('tr');
      
      const headers = ['ID', 'Company Name', 'Company Address', 'Actions'];
      
      headers.forEach(header => {
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

      // Body
      const tbody = document.createElement('tbody');
      tbody.className = 'bg-white divide-y divide-gray-200';

      companies.forEach(company => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        // ID cell
        const idCell = document.createElement('td');
        idCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
        idCell.textContent = company.ID || company.id || 'N/A';
        row.appendChild(idCell);

        // Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        nameCell.textContent = company.company_name || company.CompanyName || 'N/A';
        row.appendChild(nameCell);

        // Address cell
        const addressCell = document.createElement('td');
        addressCell.className = 'px-6 py-4 text-sm text-gray-500';
        addressCell.textContent = company.company_address || company.CompanyAddress || 'N/A';
        row.appendChild(addressCell);

        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';
        
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex gap-2 justify-center';

        // Edit button
        const editBtn = this.#createEditButton(company.ID || company.id);
        editBtn.onclick = () => this.editCompany(company.ID || company.id);

        // Delete button
        const companyName = company.company_name || company.CompanyName || 'Unknown';
        const deleteBtn = this.#createDeleteButton(company.ID || company.id, companyName);
        deleteBtn.onclick = () => this.deleteCompany(company.ID || company.id, companyName);

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

    #createEditButton(id) {
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No companies found</h3>
          <p class="mt-2 text-sm text-gray-500">Get started by creating a new company.</p>
          <div class="mt-6">
            <button onclick="window.location.href='#internship/company/create'" 
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Company And somethong 
            </button>
          </div>
        </div>
      `;
    }

    editCompany(id) {
      window.location.href = `#internship/company/edit/${id}`;
    }

    async deleteCompany(id, name) {
      if (!confirm(`Are you sure you want to delete company "${name}" (ID: ${id})?\n\nThis action cannot be undone.`)) {
        return;
      }

      try {
        const response = await fetch(`${this.rootURL}/curriculum/company/delete/${id}`, {
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

        alert(`Company "${name}" deleted successfully!`);
        await this.render();

      } catch (error) {
        console.error('Error deleting company:', error);
        alert(`Failed to delete company: ${error.message}`);
      }
    }

    #showError(message) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Companies</h2>
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
    window.CompanyList = CompanyList;
  }
}