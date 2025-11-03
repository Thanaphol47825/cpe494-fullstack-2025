if (typeof window !== 'undefined' && !window.ApplicationReportForm) {
  class ApplicationReportForm {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || 
                      this.app?.mainContainer || 
                      document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? '';
      
      this.form = null;
      this.ui = null;
      this.currentEditId = null;
      this.service = null;
    }

    async render(editId = null) {
      if (!this.container) return false;

      this.service = new window.ApplicationReportService(this.rootURL);
      this.container.innerHTML = '';
      this.currentEditId = editId;

      const cameFromTable = RecruitFormTemplate.checkIfCameFromTable('applicationReportFormSource');
      const returnRoute = cameFromTable 
        ? { link: 'recruit/applicationreport/list', text: 'Back to Application Report Table' }
        : { link: 'recruit', text: 'Back to Recruit Menu' };
      
      RecruitFormTemplate.clearNavigationSource('applicationReportFormSource');

      const isEdit = editId != null;
      const formEl = await RecruitFormTemplate.getForm({
        title: 'Application Report',
        subtitle: isEdit ? `Edit application report #${editId}` : 'Add a new application report',
        formId: 'applicationreport-form',
        backLink: returnRoute.link,
        backText: returnRoute.text,
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }, isEdit ? 'edit' : 'create');

      this.container.appendChild(formEl);
      this.ui = RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicationReportMessages',
        resultId: 'applicationReportResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        targetSelector: '#applicationreport-form',
        submitHandler: (fd) => this.handleSubmit(fd, returnRoute, cameFromTable),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      
      if (isEdit) {
        const result = await this.service.getById(editId);
        if (result.success) {
          this.form.setData(result.data);
          this.ui?.showMessage(`Editing application report ID ${editId}`, 'info');
        }
      }
      
      return true;
    }

    async handleSubmit(formData, returnRoute, cameFromTable) {
      const isEdit = this.currentEditId != null;
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} application report...`, 'info');

      const result = await this.service.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Application report ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) {
          this.resetForm();
        }
        
        RecruitFormTemplate.dispatchChangeEvent('ApplicationReport', isEdit ? 'update' : 'create', result.id, result.data);
        
        setTimeout(() => {
          if (cameFromTable) {
            RecruitFormTemplate.navigateTo(returnRoute.link || 'recruit/applicationreport/list');
          } else {
            this.resetForm();
          }
          RecruitFormTemplate.clearNavigationSource('applicationReportFormSource');
        }, 2000);
        
        return true;
      } else {
        this.ui?.showMessage(result.error, 'error');
        this.ui?.renderResult({ error: result.error }, 'error');
        return false;
      }
    }

    resetForm() {
      this.currentEditId = null;
      const formRoot = this.form?.form?.html || this.form?.html;
      if (formRoot) {
        RecruitFormTemplate.resetFormFields(formRoot);
        this.ui?.clearMessages();
      }
    }

    setFormData(data) {
      if (this.form && data) this.form.setData(data);
    }

    getFormData() {
      return this.form?.getData ? this.form.getData() : {};
    }
  }

  window.ApplicationReportForm = ApplicationReportForm;
}
