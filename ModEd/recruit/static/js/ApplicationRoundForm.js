if (typeof window !== 'undefined' && !window.ApplicationRoundForm) {
  class ApplicationRoundForm {
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

      this.service = new window.ApplicationRoundService(this.rootURL);
      this.container.innerHTML = '';
      this.currentEditId = editId;

      const cameFromTable = RecruitFormTemplate.checkIfCameFromTable('applicationRoundFormSource');
      const returnRoute = cameFromTable 
        ? { link: 'recruit/applicationround/list', text: 'Back to Application Round Table' }
        : { link: 'recruit', text: 'Back to Recruit Menu' };
      
      RecruitFormTemplate.clearNavigationSource('applicationRoundFormSource');

      const isEdit = editId != null;
      const formEl = await RecruitFormTemplate.getForm({
        title: 'Application Round',
        subtitle: isEdit ? `Edit application round #${editId}` : 'Add a new application round',
        formId: 'applicationround-form',
        backLink: returnRoute.link,
        backText: returnRoute.text,
        colorPrimary: '#f59e0b',
        colorAccent: '#d97706',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, isEdit ? 'edit' : 'create');

      this.container.appendChild(formEl);
      this.ui = RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicationRoundMessages',
        resultId: 'applicationRoundResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationround',
        targetSelector: '#applicationround-form',
        submitHandler: (fd) => this.handleSubmit(fd, returnRoute),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      
      if (isEdit) {
        const result = await this.service.getById(editId);
        if (result.success) {
          this.form.setData(result.data);
          this.ui?.showMessage(`Editing application round ID ${editId}`, 'info');
        }
      }
      
      return true;
    }

    async handleSubmit(formData, returnRoute) {
      const isEdit = this.currentEditId != null;
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} application round...`, 'info');

      const result = await this.service.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Application round ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) {
          this.resetForm();
        }
        
        RecruitFormTemplate.dispatchChangeEvent('ApplicationRound', isEdit ? 'update' : 'create', result.id, result.data);
        
        setTimeout(() => {
          RecruitFormTemplate.navigateTo(returnRoute.link || 'recruit/applicationround/list');
          RecruitFormTemplate.clearNavigationSource('applicationRoundFormSource');
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

  window.ApplicationRoundForm = ApplicationRoundForm;
}
