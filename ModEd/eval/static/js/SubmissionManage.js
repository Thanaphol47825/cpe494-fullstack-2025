class SubmissionManage {
  constructor(application) {
    this.application = application;
    this.api = new EvalApiService();
  }

  // initialize into optional parent element (renders into module area when provided)
  async initialize(parent) {
    // Remove legacy form/demo elements across the document first
    try {
      const removeSelectors = [
        '#submissionForm', '#submission-demo', '#submissionResult', '#submission-result',
        '.demo-section', '.submission-demo', '.submission-form', '.create-submission', 'form'
      ];
      removeSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
      // Also remove any input/select/textarea that are not part of delete controls (we'll re-render clean)
      document.querySelectorAll('input,textarea,select').forEach(el=>el.remove());
    } catch (e) { /* ignore */ }

    // Use provided parent if given, otherwise create or reuse a dedicated root so manage page is isolated and contains no forms
    let root = parent || document.getElementById('submission-manage-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'submission-manage-root';
      // insert at top of body to make it visible and isolated
      document.body.insertBefore(root, document.body.firstChild);
    }
    this.container = root;

    // Render an accessible, read-only table container (no forms or inputs)
    this.container.innerHTML = `
      <div class="card">
        <h2>Manage Submissions</h2>
        <div style="overflow:auto">
          <table id="submissionsTable" style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">ID</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">Title</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">Student</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">SubmittedAt</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">Score</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">Status</th>
                <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left">Actions</th>
              </tr>
            </thead>
            <tbody id="submissionsTbody"></tbody>
          </table>
        </div>
      </div>
    `;

    await this.loadAllSubmissions();
  }

  async loadAllSubmissions() {
    const data = await this.api.getAllSubmissions();
    const tbody = this.container.querySelector('#submissionsTbody');
    if (!tbody) return;
    if (data.isSuccess && Array.isArray(data.result)) {
      // clear tbody
      tbody.innerHTML = '';
      data.result.forEach(s => {
        const id = s.id || s.ID || s.Id || '';
        const title = s.title || s.Title || '';
        const student = s.studentName || s.StudentName || '';
        const submittedAt = s.submittedAt || s.SubmittedAt || '';
        const score = (s.score !== undefined && s.score !== null) ? s.score : (s.Score !== undefined ? s.Score : '');
        const status = s.status || s.Status || '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="border-bottom:1px solid #eee;padding:8px">${id}</td>
          <td style="border-bottom:1px solid #eee;padding:8px">${escapeHtml(title)}</td>
          <td style="border-bottom:1px solid #eee;padding:8px">${escapeHtml(student)}</td>
          <td style="border-bottom:1px solid #eee;padding:8px">${escapeHtml(submittedAt)}</td>
          <td style="border-bottom:1px solid #eee;padding:8px">${escapeHtml(String(score))}</td>
          <td style="border-bottom:1px solid #eee;padding:8px">${escapeHtml(status)}</td>
          <td style="border-bottom:1px solid #eee;padding:8px"><button class="delete-submission" data-id="${id}">Delete</button></td>
        `;
        tbody.appendChild(tr);
      });

      // attach delete handlers
      tbody.querySelectorAll('.delete-submission').forEach(b => b.addEventListener('click', (e)=> this.deleteSubmission(e.target.dataset.id)));

      // Final safety: remove any forms/inputs accidentally created inside the root
      this.container.querySelectorAll('form,input,textarea,select').forEach(el=>el.remove());
    } else {
      const container = this.container.querySelector('#submissionsTbody');
      if (container) container.innerHTML = `<tr><td colspan="7">Error loading submissions: ${escapeHtml(JSON.stringify(data))}</td></tr>`;
    }
  }

  // edit functionality intentionally removed; this page only lists and deletes submissions

  async deleteSubmission(id) {
    if (!confirm('Delete submission ' + id + '?')) return;
    const res = await fetch(RootURL + `/eval/submission/delete/${id}`);
    const j = await res.json();
    if (j.isSuccess) { alert('Deleted'); await this.loadAllSubmissions(); } else alert('Delete failed: '+JSON.stringify(j));
  }
}

window.SubmissionManage = SubmissionManage;

// Small helper to prevent XSS when rendering strings
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
