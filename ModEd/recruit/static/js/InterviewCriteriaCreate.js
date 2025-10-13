class InterviewCriteriaCreate {
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
      console.error('InterviewCriteriaCreate: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
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
      title: 'Interview Criteria',
      subtitle: 'Create / Edit interview criteria',
      formId: 'createCriteriaForm',
      backLink: 'recruit',
      backText: 'Back to Recruit Menu',
      colorPrimary: '#4f46e5',
      colorAccent: '#4338ca',
      iconPath: 'M3 4a1 1 0 011-1h3l1 2h6l1-2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4z'
    }, 'create');

    this.container.appendChild(formEl);

    this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
      messagesId: 'criteriaMessages',
      resultId: 'criteriaResult'
    });

    if (typeof window.AdvanceFormRender !== 'function') {
      console.error('AdvanceFormRender is not available. Make sure AdvanceFormRender.js is loaded before InterviewCriteriaCreate.js');
      this.ui?.showMessage?.('Form renderer not available', 'error');
      return false;
    }

    this.form = new window.AdvanceFormRender(this.engine, {
      modelPath: 'recruit/InterviewCriteria',
      targetSelector: '#createCriteriaForm',
      submitHandler: (fd) => this.handleSubmit(fd),
      autoFocus: true,
      validateOnBlur: true
    });

    await this.form.render();
    return true;
  }

  async handleSubmit(formData) {
    this.ui?.showMessage('Saving criteria...', 'info');

    const payload = this.transformData(formData);
    console.log('Submitting criteria data:', payload);
    let resp, data;
    try {
      resp = await fetch(`${this.rootURL}/recruit/CreateInterviewCriteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      this.ui?.showMessage('Network error while saving criteria.', 'error');
      this.ui?.renderResult({ error: 'Network error' }, 'error');
      return false;
    }

    try { data = await resp.json(); } catch { data = {}; }

    if (!resp.ok || data?.isSuccess !== true) {
      const msg = data?.result || data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
      this.ui?.showMessage(msg, 'error');
      this.ui?.renderResult(data, 'error');
      return false;
    }

    const resultArr = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
    const id = resultArr[0]?.ID ?? resultArr[0]?.id;

    this.ui?.clearMessages();
    this.ui?.renderResult(resultArr, 'success', `Interview criteria saved${id ? ' (ID: ' + id + ')' : ''}`);

    this.safeFormReset();
    return true;
  }

  transformData(formData) {
    const tryNum = (v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    };
    return {
      ...formData,
      application_rounds_id: tryNum(formData.application_rounds_id),
      faculty_id: tryNum(formData.faculty_id),
      department_id: tryNum(formData.department_id),
      passing_score: (() => {
        const v = formData.passing_score;
        const f = parseFloat(v);
        return Number.isNaN(f) ? v : f;
      })()
    };
  }

  safeFormReset() {
    const root = document.getElementById('createCriteriaForm');
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

if (typeof window !== "undefined") window.InterviewCriteriaCreate = InterviewCriteriaCreate;