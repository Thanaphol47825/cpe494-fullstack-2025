if (typeof window !== 'undefined' && !window.ApplicantTable) {
  class ApplicantTable {

    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};

      this.engine =
        this.app.templateEngine
          ? this.app.templateEngine
          : this.app;

      this.container =
        this.engine?.mainContainer ||
        this.app?.mainContainer ||
        document.querySelector('#app') ||
        null;

      this.rootURL =
        rootURL ??
        this.app?.rootURL ??
        window.RootURL ??
        window.__ROOT_URL__ ??
        '';

      this.table = null;
      this.ui = null;
      this.$tableHost = null;

      this.applicantService = null;
      this.importService = null;

    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitTableTemplate?.getTable !== 'function') missing.push('RecruitTableTemplate');
      if (typeof window.AdvanceTableRender !== 'function') missing.push('AdvanceTableRender');
      if (typeof window.ApplicantService !== 'function') missing.push('ApplicantService');
      if (typeof window.ApplicantImportService !== 'function') missing.push('ApplicantImportService');
      if (missing.length) {
        console.error('Missing dependencies:', missing.join(', '));
        if (this.container) {
          this.container.innerHTML = `
            <div class="p-4 rounded border border-red-200 bg-red-50 text-red-700">
              Missing dependencies: ${missing.join(', ')}.
            </div>`;
        }
        return false;
      }
      return true;
    }

    _initializeServices() {
      if (!this.applicantService && typeof window.ApplicantService === 'function') {
        this.applicantService = new window.ApplicantService(this.rootURL);
      }
      if (!this.importService && typeof window.ApplicantImportService === 'function') {
        this.importService = new window.ApplicantImportService(this.rootURL);
      }
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicantTable: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this._initializeServices();
      this.container.innerHTML = '';

      const root = await window.RecruitTableTemplate.getTable({
        title: '🧑‍💼 Applicant Management',
        subtitle: 'Browse, import, and edit applicants',
        tableId: 'applicant-table',
        panelTitle: 'Applicant Form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#2563eb',
        colorAccent: '#1e40af',
        iconPath: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z'
      }, 'manage');

      this.container.appendChild(root);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
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

      this.setupTable();
      await this.renderTable();
      this._bindTableActions();
      this._bindGlobalEvents();

      return true;
    }

    setupTable() {

      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicant',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: [
          {
            name: 'actions',
            label: 'Actions',
            template: `
              <div style="white-space:nowrap;">
                <button class="al-btn-edit text-blue-600 hover:underline" data-action="edit" data-id="{ID}" style="margin-right:8px;">Edit</button>
                <button class="al-btn-delete text-red-600 hover:underline" data-action="delete" data-id="{ID}">Delete</button>
              </div>
            `
          }
        ]
      });
    }

    async renderTable() {
      if (!this.$tableHost) return;
      this.$tableHost.innerHTML = `<p style="padding:8px; color:#6b7280;">Loading applicants…</p>`;

      await this.table.loadSchema();

      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();

      await this.refreshTable();
    }

    async refreshTable() {
      const result = await this.applicantService.getAll();
      if (result.success) {
        this.table.setData(result.data);
      } else {
        this.ui?.showMessage(`Error loading applicants: ${result.error}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;

      sessionStorage.setItem('applicantFormSource', 'table');
      
      this._navigateTo(`recruit/applicant/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for applicant #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id) return;
      if (!confirm('Are you sure you want to delete this applicant?')) return;

      this.ui?.showMessage('Deleting applicant...', 'info');
      
      const result = await this.applicantService.delete(id);
      if (result.success) {
        this.ui?.showMessage(`Applicant ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Delete error: ${result.error}`, 'error');
      }
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

    async handleCreate() {
      sessionStorage.setItem('applicantFormSource', 'table');
      
      this._navigateTo('recruit/applicant/create');
      this.ui?.showMessage('Opening create form...', 'info');
    }

    _bindTableActions() {
      if (!this.$tableHost) return;
      this.$tableHost.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id') || btn.dataset.id;
        if (!action || !id) return;

        if (action === 'edit') this.handleEdit(id);
        else if (action === 'delete') this.handleDelete(id);
      });
    }

    _bindGlobalEvents() {
      window.addEventListener('applicantChanged', (event) => {
        const { action, id } = event.detail;
        this.ui?.showMessage(`Applicant ${action}d successfully (ID: ${id})`, 'success');
        this.refreshTable();
      });
    }

    _navigateTo(route) {
      if (window.RouterLinks) {
        const routerLinks = new window.RouterLinks();
        routerLinks.navigateTo(route);
      } else {
        window.location.hash = route;
      }
    }
  }

  window.ApplicantTable = ApplicantTable;
}
