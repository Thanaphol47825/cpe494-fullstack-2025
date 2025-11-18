if (typeof window !== 'undefined' && !window.ApplicationRoundTable) {
  class ApplicationRoundTable {
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
    }

    async render() {
      if (!this.container) return false;

      this.service = new window.ApplicationRoundService(this.rootURL);
      this.container.innerHTML = '';

      const root = await RecruitTableTemplate.getTable({
        title: '📅 Application Round Management',
        subtitle: 'Browse and manage recruitment rounds',
        tableId: 'applicationround-table',
        panelTitle: 'Application Round Form',
        colorPrimary: '#f59e0b',
        colorAccent: '#d97706',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, 'manage');

      this.container.appendChild(root);
      this.ui = RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicationRoundMessages',
        resultId: 'applicationRoundResult'
      });

      this.$tableHost = root.querySelector('#recruit-table-container');
      if (this.$tableHost) {
        this.$tableHost.style.overflowY = 'auto';
        this.$tableHost.style.maxHeight = '80vh';
      }

      root.querySelector('[data-action="create"]')?.addEventListener('click', () => this.handleCreate());

      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicationround',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: await RecruitTableTemplate.getDefaultColumns(),
        
        enableSearch: true,
        enableSorting: true,
        enablePagination: true,
        pageSize: 10,
        
        searchConfig: {
          placeholder: "Search application rounds...",
          fields: [
            { value: "all", label: "All Fields" },
            { value: "round_name", label: "Round Name" }
          ]
        },
        
        sortConfig: {
          defaultField: "id",
          defaultDirection: "desc"
        }
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
       
        if (action === 'view') this.handleView(id);
        else if (action === 'edit') this.handleEdit(id);
        else if (action === 'delete') this.handleDelete(id);
      });

      window.addEventListener('applicationRoundChanged', () => this.refreshTable());

      return true;
    }

    async refreshTable() {
      const result = await this.service.getAll();
      if (result.success) {
        this.table.setData(result.data);
      } else {
        this.ui?.showMessage(`Error loading application rounds: ${result.error}`, 'error');
      }
    }

    async formatApplicationRoundForModal(applicationRound) {
      return await RecruitTableTemplate.formatForModal(
        applicationRound,
        'recruit/applicationround',
        '📅 Application Round Details'
      );
    }

    async handleView(id) {
      if (!id) return;
      
      try {
        this.ui?.showMessage('Loading application round details...', 'info');
        
        const result = await this.service.getById(id);
        
        if (!result.success) {
          this.ui?.showMessage(`Error loading application round: ${result.error}`, 'error');
          return;
        }
        
        const modalData = await this.formatApplicationRoundForModal(result.data);
        await RecruitTableTemplate.showDetailsModal(modalData);
        
        this.ui?.clearMessages();
      } catch (error) {
        console.error('[ApplicationRoundTable] Error in handleView:', error);
        this.ui?.showMessage(`Error displaying modal: ${error.message}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;
      RecruitTableTemplate.setNavigationSource('applicationRoundFormSource', 'table');
      RecruitTableTemplate.navigateTo(`recruit/applicationround/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for application round #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id || !confirm('Are you sure you want to delete this application round?')) return;
      this.ui?.showMessage('Deleting application round...', 'info');
      
      const result = await this.service.delete(id);
      if (result.success) {
        this.ui?.showMessage(`Application round ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Delete error: ${result.error}`, 'error');
      }
    }

    async handleCreate() {
      RecruitTableTemplate.setNavigationSource('applicationRoundFormSource', 'table');
      RecruitTableTemplate.navigateTo('recruit/applicationround/create');
      this.ui?.showMessage('Opening create form...', 'info');
    }
  }

  window.ApplicationRoundTable = ApplicationRoundTable;
}
