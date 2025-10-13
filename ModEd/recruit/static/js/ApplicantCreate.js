if (typeof window !== 'undefined' && !window.ApplicantCreate) {
  class ApplicantCreate {
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
    }

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicantCreate: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer()) return false;

      this.container.innerHTML = '';

      if (typeof window.RecruitFormTemplate?.getForm !== 'function') {
        console.error('RecruitFormTemplate is not available. Make sure RecruitFormTemplate.js is loaded first.');
        this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">RecruitFormTemplate is missing.</div>`;
        return false;
      }

      const formEl = await window.RecruitFormTemplate.getForm({
        title: 'Applicant',
        subtitle: 'Add a new applicant',
        formId: 'applicant-form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
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

      if (typeof window.AdvanceFormRender !== 'function') {
        console.error('AdvanceFormRender is not available. Make sure AdvanceFormRender.js is loaded before ApplicantCreate.js');
        this.ui?.showMessage?.('Form renderer not available', 'error');
        return false;
      }

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicant',
        targetSelector: '#applicant-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      return true;
    }

    async handleSubmit(formData) {
      this.ui?.showMessage('Saving applicant...', 'info');

      const payload = this.transformData(formData);

      let resp, data;
      try {
        resp = await fetch(`${this.rootURL}/recruit/CreateApplicant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        this.ui?.showMessage('Network error while saving applicant.', 'error');
        this.ui?.renderResult({ error: 'Network error' }, 'error');
        return false;
      }

      try { data = await resp.json(); } catch { data = {}; }

      if (!resp.ok || data?.isSuccess !== true) {
        const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
        this.ui?.showMessage(msg, 'error');
        this.ui?.renderResult(data, 'error');
        return false;
      }

      const resultArr = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
      const id = resultArr[0]?.ID ?? resultArr[0]?.Id ?? resultArr[0]?.id;

      this.ui?.clearMessages();
      this.ui?.renderResult(resultArr, 'success', `Applicant created successfully!${id ? ' ID: ' + id : ''}`);

      this.safeFormReset();
      return true;
    }

    transformData(formData) {
      const toRFC3339 = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? `${v}T00:00:00Z` : d.toISOString();
      };
      return {
        ...formData,
        birth_date: toRFC3339(formData.birth_date),
        start_date: toRFC3339(formData.start_date),
      };
    }

    safeFormReset() {
      const root = document.getElementById('applicant-form');
      if (!root) return;

      root.querySelectorAll('input, select, textarea').forEach((el) => {
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
    }
  }

  window.ApplicantCreate = ApplicantCreate;
}
