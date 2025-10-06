class AssignmentManage {
  constructor() {
    this.api = new EvalApiService();
    this.templatePath = '/eval/static/view/AssignmentManage.tpl';
  }

  async initialize() {
    const container = document.getElementById('assignment-manage') || document.getElementById('MainContainer') || document.body;
    if (!container) return;

    const tpl = await this.fetchTpl(this.templatePath);
    container.innerHTML = tpl;

    await this.loadAssignments();
  }

  async fetchTpl(path) {
    try {
      const res = await fetch(RootURL + path);
      return await res.text();
    } catch (err) {
      console.error('Failed to fetch tpl', err);
      return '<div>Error loading manage template</div>';
    }
  }

  async loadAssignments() {
    const data = await this.api.getAllAssignments();
    const listEl = document.getElementById('assignmentsList');
    if (!listEl) return;

    if (data.isSuccess && Array.isArray(data.result)) {
      listEl.innerHTML = '';
      data.result.forEach(a => {
        const id = a.id || a.ID;
        const title = a.title || a.Title;
        const div = document.createElement('div');
        div.className = 'assignment-item';
        div.innerHTML = `<strong>${title}</strong> (ID:${id}) <button data-id="${id}" class="edit-assignment">Edit</button> <button data-id="${id}" class="view-submissions">View Submissions</button> <button data-id="${id}" class="delete-assignment">Delete</button>`;
        listEl.appendChild(div);
      });

      // attach handlers
      listEl.querySelectorAll('.edit-assignment').forEach(btn => btn.addEventListener('click', (e)=> this.editAssignment(e.target.dataset.id)));
      listEl.querySelectorAll('.view-submissions').forEach(btn => btn.addEventListener('click', (e)=> this.viewSubmissions(e.target.dataset.id)));
      listEl.querySelectorAll('.delete-assignment').forEach(btn => btn.addEventListener('click', (e)=> this.deleteAssignment(e.target.dataset.id)));
    } else {
      listEl.textContent = 'Error loading assignments: ' + JSON.stringify(data);
    }
  }

  async deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete assignment ID ' + id + '?')) return;
    try {
      const res = await fetch(RootURL + `/eval/assignment/delete/${id}`);
      const j = await res.json();
      if (j.isSuccess) {
        alert('Assignment deleted');
        // clear editor if it was editing this assignment
        const editor = document.getElementById('assignmentEditor'); if (editor) editor.innerHTML = '';
        await this.loadAssignments();
      } else {
        alert('Delete failed: ' + JSON.stringify(j));
      }
    } catch (err) {
      console.error('Delete error', err); alert('Delete failed: ' + err.message);
    }
  }

  async editAssignment(id) {
    const res = await fetch(RootURL + `/eval/assignment/get/${id}`);
    const json = await res.json();
    if (!json.isSuccess) return alert('Cannot load assignment');
    const a = json.result;

    const editor = document.getElementById('assignmentEditor');
    if (!editor) return;
    editor.innerHTML = `
      <h3>Edit Assignment (ID: ${a.ID || a.id})</h3>
      <div>
        <label>Title</label>
        <input id="editTitle" value="${(a.title||a.Title||'').replace(/"/g,'&quot;')}" />
      </div>
      <div>
        <label>Description</label>
        <textarea id="editDescription">${(a.description||a.Description||'')}</textarea>
      </div>
      <div>
        <label>Start Date</label>
        <input id="editStart" type="datetime-local" />
      </div>
      <div>
        <label>Due Date</label>
        <input id="editDue" type="datetime-local" />
      </div>
      <div>
        <label>Max Score</label>
        <input id="editMax" type="number" value="${a.maxScore||a.MaxScore||100}" />
      </div>
      <div style="margin-top:8px">
        <button id="saveAssignment">Save</button>
        <button id="deleteAssignment">Delete</button>
        <button id="cancelEdit">Cancel</button>
      </div>
    `;

    // prefill datetime values if possible
    try {
      if (a.StartDate || a.startDate) document.getElementById('editStart').value = new Date(a.StartDate||a.startDate).toISOString().slice(0,16);
      if (a.DueDate || a.dueDate) document.getElementById('editDue').value = new Date(a.DueDate||a.dueDate).toISOString().slice(0,16);
    } catch (e) { /* ignore */ }

    document.getElementById('cancelEdit').addEventListener('click', ()=>{ editor.innerHTML = ''; });
    document.getElementById('deleteAssignment').addEventListener('click', async ()=>{
      if (!confirm('Delete this assignment?')) return;
      const delRes = await fetch(RootURL + `/eval/assignment/delete/${id}`);
      const delJson = await delRes.json();
      if (delJson.isSuccess) { alert('Deleted'); editor.innerHTML=''; await this.loadAssignments(); }
      else alert('Delete failed: '+JSON.stringify(delJson));
    });

    document.getElementById('saveAssignment').addEventListener('click', async ()=>{
      const payload = {
        ID: a.ID || a.id,
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        startDate: document.getElementById('editStart').value ? new Date(document.getElementById('editStart').value).toISOString() : null,
        dueDate: document.getElementById('editDue').value ? new Date(document.getElementById('editDue').value).toISOString() : null,
        maxScore: Number(document.getElementById('editMax').value||100),
        // keep defaults for other fields
      };

      const updateRes = await fetch(RootURL + '/eval/assignment/update', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      const upJson = await updateRes.json();
      if (upJson.isSuccess) { alert('Saved'); editor.innerHTML=''; await this.loadAssignments(); }
      else alert('Save failed: '+JSON.stringify(upJson));
    });
  }

  async viewSubmissions(assignmentId) {
    // load all submissions and filter by assignmentId
    const res = await this.api.getAllSubmissions();
    const container = document.getElementById('assignmentSubmissions');
    if (!container) return;
    if (res.isSuccess && Array.isArray(res.result)) {
      const filtered = res.result.filter(s => (s.assignmentId||s.AssignmentID||s.AssignmentId) == assignmentId);
      if (!filtered.length) { container.textContent = 'No submissions for this assignment.'; return; }
      container.innerHTML = '';
      filtered.forEach(s => {
        const student = s.studentName || s.StudentName || '';
        const submittedAt = s.submittedAt || s.SubmittedAt || '';
        const isLate = s.isLate || s.IsLate || false;
        const score = s.score !== undefined ? s.score : (s.Score || 'Not graded');
        const div = document.createElement('div');
        div.className = 'submission-item';
        div.innerHTML = `<div><strong>${student}</strong> - ${submittedAt} - Score: ${score} - ${isLate?'<span style="color:red">LATE</span>':'On time'} <button data-id="${s.id||s.ID||s.Id}" class="edit-submission">Edit</button></div>`;
        container.appendChild(div);
      });
      // attach edit handlers
      container.querySelectorAll('.edit-submission').forEach(btn=> btn.addEventListener('click', (e)=> this.editSubmission(e.target.dataset.id)));
    } else {
      container.textContent = 'Error loading submissions: ' + JSON.stringify(res);
    }
  }

  async editSubmission(submissionId) {
    // fetch submission data then open a small editor (reuse submission form)
    const res = await fetch(RootURL + `/eval/submission/get/${submissionId}`);
    const json = await res.json();
    if (!json.isSuccess) return alert('Cannot load submission');
    const s = json.result;

    // allow editing score and feedback via prompt (small scope)
    const newScore = prompt('Edit Score (leave blank to keep)', s.score!==undefined?String(s.score):'');
    if (newScore === null) return;
    if (newScore !== '') s.score = Number(newScore);
    const newFeedback = prompt('Edit Feedback (leave blank to keep)', s.feedback||s.Feedback||'');
    if (newFeedback === null) return;
    if (newFeedback !== '') s.feedback = newFeedback;

    const updateRes = await fetch(RootURL + '/eval/submission/update', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(s)});
    const upJson = await updateRes.json();
    if (upJson.isSuccess) {
      alert('Submission updated');
      // refresh current view
      const currentAssignmentBtn = document.querySelector('#assignmentsList .view-submissions');
      await this.loadAssignments();
    } else alert('Update failed: ' + JSON.stringify(upJson));
  }
}

window.AssignmentManage = AssignmentManage;
