if (typeof window !== 'undefined' && !window.ApplicantTable) {
  class ApplicantTable {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || 
                      this.app?.mainContainer || 
                      document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? '';
      
      this.table = null;
      this.ui = null;
      this.$tableHost = null;
      this.service = null;
      this.importService = null;
    }

    async render() {
      if (!this.container) return false;

      this.service = new window.ApplicantService(this.rootURL);
      this.importService = new window.ApplicantImportService(this.rootURL);
      this.container.innerHTML = '';

      const root = await RecruitTableTemplate.getTable({
        title: '🧑‍💼 Applicant Management',
        subtitle: 'Browse, import, and edit applicants',
        tableId: 'applicant-table',
        panelTitle: 'Applicant Form',
        colorPrimary: '#2563eb',
        colorAccent: '#1e40af',
        iconPath: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z'
      }, 'manage');

      this.container.appendChild(root);
      this.ui = RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicantMessages',
        resultId: 'applicantResult'
      });

      this.$tableHost = root.querySelector('#recruit-table-container');
      if (this.$tableHost) {
        this.$tableHost.style.overflowY = 'auto';
        this.$tableHost.style.maxHeight = '80vh';
      }

      root.querySelector('[data-action="import"]')?.addEventListener('click', () => this.handleImport());
      root.querySelector('[data-action="create"]')?.addEventListener('click', () => this.handleCreate());

      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicant',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: await RecruitTableTemplate.getDefaultColumns(),
        
        enableSearch: true,
        enableSorting: true,
        enablePagination: true,
        pageSize: 10,
        
        searchConfig: {
          placeholder: "Search applicants...",
          fields: [
            { value: "all", label: "All Fields" },
            { value: "first_name", label: "First Name" },
            { value: "last_name", label: "Last Name" },
            { value: "email", label: "Email" },
            { value: "phone_number", label: "Phone Number" },
            { value: "high_school_program", label: "High School Program" }
          ]
        },
        
        sortConfig: {
          defaultField: "id",
          defaultDirection: "asc"
        }
      });

      await this.table.loadSchema();
      
      this.table.schema = this.table.schema.map(col => {
        const hideColumns = [
          'created_at', 'updated_at', 'deleted_at',
          'tgat1', 'tgat2', 'tgat3',
          'tpat1', 'tpat2', 'tpat3', 'tpat4', 'tpat5',
          'portfolio_url', 'family_income',
          'math_grade', 'science_grade', 'english_grade',
          'applicant_round_information', 'address'
        ];
        
        if (hideColumns.includes(col.name)) {
          return { ...col, display: false };
        }
        return col;
      });
      
      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();
      await this.refreshTable();

      this.$tableHost.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        console.log('[ApplicantTable] Button clicked:', { action, id });
        if (action === 'view') this.handleView(id);
        else if (action === 'edit') this.handleEdit(id);
        else if (action === 'delete') this.handleDelete(id);
      });

      window.addEventListener('applicantChanged', () => this.refreshTable());

      return true;
    }

    async refreshTable() {
      const result = await this.service.getAll();
      if (result.success) {
        this.table.setData(result.data);
      } else {
        this.ui?.showMessage(`Error loading applicants: ${result.error}`, 'error');
      }
    }

    async formatApplicantForModal(applicant) {
      const data = this.service.formatForDisplay(applicant);
      return await RecruitTableTemplate.formatForModal(
        data,
        'recruit/applicant',
        '🧑‍💼 Applicant Details'
      );
    }

    async handleView(id) {
      if (!id) return;
      
      try {
        this.ui?.showMessage('Loading applicant details...', 'info');
        
        const result = await this.service.getById(id);
        
        if (!result.success) {
          this.ui?.showMessage(`Error loading applicant: ${result.error}`, 'error');
          return;
        }
        
        const modalData = await this.formatApplicantForModal(result.data);
        await RecruitTableTemplate.showDetailsModal(modalData);
        
        this.ui?.clearMessages();
      } catch (error) {
        console.error('[ApplicantTable] Error in handleView:', error);
        this.ui?.showMessage(`Error displaying modal: ${error.message}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;
      RecruitTableTemplate.setNavigationSource('applicantFormSource', 'table');
      RecruitTableTemplate.navigateTo(`recruit/applicant/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for applicant #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id || !confirm('Are you sure you want to delete this applicant?')) return;
      this.ui?.showMessage('Deleting applicant...', 'info');
      
      const result = await this.service.delete(id);
      if (result.success) {
        this.ui?.showMessage(`Applicant ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Delete error: ${result.error}`, 'error');
      }
    }

    async handleCreate() {
      RecruitTableTemplate.setNavigationSource('applicantFormSource', 'table');
      RecruitTableTemplate.navigateTo('recruit/applicant/create');
      this.ui?.showMessage('Opening create form...', 'info');
    }

    async handleImport() {
      this.ui?.showMessage('Selecting file for import...', 'info');
      
      const result = await this.importService.importWithProgress((message) => {
        this.ui?.showMessage(message, 'info');
      });

      if (result.success) {
        this.ui?.showMessage(`Imported ${result.count} applicant(s) from ${result.filename}.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Import error: ${result.error}`, 'error');
      }
    }
  }

  window.ApplicantTable = ApplicantTable;
}
