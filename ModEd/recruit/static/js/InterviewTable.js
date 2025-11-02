if (typeof window !== 'undefined' && !window.InterviewTable) {
  class InterviewTable {

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

      this.interviewService = null;

    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitTableTemplate?.getTable !== 'function') missing.push('RecruitTableTemplate');
      if (typeof window.AdvanceTableRender !== 'function') missing.push('AdvanceTableRender');
      if (typeof window.InterviewService !== 'function') missing.push('InterviewService');
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
      if (!this.interviewService && typeof window.InterviewService === 'function') {
        this.interviewService = new window.InterviewService(this.rootURL);
      }
    }

    _assertContainer() {
      if (!this.container) {
        console.error('InterviewTable: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this._initializeServices();
      this.container.innerHTML = '';

      const root = await window.RecruitTableTemplate.getTable({
        title: '📅 Interview Management',
        subtitle: 'Browse, create, and manage interviews',
        tableId: 'interview-table',
        panelTitle: 'Interview List',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, 'manage');

      this.container.appendChild(root);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'interviewMessages',
        resultId: 'interviewResult'
      });

      this.$tableHost = root.querySelector('#recruit-table-container');

      if (this.$tableHost) {
        this.$tableHost.style.overflowY = 'auto';
        this.$tableHost.style.maxHeight = '80vh';
      }

      root.querySelector('[data-action="create"]')?.addEventListener('click', () => this.handleCreate());
      
      const toolbar = root.querySelector('.recruit-toolbar');
      if (toolbar) {
        const setupBtn = document.createElement('button');
        setupBtn.setAttribute('data-action', 'setup-test');
        setupBtn.className = 'btn';
        setupBtn.style.cssText = 'background: #f59e0b; color: white;';
        setupBtn.textContent = '🔧 Setup Test Data';
        setupBtn.addEventListener('click', () => this.handleSetupTestData());
        toolbar.appendChild(setupBtn);
      }

      this.setupTable();
      await this.renderTable();
      this._bindTableActions();
      this._bindGlobalEvents();

      return true;
    }

    setupTable() {
      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/interview',
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
  p.textContent = 'Loading interviews…';
  this.$tableHost.appendChild(p);

      await this.table.loadSchema();

      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();

      await this.refreshTable();
    }

    async refreshTable() {
      const result = await this.interviewService.getAll();
      if (result.success) {
        this.table.setData(result.data);
        
        if (result.data.length === 0) {
          this.ui?.showMessage(
            'No interview records found. Click "🔧 Setup Test Data" to create sample data.',
            'info'
          );
        }
      } else {
        this.ui?.showMessage(`Error loading interviews: ${result.error}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;

      sessionStorage.setItem('interviewFormSource', 'table');
      
      this._navigateTo(`recruit/interview/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for interview #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id) return;
      if (!confirm(`Are you sure you want to delete interview #${id}?`)) return;

      this.ui?.showMessage('Deleting interview...', 'info');
      
      const result = await this.interviewService.delete(id);
      if (result.success) {
        this.ui?.showMessage(`Interview ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Delete error: ${result.error}`, 'error');
      }
    }

    async handleCreate() {
      sessionStorage.setItem('interviewFormSource', 'table');
      
      this._navigateTo('recruit/interview/create');
      this.ui?.showMessage('Opening create form...', 'info');
    }

    async handleSetupTestData() {
      if (!confirm('This will create test data for all related tables. Continue?')) return;

      this.ui?.showMessage('Setting up test data...', 'info');

      const result = await this.interviewService.setupTestData();

      if (result.success) {
        this.ui?.showMessage('✅ Test data created successfully!', 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage('❌ Failed: ' + result.error, 'error');
      }
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
      window.addEventListener('interviewChanged', (event) => {
        const { action, id } = event.detail;
        this.ui?.showMessage(`Interview ${action}d successfully (ID: ${id})`, 'success');
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

  window.InterviewTable = InterviewTable;
}
