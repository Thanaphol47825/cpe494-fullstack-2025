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
        customColumns: RecruitTableTemplate.getDefaultColumns()
      });

      await this.table.loadSchema();
      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();
      await this.refreshTable();

      this.$tableHost.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'edit') this.handleEdit(id);
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
