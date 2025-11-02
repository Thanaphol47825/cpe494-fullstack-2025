if (typeof window !== 'undefined' && !window.ApplicationReportForm) {
  class ApplicationReportForm {
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
      this.reportService = null;
      this.returnRoute = null; 
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicationReportForm: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitFormTemplate?.getForm !== 'function') missing.push('RecruitFormTemplate');
      if (typeof window.AdvanceFormRender !== 'function') missing.push('AdvanceFormRender');
      if (typeof window.ApplicationReportService !== 'function') missing.push('ApplicationReportService');
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
      if (!this.reportService && typeof window.ApplicationReportService === 'function') {
        this.reportService = new window.ApplicationReportService(this.rootURL);
      }
    }

    _determineReturnRoute() {
      const cameFromTable = this._checkIfCameFromTable();
      
      console.log('Determining return route:', {
        cameFromTable,
        sessionStorage: sessionStorage.getItem('applicationReportFormSource'),
        hash: window.location.hash
      });
      
      if (cameFromTable) {
        this.returnRoute = {
          link: 'recruit/applicationreport/list',
          text: 'Back to Application Report Table'
        };
      } else {
        this.returnRoute = {
          link: 'recruit',
          text: 'Back to Recruit Menu'
        };
      }
      
    }

    _checkIfCameFromTable() {
      const navigationSource = sessionStorage.getItem('applicationReportFormSource');
      return navigationSource === 'table';
    }

    async render(editId = null) {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this._initializeService();
      this.container.innerHTML = '';
      this.currentEditId = editId;

      this._determineReturnRoute();
      
      sessionStorage.removeItem('applicationReportFormSource');

      const isEdit = editId != null;
      const formEl = await window.RecruitFormTemplate.getForm({
        title: 'Application Report',
        subtitle: isEdit ? `Edit application report #${editId}` : 'Add a new application report',
        formId: 'applicationreport-form',
        backLink: this.returnRoute.link,
        backText: this.returnRoute.text,
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath:
          'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }, 'create');

      this.container.appendChild(formEl);

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicationReportMessages',
        resultId: 'applicationReportResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        targetSelector: '#applicationreport-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      
      if (isEdit) {
        await this.loadApplicationReportData(editId);
      }
      
      return true;
    }

    async loadApplicationReportData(id) {
      if (!id) return;
      
      this.ui?.showMessage(`Loading application report #${id}...`, 'info');
      
      const result = await this.reportService.getById(id);
      if (result.success) {
        this.form.setData(result.data);
        this.ui?.showMessage(`Editing application report ID ${id}`, 'info');
      } else {
        this.ui?.showMessage(`Error loading application report: ${result.error}`, 'error');
      }
    }

    async handleSubmit(formData) {
      const isEdit = this.currentEditId != null;
      const cameFromTable = this._checkIfCameFromTable();
      
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} application report...`, 'info');

      const result = await this.reportService.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Application report ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) {
          this.resetForm();
        }
        
        window.dispatchEvent(new CustomEvent('applicationReportChanged', { 
          detail: { action: isEdit ? 'update' : 'create', id: result.id, data: result.data }
        }));

        if (cameFromTable) {
          setTimeout(() => {
            const returnRoute = this.returnRoute?.link || 'recruit/applicationreport/list';
            this._navigateTo(returnRoute);
            
            sessionStorage.removeItem('applicationReportFormSource');
          }, 2000);
        } else {
          setTimeout(() => {
            this.resetForm();
            sessionStorage.removeItem('applicationReportFormSource');
          }, 2000);
        }
        
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

  window.ApplicationReportForm = ApplicationReportForm;
}
