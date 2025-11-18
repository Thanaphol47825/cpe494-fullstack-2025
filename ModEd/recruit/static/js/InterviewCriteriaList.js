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

    this.ui = null;
  }

  _assertContainer() {
    if (!this.container) {
      console.error('InterviewCriteriaList: mainContainer not found.');
      return false;
    }
    return true;
  }

  async render() {
    if (!this._assertContainer()) return false;

    window.interviewCriteriaList = this;

    this.container.innerHTML = '';

    if (typeof window.RecruitTableTemplate?.getTable !== 'function') {
      console.error('RecruitTableTemplate is not available.');
      this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">RecruitTableTemplate is missing.</div>`;
      return false;
    }

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

    // toolbar buttons
    this.addActionButtons(root);

    // initial load
    await this.refresh();
    return true;
  }

  addActionButtons(root) {
    let toolbar = root.querySelector('.recruit-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'recruit-toolbar flex gap-2 mb-4';
      const header = root.querySelector('.recruit-header');
      if (header) header.after(toolbar); else root.prepend(toolbar);
    }

    toolbar.innerHTML = `
      <button id="btnCreateCriteria" class="btn" style="background:#10b981;color:white;">➕ Create New</button>
      <button id="btnSeedCriteria" class="btn" style="background:#f59e0b;color:white;">🔧 Setup Test Data</button>
      <button id="btnRefreshCriteria" class="btn" style="background:#4f46e5;color:white;">🔄 Refresh</button>
    `;

    document.getElementById('btnCreateCriteria')?.addEventListener('click', () => this.goToCreate());
    document.getElementById('btnSeedCriteria')?.addEventListener('click', () => this.seedData());
    document.getElementById('btnRefreshCriteria')?.addEventListener('click', () => this.refresh());
  }

  async refresh() {
    this.ui?.showMessage('Loading interview criteria...', 'info');
    try {
      const resp = await fetch(this.ENDPOINT_LIST);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.isSuccess === false) {
        throw new Error(data?.message || `HTTP ${resp.status}`);
      }
      const items = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
      this.renderTable(items);
      this.ui?.clearMessages();
      if (items.length === 0) {
        this.ui?.showMessage('No interview criteria found. Click "🔧 Setup Test Data" to create sample data.', 'info');
      } else {
        this.ui?.showMessage(`Loaded ${items.length} interview criteria.`, 'success');
        setTimeout(() => this.ui?.clearMessages(), 1500);
      }
    } catch (err) {
      console.error('Error fetching criteria:', err);
      this.ui?.showMessage('Failed to load interview criteria: ' + (err.message || err), 'error');
      // show an empty table placeholder
      this.renderTable([]);
    }
  }

  renderTable(items) {
    const container = document.getElementById('recruit-table-container');
    if (!container) return;

    const rowsHtml = (items || []).map(it => this.renderTableRow(it)).join('\n') || `
      <tr><td colspan="6" class="px-6 py-4 text-sm text-gray-500">No records</td></tr>
    `;

    const html = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Round</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passing Score</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = html;
    this._bindTableActions(container);
  }

  renderTableRow(item) {
    const id = item.ID ?? item.Id ?? item.id ?? '';
    const round = item.ApplicationRound?.round_name ?? item.application_rounds_id ?? '-';
    const faculty = item.Faculty?.name ?? item.faculty_id ?? '-';
    const department = item.Department?.name ?? item.department_id ?? '-';
    const passing = (item.passing_score ?? item.PassingScore ?? item.passingScore);
    const passingText = (passing === undefined || passing === null) ? '-' : String(passing);

    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${round}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${faculty}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${department}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${passingText}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div style="white-space:nowrap;">
            <button class="text-indigo-600 hover:text-indigo-900 font-medium text-sm" data-action="edit" data-id="${id}" style="margin-right:8px;">Edit</button>
            <button class="text-red-600 hover:text-red-900 font-medium text-sm" data-action="delete" data-id="${id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }

  _bindTableActions(container) {
    if (!container) return;
    // remove previous handler to avoid duplicates
    container.replaceWith(container.cloneNode(true));
    const newContainer = document.getElementById('recruit-table-container');
    if (!newContainer) return;

    newContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (!action || !id) return;
      if (action === 'edit') this.goToEdit(id);
      else if (action === 'delete') this.deleteCriteria(id);
    });
  }

  goToCreate() {
    window.location.hash = '#recruit/interviewcriteria/create';
  }

  goToEdit(id) {
    window.location.hash = `#recruit/interviewcriteria/edit/${id}`;
  }

  async deleteCriteria(id) {
    if (!confirm(`Delete Interview Criteria #${id}?`)) return;
    try {
      const resp = await fetch(this.ENDPOINT_DELETE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.isSuccess === false) {
        throw new Error(data?.message || `HTTP ${resp.status}`);
      }
      this.ui?.showMessage(`Criteria #${id} deleted`, 'success');
      await this.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      this.ui?.showMessage('Delete failed: ' + (err.message || err), 'error');
    }
  }

  async seedData() {
    if (!confirm('This will create sample application rounds, faculties and departments. Continue?')) return;
    this.ui?.showMessage('Seeding sample data...', 'info');
    try {
      const res = await fetch(this.ENDPOINT_SEED, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.isSuccess === false) throw new Error(data?.message || `HTTP ${res.status}`);
      this.ui?.showMessage('Sample data created', 'success');
      await this.refresh();
    } catch (err) {
      console.error('Seed error:', err);
      this.ui?.showMessage('Seed failed: ' + (err.message || err), 'error');
    }
  }
}

window.InterviewCriteriaList = InterviewCriteriaList;
}