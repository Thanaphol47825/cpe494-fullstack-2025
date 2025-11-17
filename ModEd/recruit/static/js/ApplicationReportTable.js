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
      this.transferService = null;
    }

    async render() {
      if (!this.container) return false;

      this.reportService = new window.ApplicationReportService(this.rootURL);
      this.statusService = new window.ApplicationStatusService(this.rootURL);
      this.transferService = new window.ApplicationReportTransferConfirmedStudentService(this.rootURL);
      
      await this.reportService.loadProgramTypes();
      await this.reportService.loadHiddenButtonTemplate();

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

      const customColumns = await this.reportService.getCustomColumns();

      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: customColumns,
        schema: [],
        
        enableSearch: true,
        enableSorting: true,
        enablePagination: true,
        pageSize: 10,
        
        searchConfig: {
          placeholder: "Search application reports...",
          fields: [
            { value: "all", label: "All Fields" },
            { value: "applicant_first_name", label: "Applicant First Name" },
            { value: "applicant_last_name", label: "Applicant Last Name" },
            { value: "applicant_email", label: "Applicant Email" },
            { value: "round_name", label: "Application Round" },
            { value: "faculty_name", label: "Faculty" },
            { value: "department_name", label: "Department" },
            { value: "program_label", label: "Program Type" },
            { value: "application_statuses", label: "Application Status" }
          ]
        },
        
        sortConfig: {
          defaultField: "ID",
          defaultDirection: "asc"
        }
      });
      
      this.statusConstants = await this.statusService.getStatusConstants();
      
      const originalBindTemplate = this.table.bindTemplate.bind(this.table);
      this.table.bindTemplate = (template, rowData, index) => {
        let result = originalBindTemplate(template, rowData, index);
        
        result = this.reportService.applyButtonVisibilityRules(result, rowData, this.statusConstants);
        
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
        
        if (action === 'view') this.handleView(id);
        else if (action === 'edit') this.handleEdit(id);
        else if (action === 'delete') this.handleDelete(id);
        else if (action === 'verify') this.handleVerifyEligibility(id);
        else if (action === 'confirm') this.handleConfirmAcceptance(id);
        else if (action === 'schedule') this.handleSchedule(id);
        else if (action === 'transfer') this.handleTransferConfirmed(id);
      });

      window.addEventListener('applicationReportChanged', () => this.refreshTable());

      return true;
    }

    async refreshTable() {
      const result = await this.reportService.getAll();
      if (result.success) {
        const transformedData = result.data.map(item => this.reportService.transformRowData(item));
        
        this.table.setData(transformedData);
        if (transformedData.length === 0) {
          this.ui?.showMessage('No application report records found. Click "Create New" to add a report.', 'info');
        }
      } else {
        this.ui?.showMessage(`Error loading application reports: ${result.error}`, 'error');
      }
    }

    async formatApplicationReportForModal(report) {
      const data = report;
      
      const applicant = data.applicant || data.Applicant;
      const applicationRound = data.application_round || data.ApplicationRound;
      const faculty = data.faculty || data.Faculty;
      const department = data.department || data.Department;
      
      const applicantName = `${applicant?.first_name || ''} ${applicant?.last_name || ''}`.trim() || 'N/A';
      const programLabel = this.reportService.programTypeMap[data.program] || data.program || 'N/A';
      
      const additionalFields = [
        { label: 'Applicant', value: `${applicantName} (ID: ${data.applicant_id || 'N/A'})` },
        { label: 'Email', value: applicant?.email || 'N/A' },
        { label: 'Application Round', value: `${applicationRound?.round_name || applicationRound?.name || 'N/A'} (ID: ${data.application_rounds_id || 'N/A'})` },
        { label: 'Faculty', value: `${faculty?.name || 'N/A'} (ID: ${data.faculty_id || 'N/A'})` },
        { label: 'Department', value: `${department?.name || 'N/A'} (ID: ${data.department_id || 'N/A'})` },
        { label: 'Program Type', value: `${programLabel} (ID: ${data.program ?? 'N/A'})` }
      ];
      
      return await RecruitTableTemplate.formatForModal(
        data,
        'recruit/applicationreport',
        '📊 Application Report Details',
        additionalFields,
        ['applicant_id', 'application_rounds_id', 'faculty_id', 'department_id', 'program', 'application_statuses']
      );
    }

    async handleView(id) {
      if (!id) return;
      
      try {
        this.ui?.showMessage('Loading application report details...', 'info');
        
        const result = await this.reportService.getById(id);
        
        if (!result.success) {
          this.ui?.showMessage(`Error loading application report: ${result.error}`, 'error');
          return;
        }
        
        const modalData = await this.formatApplicationReportForModal(result.data);
        await RecruitTableTemplate.showDetailsModal(modalData);
        
        this.ui?.clearMessages();
      } catch (error) {
        console.error('[ApplicationReportTable] Error in handleView:', error);
        this.ui?.showMessage(`Error displaying modal: ${error.message}`, 'error');
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

    async handleTransferConfirmed(applicantId) {
      if (!applicantId) {
        this.ui?.showMessage('Applicant ID not found for this record.', 'error');
        return;
      }

      this.ui?.showMessage(`Transferring applicant #${applicantId} to student record...`, 'info');

      const result = await this.transferService.transferById(applicantId);

      if (result.success) {
        this.ui?.showMessage(result.message || `Applicant #${applicantId} transferred successfully.`, 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`Transfer failed for applicant #${applicantId}: ${result.error}`, 'error');
      }
    }

    async handleVerifyEligibility(applicationReportId) {
      if (!applicationReportId) return;
      
      if (!confirm(`ตรวจเกณฑ์รอบเบื้องต้นสำหรับ Application Report #${applicationReportId}?`)) return;
      
      this.ui?.showMessage('กำลังตรวจเกณฑ์...', 'info');
      
      const result = await this.reportService.verifyEligibility(applicationReportId);
      
      if (result.success) {
        this.ui?.showMessage(result.message || 'ตรวจเกณฑ์สำเร็จ! สถานะถูกอัปเดตแล้ว', 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`ตรวจเกณฑ์ล้มเหลว: ${result.error}`, 'error');
      }
    }

    async handleConfirmAcceptance(applicationReportId) {
      if (!applicationReportId) return;
      
      if (!confirm(`ยืนยันสิทธิ์สำหรับ Application Report #${applicationReportId}?`)) return;
      
      this.ui?.showMessage('กำลังยืนยันสิทธิ์...', 'info');
      
      const result = await this.reportService.confirmAcceptance(applicationReportId);
      
      if (result.success) {
        this.ui?.showMessage(result.message || 'ยืนยันสิทธิ์สำเร็จ! สถานะถูกอัปเดตเป็น Confirmed แล้ว', 'success');
        await this.refreshTable();
      } else {
        this.ui?.showMessage(`ยืนยันสิทธิ์ล้มเหลว: ${result.error}`, 'error');
      }
    }

  }

  window.ApplicationReportTable = ApplicationReportTable;
}
