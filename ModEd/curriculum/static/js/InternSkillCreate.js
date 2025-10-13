if (typeof window !== 'undefined' && !window.InternSkillCreate) {
  class InternSkillCreate {
    constructor(application) {
      this.application = application;

      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || '';
      this.endpoints = {
        list: this.rootURL + '/curriculum/InternSkill',
        create: this.rootURL + '/curriculum/CreateInternSkill',
        update: (id) => this.rootURL + '/curriculum/UpdateInternSkill/' + id,
        remove: (id) => this.rootURL + '/curriculum/DeleteInternSkill/' + id,
      };
    }

    // ---------------------- utilities ----------------------
    getId(obj) { return obj?.ID ?? obj?.id ?? obj?.Id ?? null; }
    getName(obj) { return obj?.skill_name ?? obj?.SkillName ?? ''; }

    makeSpinner(id = 'loading-indicator') {
      const wrap = document.createElement('div');
      wrap.id = id;
      wrap.className = 'flex items-center justify-center my-4';
      wrap.innerHTML = `
        <div style="
            width:28px;height:28px;border:3px solid #d1d5db;border-top-color:#2563eb;
            border-radius:50%;animation: spin 0.8s linear infinite;"></div>
        <span style="margin-left:10px;color:#374151">Loading...</span>
      `;
      return wrap;
    }

    toast(type, msg) {
      const color =
        type === 'success' ? { bg: '#dcfce7', border: '#86efac', text: '#166534' } :
          type === 'error' ? { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' } :
            { bg: '#e0f2fe', border: '#bae6fd', text: '#0c4a6e' };
      const el = this.application.create(`
        <div style="
            background:${color.bg};border:1px solid ${color.border};
            color:${color.text};padding:12px 14px;border-radius:10px;margin-bottom:16px;">
          <strong style="margin-right:6px;text-transform:capitalize;">${type}!</strong> ${msg}
        </div>
      `);
      return el;
    }

    // ---------------------- render ----------------------
    async render() {
      this.application.mainContainer.innerHTML = '';

      const page = this.application.create(`
        <div class="bg-gray-100 min-h-screen py-8">
          <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">Create Intern Skill</h1>
          <!-- form -->
          <form id="intern-skill-form" class="form-container">
            <input type="hidden" id="editing_id" name="editing_id" />
            <div class="form-field">
              <label for="skill_name" class="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
              <input id="skill_name" name="skill_name" type="text" required placeholder="Enter Skill Name" class="form-input" />
            </div>
            <button id="submit-btn" type="submit" class="form-submit-btn" style="width:100%;">
              Create Intern Skill
            </button>
          </form>

          <!-- table area -->
          <div id="intern-skill-table" class="form-container" style="margin-top:24px;">
            <div id="table-host"></div>
          </div>
        </div>

      `);

      this.application.mainContainer.appendChild(page);

      document.getElementById('intern-skill-form').addEventListener('submit', this.handleSubmit.bind(this));

      await this.renderTable();
      this.bindTableActions();
    }
    async fetchList() {
      const res = await fetch(this.endpoints.list);
      const data = await res.json();
      if (!data.isSuccess) throw new Error(data.error || 'failed to load');
      return Array.isArray(data.result) ? data.result : [];
    }

    async renderTable() {
      const host = document.getElementById('table-host');
      host.innerHTML = '';
      const spinner = this.makeSpinner();
      host.appendChild(spinner);

      try {
        const rows = await this.fetchList();
        spinner.remove();

        const tbl = document.createElement('table');
        tbl.className = 'table-blue';
        tbl.innerHTML = `
          <thead>
            <tr>
              <th style="width:120px">ID</th>
              <th>Skill Name</th>
              <th style="width:200px">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
          rows.length
            ? rows.map(r => {
              const id = this.getId(r);
              const name = this.getName(r);
              return `
                      <tr data-id="${id}">
                        <td>${id}</td>
                        <td>${name}</td>
                        <td>
                          <a href="#" data-action="edit" data-id="${id}" class="button">Edit</a>
                          <a href="#" data-action="delete" data-id="${id}" class="button" style="background:#ef4444">Delete</a>
                        </td>
                      </tr>
                    `;
                }).join('')
          : `<tr><td colspan="3" class="ui-table-empty">No data available</td></tr>`
          }
          </tbody>
        `;
        host.appendChild(tbl);
      } catch (e) {
        spinner.remove();
        host.appendChild(this.toast('error', e.message || 'Load table failed'));
      }
    }

    bindTableActions() {
      const wrapper = document.getElementById('intern-skill-table');
      wrapper.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-action]');
        if (!a) return;
        e.preventDefault();
        const action = a.getAttribute('data-action');
        const id = a.getAttribute('data-id');
        if (action === 'edit') this.prefillForm(id);
        if (action === 'delete') this.handleDelete(id);
      });
    }

    prefillForm(id) {
      const row = document.querySelector(`#intern-skill-table tr[data-id="${id}"]`);
      const name = row?.children?.[1]?.textContent?.trim() || '';
      document.getElementById('editing_id').value = id;
      document.getElementById('skill_name').value = name;
      document.getElementById('submit-btn').textContent = 'Update Intern Skill';
      // focus UX
      document.getElementById('skill_name').focus();
    }

    resetForm() {
      const form = document.getElementById('intern-skill-form');
      form.reset();
      document.getElementById('editing_id').value = '';
      document.getElementById('submit-btn').textContent = 'Create Intern Skill';
    }

    async handleSubmit(e) {
      e.preventDefault();
      const form = e.target;

      const editingId = (document.getElementById('editing_id').value || '').trim();
      const skill_name = (document.getElementById('skill_name').value || '').trim();
      if (!skill_name) {
        form.parentNode.insertBefore(this.toast('error', 'Please input skill name'), form);
        return;
      }

      const btn = document.getElementById('submit-btn');
      const oldLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = editingId ? 'Updating...' : 'Creating...';

      try {
        const payload = { skill_name };
        const res = await fetch(
          editingId ? this.endpoints.update(editingId) : this.endpoints.create,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        const data = await res.json();
        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || 'Request failed');
        }

        const toast = this.toast('success', editingId ? 'Skill updated.' : 'Skill created.');
        form.parentNode.insertBefore(toast, form);

        this.resetForm();
        await this.renderTable();
        setTimeout(() => toast.remove(), 2500);
      } catch (err) {
        const toast = this.toast('error', err.message || 'Request error');
        form.parentNode.insertBefore(toast, form);
        setTimeout(() => toast.remove(), 3500);
      } finally {
        btn.disabled = false;
        btn.textContent = oldLabel;
      }
    }

    async handleDelete(id) {
      if (!confirm(`Delete skill #${id}?`)) return;
      const host = document.getElementById('table-host');
      const spin = this.makeSpinner('delete-spinner');
      host.appendChild(spin);
      try {
        const res = await fetch(this.endpoints.remove(id), { method: 'POST' });
        const data = await res.json();
        if (!data.isSuccess) throw new Error(data.error || 'Delete failed');
        await this.renderTable();
      } catch (err) {
        host.appendChild(this.toast('error', err.message || 'Delete error'));
      } finally {
        spin.remove();
      }
    }
  }

  window.InternSkillCreate = InternSkillCreate;
}
