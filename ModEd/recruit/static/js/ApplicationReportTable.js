if (typeof window !== 'undefined' && !window.ApplicationReportTable) {
  class ApplicationReportTable {
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
      this.reportService = null;
      this.statusService = null;
      this.statusConstants = null;
    }

    async render() {
      if (!this.container) return false;

      this.reportService = new window.ApplicationReportService(this.rootURL);
      this.statusService = new window.ApplicationStatusService(this.rootURL);
      this.container.innerHTML = '';

      const root = await RecruitTableTemplate.getTable({
        title: '📊 Application Report Management',
        subtitle: 'Browse, create, and manage application reports',
        tableId: 'applicationreport-table',
        panelTitle: 'Application Report List',
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }, 'manage');

      this.container.appendChild(root);
      this.ui = RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicationReportMessages',
        resultId: 'applicationReportResult'
      });

      this.$tableHost = root.querySelector('#recruit-table-container');
      if (this.$tableHost) {
        this.$tableHost.style.overflowY = 'auto';
        this.$tableHost.style.maxHeight = '80vh';
      }

      root.querySelector('[data-action="create"]')?.addEventListener('click', () => this.handleCreate());

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
                <button class="al-btn-delete text-red-600 hover:underline" data-action="delete" data-id="{ID}" style="margin-right:8px;">Delete</button>
                <button class="al-btn-schedule text-green-600 hover:underline" data-action="schedule" data-id="{ID}" data-status="{application_statuses}">Schedule</button>
              </div>
            `
          }
        ]
      });

      await this.table.loadSchema();
      
      this.statusConstants = await this.statusService.getStatusConstants();
      
      const originalBindTemplate = this.table.bindTemplate.bind(this.table);
      this.table.bindTemplate = (template, rowData, index) => {
        let result = originalBindTemplate(template, rowData, index);
        
        const status = (rowData.application_statuses || '').toUpperCase();
        const pendingStatus = (this.statusConstants.Pending || 'Pending').toUpperCase();
        
        if (status !== pendingStatus) {
          result = result.replace(
            /(<button[^>]*class="al-btn-schedule[^>]*>Schedule<\/button>)/,
            '<button class="al-btn-schedule" style="display:none;">Schedule</button>'
          );
        }
        
        return result;
      };
      
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
        else if (action === 'schedule') this.handleSchedule(id);
      });

      window.addEventListener('applicationReportChanged', () => this.refreshTable());

      return true;
    }

    async refreshTable() {
      const result = await this.reportService.getAll();
      if (result.success) {
        this.table.setData(result.data);
        if (result.data.length === 0) {
          this.ui?.showMessage('No application report records found. Click "Create New" to add a report.', 'info');
        }
      } else {
        this.ui?.showMessage(`Error loading application reports: ${result.error}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;
      RecruitTableTemplate.setNavigationSource('applicationReportFormSource', 'table');
      RecruitTableTemplate.navigateTo(`recruit/applicationreport/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for application report #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id || !confirm(`Are you sure you want to delete application report #${id}?`)) return;
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
      RecruitTableTemplate.setNavigationSource('applicationReportFormSource', 'table');
      RecruitTableTemplate.navigateTo('recruit/applicationreport/create');
      this.ui?.showMessage('Opening create form...', 'info');
    }

    async handleSchedule(applicationReportId) {
      if (!applicationReportId) return;
      
      RecruitTableTemplate.setNavigationSource('interviewFormSource', 'applicationReportTable');
      sessionStorage.setItem('prefilledApplicationReportId', applicationReportId);
      sessionStorage.setItem('prefilledInterviewStatus', this.statusConstants.Pending || 'Pending');
      
      RecruitTableTemplate.navigateTo('recruit/interview/create');
      this.ui?.showMessage(`Opening interview form for Application Report #${applicationReportId}...`, 'info');
    }
  }

  window.ApplicationReportTable = ApplicationReportTable;
}
