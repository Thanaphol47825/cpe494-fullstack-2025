if (typeof window !== 'undefined' && !window.ApplicantForm) {
  class ApplicantForm {
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

      this.form = null;
      this.ui = null;
      this.currentEditId = null;
      this.applicantService = null;
      this.returnRoute = null; 
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicantForm: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitFormTemplate?.getForm !== 'function') missing.push('RecruitFormTemplate');
      if (typeof window.AdvanceFormRender !== 'function') missing.push('AdvanceFormRender');
      if (typeof window.ApplicantService !== 'function') missing.push('ApplicantService');
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

    _initializeService() {
      if (!this.applicantService && typeof window.ApplicantService === 'function') {
        this.applicantService = new window.ApplicantService(this.rootURL);
      }
    }

    _determineReturnRoute() {
      const cameFromTable = this._checkIfCameFromTable();
      
      console.log('Determining return route:', {
        cameFromTable,
        sessionStorage: sessionStorage.getItem('applicantFormSource'),
        hash: window.location.hash
      });
      
      if (cameFromTable) {
        this.returnRoute = {
          link: 'recruit/applicant/list',
          text: 'Back to Applicant Table'
        };
      } else {
        this.returnRoute = {
          link: 'recruit',
          text: 'Back to Recruit Menu'
        };
      }
      
    }

    _checkIfCameFromTable() {
      const navigationSource = sessionStorage.getItem('applicantFormSource');
      return navigationSource === 'table';
    }

    clearNavigationSource() {
      sessionStorage.removeItem('applicantFormSource');
      console.log('Navigation source cleared');
    }

    async render(editId = null) {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this._initializeService();
      this.container.innerHTML = '';
      this.currentEditId = editId;

      this._determineReturnRoute();

      const isEdit = editId != null;
      const formEl = await window.RecruitFormTemplate.getForm({
        title: 'Applicant',
        subtitle: isEdit ? `Edit applicant #${editId}` : 'Add a new applicant',
        formId: 'applicant-form',
        backLink: this.returnRoute.link,
        backText: this.returnRoute.text,
        colorPrimary: '#059669',
        colorAccent: '#0f766e',
        iconPath:
          'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z'
      }, 'create');

      this.container.appendChild(formEl);

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicantMessages',
        resultId: 'applicantResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicant',
        targetSelector: '#applicant-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      
      if (isEdit) {
        await this.loadApplicantData(editId);
      }
      
      return true;
    }

    async loadApplicantData(id) {
      if (!id) return;
      
      this.ui?.showMessage(`Loading applicant #${id}...`, 'info');
      
      const result = await this.applicantService.getById(id);
      if (result.success) {
        this.form.setData(result.data);
        this.ui?.showMessage(`Editing applicant ID ${id}`, 'info');
      } else {
        this.ui?.showMessage(`Error loading applicant: ${result.error}`, 'error');
      }
    }

    async handleSubmit(formData) {
      const isEdit = this.currentEditId != null;
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} applicant...`, 'info');

      const result = await this.applicantService.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Applicant ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) {
          this.resetForm();
        }
        
        window.dispatchEvent(new CustomEvent('applicantChanged', { 
          detail: { action: isEdit ? 'update' : 'create', id: result.id, data: result.data }
        }));
        
        setTimeout(() => {
          const returnRoute = this.returnRoute?.link || 'recruit/applicant/list';
          this._navigateTo(returnRoute);
          
          sessionStorage.removeItem('applicantFormSource');
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
      
      try {
        const formRoot = this.form?.form?.html || this.form?.html;
        if (!formRoot) return;

        if (typeof formRoot.reset === 'function') {
          formRoot.reset();
          return;
        }

        const fields = formRoot.querySelectorAll('input, select, textarea');
        fields.forEach((el) => {
          const tag = (el.tagName || '').toLowerCase();
          const type = (el.type || '').toLowerCase();
          if (tag === 'input') {
            if (type === 'checkbox' || type === 'radio') el.checked = false;
            else el.value = '';
          } else if (tag === 'select') {
            el.selectedIndex = 0;
          } else if (tag === 'textarea') {
            el.value = '';
          }
        });
        
        this.ui?.clearMessages();
      } catch (err) {
        this.ui?.showMessage('Error resetting form: ' + err.message, 'error');
      }
    }

    setFormData(data) {
      if (this.form && data) {
        this.form.setData(data);
      }
    }

    getFormData() {
      return this.form?.getData ? this.form.getData() : {};
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

  window.ApplicantForm = ApplicantForm;
}
