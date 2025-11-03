if (typeof window !== 'undefined' && !window.ApplicantForm) {
  class ApplicantForm {
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

      this.service = new window.ApplicantService(this.rootURL);
      this.container.innerHTML = '';
      this.currentEditId = editId;

      const cameFromTable = RecruitFormTemplate.checkIfCameFromTable('applicantFormSource');
      const returnRoute = cameFromTable 
        ? { link: 'recruit/applicant/list', text: 'Back to Applicant Table' }
        : { link: 'recruit', text: 'Back to Recruit Menu' };
      
      RecruitFormTemplate.clearNavigationSource('applicantFormSource');

      const isEdit = editId != null;
      const formEl = await RecruitFormTemplate.getForm({
        title: 'Applicant',
        subtitle: isEdit ? `Edit applicant #${editId}` : 'Add a new applicant',
        formId: 'applicant-form',
        backLink: returnRoute.link,
        backText: returnRoute.text,
        colorPrimary: '#059669',
        colorAccent: '#0f766e',
        iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z'
      }, isEdit ? 'edit' : 'create');

      this.container.appendChild(formEl);
      this.ui = RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicantMessages',
        resultId: 'applicantResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicant',
        targetSelector: '#applicant-form',
        submitHandler: (fd) => this.handleSubmit(fd, returnRoute),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      
      if (isEdit) {
        const result = await this.service.getById(editId);
        if (result.success) {
          this.form.setData(result.data);
          this.ui?.showMessage(`Editing applicant ID ${editId}`, 'info');
        }
      }
      
      return true;
    }

    async handleSubmit(formData, returnRoute) {
      const isEdit = this.currentEditId != null;
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} applicant...`, 'info');

      const result = await this.service.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Applicant ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) {
          this.resetForm();
        }
        
        RecruitFormTemplate.dispatchChangeEvent('Applicant', isEdit ? 'update' : 'create', result.id, result.data);
        
        setTimeout(() => {
          RecruitFormTemplate.navigateTo(returnRoute.link || 'recruit/applicant/list');
          RecruitFormTemplate.clearNavigationSource('applicantFormSource');
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

  window.ApplicantForm = ApplicantForm;
}
