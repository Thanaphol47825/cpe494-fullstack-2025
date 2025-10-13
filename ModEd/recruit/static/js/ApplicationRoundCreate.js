if (typeof window !== 'undefined' && !window.ApplicationRoundCreate) {
  class ApplicationRoundCreate {
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
        console.error('ApplicationRoundCreate: mainContainer not found.');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer()) return false;

      this.container.innerHTML = '';

      if (typeof window.RecruitFormTemplate?.getForm !== 'function') {
        console.error('RecruitFormTemplate is not available.');
        this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">RecruitFormTemplate is missing.</div>`;
        return false;
      }

      const formEl = await window.RecruitFormTemplate.getForm({
        title: 'Application Round',
        subtitle: 'Add a new application round',
        formId: 'applicationround-form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#3b82f6',
        colorAccent: '#1d4ed8',
        iconPath:
          'M12 4v16m8-8H4'
      }, 'create');

      this.container.appendChild(formEl);

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'applicationRoundMessages',
        resultId: 'applicationRoundResult',
      });

      if (typeof window.AdvanceFormRender !== 'function') {
        console.error('AdvanceFormRender is not available.');
        this.ui?.showMessage?.('Form renderer not available', 'error');
        return false;
      }

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationround',
        targetSelector: '#applicationround-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();
      return true;
    }

    async handleSubmit(formData) {
      this.ui?.showMessage('Saving application round...', 'info');

      const payload = this.transformData(formData);

      let resp, data;
      try {
        resp = await fetch(`${this.rootURL}/recruit/CreateApplicationRound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        this.ui?.showMessage('Network error while saving application round.', 'error');
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
      this.ui?.renderResult(resultArr, 'success', `Application round created successfully!${id ? ' ID: ' + id : ''}`);

      this.safeFormReset();
      return true;
    }

    transformData(formData) {
      return { ...formData };
    }

    safeFormReset() {
      const root = document.getElementById('applicationround-form');
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

  window.ApplicationRoundCreate = ApplicationRoundCreate;
}
