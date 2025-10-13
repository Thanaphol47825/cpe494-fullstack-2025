if (typeof window !== 'undefined' && !window.ApplicationRoundList) {
  class ApplicationRoundList {

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

      this.ENDPOINT_LIST    = `${this.rootURL}/recruit/GetApplicationRounds`;
      this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetApplicationRound/${id}`;
      this.ENDPOINT_CREATE  = `${this.rootURL}/recruit/CreateApplicationRound`;
      this.ENDPOINT_UPDATE  = `${this.rootURL}/recruit/UpdateApplicationRound`;
      this.ENDPOINT_DELETE  = `${this.rootURL}/recruit/DeleteApplicationRound`;
      this.ENDPOINT_IMPORT  = `${this.rootURL}/recruit/ImportApplicationRoundsFromFile`;

      this.table = null;
      this.form  = null;
      this.currentEditId = null;
      this.ui = null;
      this.$tableHost = null;
      this.$panelHost = null;
    }

    _assertDeps() {
      const missing = [];
      if (typeof window.RecruitTableTemplate?.getTable !== 'function') missing.push('RecruitTableTemplate');
      if (typeof window.AdvanceTableRender !== 'function') missing.push('AdvanceTableRender');
      if (typeof window.AdvanceFormRender !== 'function') missing.push('AdvanceFormRender');
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

    _assertContainer() {
      if (!this.container) {
        console.error('ApplicationRoundList: mainContainer not found.');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer() || !this._assertDeps()) return false;

      this.container.innerHTML = '';

      const root = await window.RecruitTableTemplate.getTable({
        title: '🗓️ Application Rounds',
        subtitle: 'Manage and import application rounds',
        tableId: 'applicationround-table',
        panelTitle: 'Application Round Form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#059669',
        colorAccent: '#0d9488',
        iconPath: 'M12 6v6l4 2'
      }, 'manage');

      this.container.appendChild(root);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicationRoundMessages',
        resultId: 'applicationRoundResult'
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
        modelPath: 'recruit/applicationround',
        data: [],
        targetSelector: '#recruit-table-container',
        customColumns: [
          {
            name: 'actions',
            label: 'Actions',
            template: `
              <div style="white-space:nowrap;">
                <button class="al-btn-edit text-blue-600 hover:underline" data-action="edit" data-id="{ID}" style="margin-right:8px;">Edit</button>
                <button class="al-btn-delete text-red-600 hover:underline" data-action="delete" data-id="{ID}">Delete</button>
              </div>
            `
          }
        ]
      });
    }

    async renderTable() {
      if (!this.$tableHost) return;
      this.$tableHost.innerHTML = `<p style="padding:8px; color:#6b7280;">Loading application rounds…</p>`;

      await this.table.loadSchema();

      this.table.targetSelector = '#recruit-table-container';
      await this.table.render();

      await this.refreshTable();
    }

    async refreshTable() {
      try {
        const resp = await fetch(this.ENDPOINT_LIST);
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Failed to load application rounds');
        }
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        this.table.setData(rows);
      } catch (err) {
        this.ui?.showMessage(`Error loading application rounds: ${err.message}`, 'error');
      }
    }

    setupForm() {
      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationround',
        targetSelector: '#recruit-sidepanel-container',
        submitHandler: (formData) => this.handleFormSubmit(formData),
        autoFocus: true,
        validateOnBlur: true
      });
    }

    async renderForm() {
      await this.form.render();
      this.resetForm();
    }

    async handleFormSubmit(formData) {
      this.ui?.showMessage('Saving application round...', 'info');

      const resolvedId =
        formData?.ID ?? formData?.Id ?? formData?.id ?? this.currentEditId ?? null;

      const payload = {
        ...formData,
        ...(resolvedId != null ? { ID: Number(resolvedId), id: Number(resolvedId) } : {})
      };

      const isUpdate = resolvedId != null;
      const url = isUpdate ? this.ENDPOINT_UPDATE : this.ENDPOINT_CREATE;

      let resp, data;
      try {
        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        this.ui?.showMessage('Network error while saving application round.', 'error');
        return false;
      }

      try { data = await resp.json(); } catch { data = {}; }

      if (!resp.ok || data?.isSuccess !== true) {
        const msg =
          data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
        this.ui?.showMessage(msg, 'error');
        return false;
      }

      const result = data.result ?? {};
      const id =
        result?.ID ?? result?.Id ?? result?.id ??
        (Array.isArray(result) ? result[0]?.ID ?? result[0]?.Id ?? result[0]?.id : resolvedId);

      this.ui?.showMessage(
        `Application round ${isUpdate ? 'updated' : 'created'} successfully! ID: ${id || '?'}`,
        'success'
      );

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
        if (!resp.ok || payload?.isSuccess === false) {
          throw new Error(payload?.message || `Unable to load application round #${id}`);
        }
        const item = payload?.result || payload || {};
        await this.form.render();
        this.form.setData(item);
        this.ui?.showMessage(`Editing application round ID ${id}`, 'info');
      } catch (err) {
        this.ui?.showMessage(`Edit error: ${err.message}`, 'error');
      }
    }

    async delete(id) {
      if (!id) return;
      if (!confirm('Delete this application round?')) return;

      try {
        const resp = await fetch(this.ENDPOINT_DELETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) })
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Delete failed');
        }

        this.ui?.showMessage(`Application round ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } catch (err) {
        this.ui?.showMessage(`Delete error: ${err.message}`, 'error');
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
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Import failed');
        }

        const count = Array.isArray(data?.result)
          ? data.result.length
          : (data?.result?.count ?? 0);

        this.ui?.showMessage(`Imported ${count} application round(s) from ${file.name}.`, 'success');
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
      });
    }
  }

  window.ApplicationRoundList = ApplicationRoundList;
}
