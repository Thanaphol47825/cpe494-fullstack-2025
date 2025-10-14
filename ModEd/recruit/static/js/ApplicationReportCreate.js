if (typeof window !== 'undefined' && !window.ApplicationReportCreate) {
  class ApplicationReportCreate {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine ? this.app.templateEngine : this.app;
      this.container =
        this.engine?.mainContainer ||
        this.app?.mainContainer ||
        document.querySelector('#app') || null;

      this.rootURL =
        rootURL ?? this.app?.rootURL ?? window.RootURL ?? window.__ROOT_URL__ ?? '';
      this.form = null;
      this.ui = null;
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicationReportCreate: container not found');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer()) return false;
      this.container.innerHTML = '';

      const formEl = await window.RecruitFormTemplate.getForm({
        title: 'Application Report',
        subtitle: 'Create a new application report',
        formId: 'applicationreport-form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
        iconPath:
          'M9 12h6m-6 4h6m-9 8h12a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z'
      }, 'create');

      this.container.appendChild(formEl);

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'reportMessages',
        resultId: 'reportResult'
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        targetSelector: '#applicationreport-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
    }

    async handleSubmit(formData) {
      this.ui?.showMessage('Saving report...', 'info');

      try {
        const resp = await fetch(`${this.rootURL}/recruit/CreateApplicationReport`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess !== true) {
          this.ui?.showMessage(data?.message || 'Failed', 'error');
          return;
        }

        const id = data?.result?.ID ?? data?.result?.id;
        this.ui?.renderResult(data.result, 'success', `Report created successfully! ID: ${id}`);
      } catch (err) {
        this.ui?.showMessage('Network error: ' + err.message, 'error');
      }
    }
  }

  window.ApplicationReportCreate = ApplicationReportCreate;
}
