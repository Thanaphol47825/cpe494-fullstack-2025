if (typeof window !== 'undefined' && !window.InterviewTable) {
  class InterviewTable {

    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || this.app?.mainContainer || document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? window.__ROOT_URL__ ?? '';
      this.table = null;
      this.ui = null;
      this.$tableHost = null;
      this.interviewService = null;
    }

    async render() {
      if (!this.container) return false;

      this.interviewService = new window.InterviewService(this.rootURL);
      this.container.innerHTML = '';

      const root = await RecruitTableTemplate.getTable({
        title: '📅 Interview Management',
        subtitle: 'Browse, create, and manage interviews',
        tableId: 'interview-table',
        panelTitle: 'Interview List',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, 'manage');

      this.container.appendChild(root);
      this.ui = RecruitTableTemplate.mountMessageAndResult(root, {
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

      const customColumns = [
        {
          name: 'instructor_name',
          label: 'Instructor',
          template: '{instructor_name}'
        },
        {
          name: 'applicant_name',
          label: 'Applicant',
          template: '{applicant_name}'
        },
        {
          name: 'scheduled_appointment_display',
          label: 'Scheduled',
          template: '{scheduled_appointment_display}'
        },
        {
          name: 'interview_status',
          label: 'Status',
          template: '{interview_status}'
        },
        {
          name: 'total_score',
          label: 'Score',
          template: '{total_score}'
        },
        ...await RecruitTableTemplate.getDefaultColumns()
      ];

      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/interview',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: customColumns,
        schema: [],
        
        enableSearch: true,
        enableSorting: true,
        enablePagination: true,
        pageSize: 10,
        
        searchConfig: {
          placeholder: "Search interviews...",
          fields: [
            { value: "all", label: "All Fields" },
            { value: "instructor_name", label: "Instructor Name" },
            { value: "instructor_email", label: "Instructor Email" },
            { value: "applicant_name", label: "Applicant Name" },
            { value: "applicant_email", label: "Applicant Email" },
            { value: "interview_status", label: "Interview Status" },
            { value: "total_score", label: "Total Score" }
          ]
        },
        
        sortConfig: {
          defaultField: "ID",
          defaultDirection: "asc"
        }
      });

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

      window.addEventListener('interviewChanged', () => this.refreshTable());

      return true;
    }

    async refreshTable() {
      const result = await this.interviewService.getAll();
      if (result.success) {
        const transformedData = result.data.map(item => this.interviewService.transformRowData(item));
        
        this.table.setData(transformedData);
        if (transformedData.length === 0) {
          this.ui?.showMessage('No interview records found. Click "🔧 Setup Test Data" to create sample data.', 'info');
        }
      } else {
        this.ui?.showMessage(`Error loading interviews: ${result.error}`, 'error');
      }
    }

    async formatInterviewForModal(interview) {
      const data = interview;
      
      if (!window.InterviewModalConfig) {
        console.warn('[InterviewTable] InterviewModalConfig not loaded, loading now...');
        await this.loadConfig();
      }
      
      const config = window.InterviewModalConfig;
      const additionalFields = config.resolveAdditionalFields(data);
      
      return await RecruitTableTemplate.formatForModal(
        data,
        'recruit/interview',
        '📅 Interview Details',
        additionalFields,
        config.excludeFields
      );
    }

    async loadConfig() {
      if (!window.InterviewModalConfig) {
        const script = document.createElement('script');
        script.src = `${this.rootURL || ''}/recruit/static/js/config/modal/interviewFields.js`;
        script.async = false;
        return new Promise((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load InterviewModalConfig'));
          document.head.appendChild(script);
        });
      }
    }

    async handleView(id) {
      if (!id) return;
      
      try {
        this.ui?.showMessage('Loading interview details...', 'info');
        
        const result = await this.interviewService.getById(id);
        
        if (!result.success) {
          this.ui?.showMessage(`Error loading interview: ${result.error}`, 'error');
          return;
        }
        
        const modalData = await this.formatInterviewForModal(result.data);
        await RecruitTableTemplate.showDetailsModal(modalData);
        
        this.ui?.clearMessages();
      } catch (error) {
        console.error('[InterviewTable] Error in handleView:', error);
        this.ui?.showMessage(`Error displaying modal: ${error.message}`, 'error');
      }
    }

    async handleEdit(id) {
      if (!id) return;
      RecruitTableTemplate.setNavigationSource('interviewFormSource', 'table');
      RecruitTableTemplate.navigateTo(`recruit/interview/edit/${id}`);
      this.ui?.showMessage(`Opening edit form for interview #${id}...`, 'info');
    }

    async handleDelete(id) {
      if (!id || !confirm(`Are you sure you want to delete interview #${id}?`)) return;
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
      RecruitTableTemplate.setNavigationSource('interviewFormSource', 'table');
      RecruitTableTemplate.navigateTo('recruit/interview/create');
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
  }

  window.InterviewTable = InterviewTable;
}
