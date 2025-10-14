if (typeof window.InterviewCriteriaList === 'undefined') {
class InterviewCriteriaList {
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

    this.ENDPOINT_LIST    = `${this.rootURL}/recruit/GetAllInterviewCriteria`;
    this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetInterviewCriteriaByID/${id}`;
    this.ENDPOINT_CREATE  = `${this.rootURL}/recruit/CreateInterviewCriteria`;
    this.ENDPOINT_UPDATE  = (id) => `${this.rootURL}/recruit/UpdateInterviewCriteria/${id}`;
    this.ENDPOINT_DELETE  = (id) => `${this.rootURL}/recruit/DeleteInterviewCriteria/${id}`;
    this.ENDPOINT_SEED    = `${this.rootURL}/recruit/CreateRawSQL`;
    this.ENDPOINT_IMPORT  = `${this.rootURL}/recruit/GetInterviewCriteriaFromFile`;

    this.table = null;
    this.form  = null;
    this.ui = null;
    this.$tableHost = null;
    this.$panelHost = null;
    this.currentEditId = null;
  }

  _assertContainer() {
    if (!this.container) {
      console.error('InterviewCriteriaList: mainContainer not found (checked application.templateEngine.mainContainer, application.mainContainer, and #app).');
      return false;
    }
    return true;
  }

  _assertDeps() {
    const missing = [];
    if (typeof window.RecruitTableTemplate?.getTable !== 'function') missing.push('RecruitTableTemplate');
    if (typeof window.AdvanceTableRender !== 'function') missing.push('AdvanceTableRender');
    if (typeof window.AdvanceFormRender !== 'function') missing.push('AdvanceFormRender');
    if (missing.length) {
      console.error('Missing dependencies:', missing.join(', '));
      if (this.container) {
        this.container.innerHTML = `<div class="p-4 rounded border border-red-200 bg-red-50 text-red-700">Missing: ${missing.join(', ')}</div>`;
      }
      return false;
    }
    return true;
  }

  async render() {
    if (!this._assertContainer() || !this._assertDeps()) return false;

    this.container.innerHTML = '';
    const root = await window.RecruitTableTemplate.getTable({
      title: '📋 Interview Criteria Management',
      subtitle: 'Manage interview criteria and seed sample data',
      tableId: 'interviewcriteria-table',
      panelTitle: 'Criteria Form',
      backLink: 'recruit',
      backText: 'Back to Recruit Menu',
      colorPrimary: '#4f46e5',
      colorAccent: '#4338ca',
      iconPath: 'M3 4a1 1 0 011-1h3l1 2h6l1-2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4z'
    }, 'manage');

    this.container.appendChild(root);
    this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
      messagesId: 'criteriaMessages',
      resultId: 'criteriaResult'
    });

    this.$tableHost = root.querySelector('#recruit-table-container');
    this.$panelHost = root.querySelector('#recruit-sidepanel-container');

    if (this.$tableHost) {
      this.$tableHost.style.overflowY = 'auto';
      this.$tableHost.style.maxHeight = '60vh';
    }
    if (this.$panelHost) {
      this.$panelHost.style.overflowY = 'auto';
      this.$panelHost.style.maxHeight = '60vh';
    }

    root.querySelector('[data-action="seed"]')?.addEventListener('click', () => this.seedData());
    root.querySelector('[data-action="import"]')?.addEventListener('click', () => this.importFromFile());
    root.querySelector('[data-action="reset"]')?.addEventListener('click', () => this.resetForm());

    this.setupTable();
    this.setupForm();

    await this.renderTable();
    await this.renderForm();

    this._bindTableActions();
    return true;
  }

  setupTable() {
    this.table = new window.AdvanceTableRender(this.engine, {
      modelPath: 'recruit/interviewcriteria',
      data: [],
      targetSelector: '#recruit-table-container',
      customColumns: [
        {
          name: 'actions',
          label: 'Actions',
          template: `
            <div style="white-space:nowrap;">
              <button class="ic-btn-view text-blue-600 hover:underline" data-action="view" data-id="{ID}" style="margin-right:8px;">View</button>
              <button class="ic-btn-edit text-green-600 hover:underline" data-action="edit" data-id="{ID}" style="margin-right:8px;">Edit</button>
              <button class="ic-btn-delete text-red-600 hover:underline" data-action="delete" data-id="{ID}">Delete</button>
            </div>
          `
        }
      ]
    });
  }

  async renderTable() {
    if (!this.$tableHost) return;
    this.$tableHost.innerHTML = `<p class="p-2 text-gray-500">Loading interview criteria…</p>`;
    try {
      await this.table.loadSchema();
      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();
      await this.refreshTable();
    } catch (err) {
      console.error('renderTable error:', err);
      this.$tableHost.innerHTML = `<div class="p-4 text-red-600 bg-red-50 rounded">Error rendering table: ${err.message}</div>`;
    }
  }

  async refreshTable() {
    try {
      const resp = await fetch(this.ENDPOINT_LIST);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.isSuccess === false) throw new Error(data?.message || 'Failed to load interview criteria');
      const rows = (data.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
      this.table.setData(rows);
    } catch (err) {
      this.ui?.showMessage?.(`Error loading interview criteria: ${err.message}`, 'error');
    }
  }

  setupForm() {
    this.form = new window.AdvanceFormRender(this.engine, {
      modelPath: 'recruit/interviewcriteria',
      targetSelector: '#recruit-sidepanel-container',
      submitHandler: (fd) => this.handleFormSubmit(fd),
      autoFocus: true,
      validateOnBlur: true
    });
  }

  async renderForm() {
    try {
      await this.form.render();
      this.resetForm();
    } catch (err) {
      console.error('renderForm error:', err);
      this.$panelHost.innerHTML = `<div class="p-4 text-red-600 bg-red-50 rounded">Form render failed: ${err.message}</div>`;
    }
  }

  async handleFormSubmit(formData) {
    this.ui?.showMessage('Saving criteria...', 'info');

    const tryNum = (v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    };

    const payload = {
      ...formData,
      application_rounds_id: tryNum(formData.application_rounds_id),
      faculty_id: tryNum(formData.faculty_id),
      department_id: tryNum(formData.department_id),
      passing_score: (() => { const v = formData.passing_score; const f = parseFloat(v); return Number.isNaN(f) ? v : f; })()
    };

    const resolvedId = formData?.ID ?? formData?.Id ?? formData?.id ?? this.currentEditId ?? null;
    const isUpdate = resolvedId != null;
    const url = isUpdate ? this.ENDPOINT_UPDATE(resolvedId) : this.ENDPOINT_CREATE;

    let resp, data;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      this.ui?.showMessage('Network error while saving criteria.', 'error');
      return false;
    }

    try { data = await resp.json(); } catch { data = {}; }

    if (!resp.ok || data?.isSuccess !== true) {
      const msg = data?.result || data?.message || `Request failed (${resp.status})`;
      this.ui?.showMessage(msg, 'error');
      return false;
    }

    const result = data.result ?? {};
    const id = result?.ID ?? result?.id ?? (Array.isArray(result) ? result[0]?.ID ?? result[0]?.id : resolvedId);

    this.ui?.showMessage(`Interview criteria ${isUpdate ? 'updated' : 'created'} successfully! ID: ${id || '?'}`, 'success');
    await this.refreshTable();
    this.resetForm();
    return true;
  }

  async edit(id) {
    if (!id) return;
    try {
      this.currentEditId = Number(id);
      const resp = await fetch(this.ENDPOINT_GET_ONE(id));
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok || payload?.isSuccess === false) throw new Error(payload?.message || `Unable to load criteria #${id}`);
      const item = payload?.result || {};
      await this.form.render();
      this.form.setData(item);
      this.ui?.showMessage(`Editing criteria ID ${id}`, 'info');
    } catch (err) {
      this.ui?.showMessage(`Edit error: ${err.message}`, 'error');
    }
  }

  async view(id) {
    if (!id) return;
    try {
      const resp = await fetch(this.ENDPOINT_GET_ONE(id));
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok || payload?.isSuccess === false) throw new Error(payload?.message || `Unable to load criteria #${id}`);
      const item = payload?.result || payload || {};
      const details = `
ID: ${item.ID}
Application Round: ${item.ApplicationRound?.round_name || item.application_rounds_id}
Faculty: ${item.Faculty?.name || item.faculty_id}
Department: ${item.Department?.name || item.department_id}
Passing Score: ${item.passing_score}
      `;
      alert(details);
    } catch (err) {
      this.ui?.showMessage(`View error: ${err.message}`, 'error');
    }
  }

  async delete(id) {
    if (!id) return;
    if (!confirm('Delete this interview criteria?')) return;
    try {
      const resp = await fetch(this.ENDPOINT_DELETE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.isSuccess === false) throw new Error(data?.message || 'Delete failed');
      this.ui?.showMessage(`Interview criteria ID ${id} deleted`, 'success');
      await this.refreshTable();
    } catch (err) {
      this.ui?.showMessage(`Delete error: ${err.message}`, 'error');
    }
  }

  async seedData() {
    if (!confirm('This will create sample application rounds, faculties and departments. Continue?')) return;
    this.ui?.showMessage('Seeding sample data...', 'info');
    try {
      const res = await fetch(this.ENDPOINT_SEED, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.isSuccess === false) throw new Error(data?.message || 'Seed failed');
      this.ui?.showMessage('Sample data created', 'success');
      await this.refreshTable();
    } catch (err) {
      this.ui?.showMessage(`Seed error: ${err.message}`, 'error');
    }
  }

  async importFromFile() {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = '.csv,.json,text/csv,application/json';
    picker.style.display = 'none';
    document.body.appendChild(picker);

    const file = await new Promise((resolve) => {
      picker.onchange = () => resolve(picker.files?.[0] || null);
      picker.click();
    });
    document.body.removeChild(picker);
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      const resp = await fetch(this.ENDPOINT_IMPORT, { method: 'POST', body: formData });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.isSuccess === false) throw new Error(data?.message || 'Import failed');
      const count = Array.isArray(data.result) ? data.result.length : (data?.result?.count ?? 0);
      this.ui?.showMessage(`Imported ${count} criteria from ${file.name}`, 'success');
      await this.refreshTable();
    } catch (err) {
      this.ui?.showMessage(`Import error: ${err.message}`, 'error');
    }
  }

  resetForm() {
    this.currentEditId = null;
    try {
      const formRoot = this.form?.form?.html || this.form?.html;
      if (!formRoot) return;
      if (typeof formRoot.reset === 'function') { formRoot.reset(); return; }
      const fields = formRoot.querySelectorAll('input, select, textarea');
      fields.forEach((el) => {
        const tag = (el.tagName || '').toLowerCase();
        const type = (el.type || '').toLowerCase();
        if (tag === 'input') {
          if (type === 'checkbox' || type === 'radio') el.checked = false;
          else el.value = '';
        } else if (tag === 'select') el.selectedIndex = 0;
        else if (tag === 'textarea') el.value = '';
      });
    } catch (err) {
      this.ui?.showMessage('Error resetting form: ' + err.message, 'error');
    }
  }

  _bindTableActions() {
    if (!this.$tableHost) return;
    this.$tableHost.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id') || btn.dataset.id;
      if (!action || !id) return;
      if (action === 'edit') this.edit(id);
      else if (action === 'delete') this.delete(id);
      else if (action === 'view') this.view(id);
    });
  }
}

window.InterviewCriteriaList = InterviewCriteriaList;
}