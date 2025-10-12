if (typeof window !== 'undefined' && !window.InternSkillPage) {
  class InternSkillPage {
    constructor(application) {
      this.application = application;
      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || '';
      this.endpoints = {
        list:  this.rootURL + '/curriculum/InternSkill',
        create: this.rootURL + '/curriculum/CreateInternSkill',
        update: (id) => this.rootURL + '/curriculum/UpdateInternSkill/' + id,
        remove: (id) => this.rootURL + '/curriculum/DeleteInternSkill/' + id,
      };

      this.form = null;
      this.tableContainer = null;
    }

    // ✅ helper: รับได้ทั้ง ID/id/Id
    getId(obj) {
      return obj?.ID ?? obj?.id ?? obj?.Id ?? null;
    }
    // ✅ helper: รับได้ทั้ง skill_name/SkillName
    getName(obj) {
      return obj?.skill_name ?? obj?.SkillName ?? '';
    }

    async render() {
      this.form = document.getElementById('intern-skill-form');
      this.tableContainer = document.getElementById('intern-skill-table');
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      await this.renderTable();

      this.tableContainer.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-action]');
        if (!a) return;
        e.preventDefault();
        const action = a.getAttribute('data-action');
        const id = a.getAttribute('data-id');
        if (action === 'edit') this.prefillForm(id);
        if (action === 'delete') this.handleDelete(id);
      });
    }

    async fetchList() {
      const res = await fetch(this.endpoints.list);
      const data = await res.json();
      if (!data.isSuccess) throw new Error(data.error || 'failed to load');
      return Array.isArray(data.result) ? data.result : [];
    }

    async renderTable() {
      const rows = await this.fetchList();

      if (this.application.template && this.application.template.Table && window.Mustache) {
        const tableData = {
          Title: 'Intern Skill List',
          Columns: [{ Label: 'ID' }, { Label: 'Skill Name' }, { Label: 'Actions' }]
        };
        const html = Mustache.render(this.application.template.Table, tableData);
        this.tableContainer.innerHTML = html;

        const tbody = this.tableContainer.querySelector('tbody[rel="body"]');
        if (tbody && this.application.template.TableRow && this.application.template.TableColumn) {
          tbody.innerHTML = '';
          rows.forEach(item => {
            const id = this.getId(item);
            const name = this.getName(item);

            const rowData = {
              Columns: [
                { Value: id, IsLink: false },
                { Value: name, IsLink: false },
                { Value: 'Edit | Delete', IsLink: true, Href: '#', Key: 'action' }
              ]
            };

            const rowHTML = Mustache.render(
              this.application.template.TableRow,
              rowData,
              { TableColumn: this.application.template.TableColumn }
            );
            const rowEl = this.application.create(rowHTML);

            // ✅ ใส่ data-id ให้ทั้งแถว เพื่อให้ prefillForm หาเจอ
            rowEl.setAttribute('data-id', id);

            // ถ้า template ไม่มีลิงก์ action ให้ฉีดเอง
            const lastTd = rowEl.querySelector('td:last-child');
            if (lastTd && !lastTd.querySelector('[data-action]')) {
              lastTd.innerHTML = `
                <a href="#" data-action="edit" data-id="${id}">Edit</a> |
                <a href="#" data-action="delete" data-id="${id}">Delete</a>
              `;
            } else {
              // ถ้ามี <a rel="action"> อยู่แล้ว ให้เติม data-id/data-action ให้ครบ
              rowEl.querySelectorAll('a[rel="action"]').forEach((lnk, idx) => {
                lnk.setAttribute('href', '#');
                lnk.setAttribute('data-id', id);
                lnk.setAttribute('data-action', idx === 0 ? 'edit' : 'delete');
              });
            }

            tbody.appendChild(rowEl);
          });
          return;
        }
      }

      // ✅ Fallback table ธรรมดาพร้อม data-id
      const table = document.createElement('table');
      table.border = 1;
      table.cellPadding = 6;
      table.innerHTML = `
        <thead>
          <tr><th>ID</th><th>Skill Name</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${
            rows.map(r => {
              const id = this.getId(r);
              const name = this.getName(r);
              return `
                <tr data-id="${id}">
                  <td>${id}</td>
                  <td>${name}</td>
                  <td>
                    <a href="#" data-action="edit" data-id="${id}">Edit</a> |
                    <a href="#" data-action="delete" data-id="${id}">Delete</a>
                  </td>
                </tr>
              `;
            }).join('')
          }
        </tbody>
      `;
      this.tableContainer.innerHTML = '';
      this.tableContainer.appendChild(table);
    }

    prefillForm(id) {
      const row = this.tableContainer.querySelector(`tr[data-id="${id}"]`)
              || this.tableContainer.querySelector(`a[data-id="${id}"]`)?.closest('tr');

      const nameCell = row ? row.children[1] : null;
      const skillName = nameCell ? nameCell.textContent.trim() : '';

      document.getElementById('editing_id').value = id;
      document.getElementById('skill_name').value = skillName;
      document.getElementById('submit-btn').textContent = 'Update Skill';
    }

    async handleSubmit(e) {
      e.preventDefault();
      const editingId = document.getElementById('editing_id').value.trim();
      const formData = new FormData(this.form);
      const name = formData.get('skill_name');
      if (!name) { alert('Please input skill name'); return; }

      try {
        let res;
        if (editingId) {
          res = await fetch(this.endpoints.update(editingId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_name: name })
          });
        } else {
          res = await fetch(this.endpoints.create, { method: 'POST', body: formData });
        }

        const data = await res.json();
        if (!data.isSuccess) throw new Error(data.error || 'request failed');

        this.form.reset();
        document.getElementById('editing_id').value = '';
        document.getElementById('submit-btn').textContent = 'Create Skill';
        await this.renderTable();
        alert(editingId ? 'Updated!' : 'Created!');
      } catch (err) {
        console.error(err);
        alert(err.message || 'Request error');
      }
    }

    async handleDelete(id) {
      if (!confirm(`Delete skill #${id}?`)) return;
      try {
        const res = await fetch(this.endpoints.remove(id), { method: 'POST' });
        const data = await res.json();
        if (!data.isSuccess) throw new Error(data.error || 'delete failed');
        await this.renderTable();
        alert('Deleted!');
      } catch (err) {
        console.error(err);
        alert(err.message || 'Delete error');
      }
    }
  }

  window.InternSkillPage = InternSkillPage;
}
