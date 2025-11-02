if (typeof window !== 'undefined' && !window.ApplicationReportTable) {
  class ApplicationReportTable {

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

      this.reportService = null;
    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitTableTemplate?.getTable !== 'function') missing.push('RecruitTableTemplate');
      if (typeof window.AdvanceTableRender !== 'function') missing.push('AdvanceTableRender');
      if (typeof window.ApplicationReportService !== 'function') missing.push('ApplicationReportService');
      if (missing.length) {
        console.error('Missing dependencies:', missing.join(', '));
        if (this.container) {
          const msgDiv = document.createElement('div');
          msgDiv.className = 'p-4 rounded border border-red-200 bg-red-50 text-red-700';
          msgDiv.textContent = `Missing dependencies: ${missing.join(', ')}.`;
          this.container.appendChild(msgDiv);
        }
        return false;
      }
      return true;
    }

    _initializeServices() {
      if (!this.reportService && typeof window.ApplicationReportService === 'function') {
        this.reportService = new window.ApplicationReportService(this.rootURL);
      }
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicationReportTable: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this._initializeServices();
      this.container.innerHTML = '';

      const root = await window.RecruitTableTemplate.getTable({
        title: '📊 Application Report Management',
        subtitle: 'Browse, create, and manage application reports',
        tableId: 'applicationreport-table',
        panelTitle: 'Application Report List',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }, 'manage');

      this.container.appendChild(root);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicationReportMessages',
        resultId: 'applicationReportResult'
      });

      this.$tableHost = root.querySelector('#recruit-table-container');

      if (this.$tableHost) {
        this.$tableHost.style.overflowY = 'auto';
        this.$tableHost.style.maxHeight = '80vh';
      }

      root.querySelector('[data-action="create"]')?.addEventListener('click', () => this.handleCreate());

      this.setupTable();
      await this.renderTable();
      this._bindTableActions();
      this._bindGlobalEvents();

      return true;
    }

    setupTable() {
      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicationreport',
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
      this.$tableHost.innerHTML = '';
      const p = document.createElement('p');
      p.style.cssText = 'padding:8px; color:#6b7280;';
      p.textContent = 'Loading application reports…';
      this.$tableHost.appendChild(p);

      await this.table.loadSchema();

      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();

      await this.refreshTable();
    }

    async refreshTable() {
      const result = await this.reportService.getAll();
      if (result.success) {
        this.table.setData(result.data);
        
        if (result.data.length === 0) {
          this.ui?.showMessage(
            'No application report records found. Click "Create New" to add a report.',
            'info'
          );
        }
      } else {
        this.ui?.showMessage(`Error loading application reports: ${result.error}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;

      sessionStorage.setItem('applicationReportFormSource', 'table');
      
      this._navigateTo(`recruit/applicationreport/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for application report #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id) return;
      if (!confirm(`Are you sure you want to delete application report #${id}?`)) return;

      this.ui?.showMessage('Deleting application report...', 'info');
      
      const result = await this.reportService.delete(id);
      if (result.success) {
        this.ui?.showMessage(`Application report ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Delete error: ${result.error}`, 'error');
      }
    }

    async handleCreate() {
      sessionStorage.setItem('applicationReportFormSource', 'table');
      
      this._navigateTo('recruit/applicationreport/create');
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
      window.addEventListener('applicationReportChanged', (event) => {
        const { action, id } = event.detail;
        this.ui?.showMessage(`Application report ${action}d successfully (ID: ${id})`, 'success');
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

  window.ApplicationReportTable = ApplicationReportTable;
}
