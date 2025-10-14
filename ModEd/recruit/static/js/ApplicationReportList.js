if (typeof window !== 'undefined' && !window.ApplicationReportList) {
  class ApplicationReportList {
    constructor(app, rootURL) {
      this.app = app || {};
      this.engine = this.app.templateEngine ? this.app.templateEngine : this.app;
      this.container = this.engine?.mainContainer || document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.__ROOT_URL__ ?? '';

      this.ENDPOINT_LIST = `${this.rootURL}/recruit/GetApplicationReports`;
      this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetApplicationReport/${id}`;
      this.ENDPOINT_CREATE = `${this.rootURL}/recruit/CreateApplicationReport`;
      this.ENDPOINT_UPDATE = `${this.rootURL}/recruit/UpdateApplicationReport`;
      this.ENDPOINT_DELETE = `${this.rootURL}/recruit/DeleteApplicationReport`;

      this.table = null;
      this.form = null;
      this.ui = null;
      this.currentEditId = null;
      this.$tableHost = null;
      this.$panelHost = null;
    }

    async render() {
      if (!this.container) return;

      const root = await window.RecruitTableTemplate.getTable({
        title: '📊 Application Report Management',
        subtitle: 'Manage reports for applicants and rounds',
        tableId: 'applicationreport-table',
        panelTitle: 'Application Report Form',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#9333ea',
        colorAccent: '#7e22ce',
      }, 'manage');

      this.container.innerHTML = '';
      this.container.appendChild(root);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(root, {
        messagesId: 'applicationReportMessages',
        resultId: 'applicationReportResult'
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

      this.setupTable();
      this.setupForm();

      await this.renderTable();
      await this.renderForm();

      this._bindTableActions();

      root.querySelector('[data-action="reset"]')?.addEventListener('click', () => this.resetForm());
    }

    setupTable() {
      this.table = new window.AdvanceTableRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        targetSelector: '#recruit-table-container',
        customColumns: [
          {
            name: 'actions',
            label: 'Actions',
            template: `
              <div style="white-space:nowrap;">
                <button data-action="edit" data-id="{ID}" class="text-blue-600 hover:underline mr-2">Edit</button>
                <button data-action="delete" data-id="{ID}" class="text-red-600 hover:underline">Delete</button>
              </div>`
          }
        ]
      });
    }

    async renderTable() {
      await this.table.loadSchema();
      await this.table.render();
      await this.refreshTable();
    }

    setupForm() {
      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/applicationreport',
        targetSelector: '#recruit-sidepanel-container',
        submitHandler: (formData) => this.handleFormSubmit(formData),
        autoFocus: true,
        validateOnBlur: true
      });
    }

    async renderForm() {
      await this.form.render();
      this._hideUnnecessaryFields();
      this._changeSubmitButtonLabel("Create");
    }

    async handleFormSubmit(formData) {
      this.ui?.showMessage('Saving report...', 'info');

      const resolvedId = formData?.ID ?? formData?.Id ?? formData?.id ?? this.currentEditId ?? null;
      const isUpdate = resolvedId != null;

      const payload = {
        ...formData,
        ...(isUpdate ? { ID: Number(resolvedId) } : {})
      };

      const url = isUpdate ? this.ENDPOINT_UPDATE : this.ENDPOINT_CREATE;

      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!data?.isSuccess) throw new Error(data?.message || 'Save failed');

        this.ui?.showMessage(`Report ${isUpdate ? 'updated' : 'created'} successfully`, 'success');
        await this.refreshTable();
        this.resetForm();
      } catch (err) {
        this.ui?.showMessage('Error saving report: ' + err.message, 'error');
      }
    }

    async refreshTable() {
      const resp = await fetch(this.ENDPOINT_LIST);
      const data = await resp.json().catch(() => ({}));

      if (!data?.isSuccess) return;

      const rows = (data.result || []).map(r => ({
        ...r,
        ID: r.id ?? r.Id ?? r.ID,
      }));

      console.log('[DEBUG] mapped rows:', rows);
      this.table.setData(rows);
    }

    async edit(id) {
      try {
        this.currentEditId = id;
        const resp = await fetch(this.ENDPOINT_GET_ONE(id));
        const payload = await resp.json();

        if (!payload?.isSuccess) throw new Error(payload?.message || 'Failed to fetch report');

        await this.form.render();
        this._hideUnnecessaryFields();
        this._changeSubmitButtonLabel("Update");

        this.form.setData(payload.result);
        this.ui?.showMessage(`Editing report ID ${id}`, 'info');
      } catch (err) {
        this.ui?.showMessage('Edit error: ' + err.message, 'error');
      }
    }

    async delete(id) {
      if (!confirm('Delete this report?')) return;
      try {
        const resp = await fetch(this.ENDPOINT_DELETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) })
        });
        const data = await resp.json();
        if (!data?.isSuccess) throw new Error(data?.message || 'Delete failed');
        this.ui?.showMessage(`Report ID ${id} deleted successfully.`, 'success');
        await this.refreshTable();
      } catch (err) {
        this.ui?.showMessage('Delete error: ' + err.message, 'error');
      }
    }

    resetForm() {
      this.currentEditId = null;
      try {
        const formRoot = this.form?.form?.html || this.form?.html;
        if (!formRoot) return;

        if (typeof formRoot.reset === 'function') {
          formRoot.reset();
          this.ui?.showMessage('Form reset successfully', 'info');
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

        this._changeSubmitButtonLabel("Create");
        this.ui?.showMessage('Form reset successfully', 'info');
      } catch (err) {
        this.ui?.showMessage('Error resetting form: ' + err.message, 'error');
      }
    }

    _bindTableActions() {
      if (!this.$tableHost) return;
      this.$tableHost.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'edit') this.edit(id);
        if (action === 'delete') this.delete(id);
      });
    }

    _hideUnnecessaryFields() {
      const hiddenFields = [
        'id',
        'applicant',
        'applicationround',
        'faculty',
        'department'
      ];

      hiddenFields.forEach((name) => {
        const field = this.form.form?.html?.querySelector(`[name="${name}"]`);
        if (field) {
          const wrapper = field.closest('.form-field, div');
          if (wrapper) wrapper.style.display = 'none';
          else field.style.display = 'none';
        }
      });
    }

    _changeSubmitButtonLabel(labelText = 'Submit') {
      const formEl = this.form.form?.html || this.form?.html;
      if (!formEl) return;

      const submitBtn = formEl.querySelector('input[type="submit"], button[type="submit"]');
      if (!submitBtn) return;

      if (submitBtn.tagName.toLowerCase() === 'input') {
        submitBtn.value = labelText;
      } else {
        submitBtn.textContent = labelText;
      }
    }
  }
  window.ApplicationReportList = ApplicationReportList;
}
