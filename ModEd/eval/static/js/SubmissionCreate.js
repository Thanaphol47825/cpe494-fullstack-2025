// SubmissionCreate - General submission creation feature
class SubmissionCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
    this.tplPath = '/eval/static/view/SubmissionForm.tpl';
  }

  async initialize() {
    const container = document.getElementById('submission-demo') || document.getElementById('MainContainer') || document.body;
    if (!container) return;

    // load tpl
    const tpl = await this.fetchTpl(this.tplPath);
    container.innerHTML = tpl.replace('{{title}}','Submit Assignment');

    const form = document.getElementById('submissionForm');
    if (form) form.addEventListener('submit', (e)=> this.handleSubmit(e));

    // populate assignment select
    await this.populateAssignmentSelect();

    // Load initial submissions list
    await this.loadAllSubmissions();
  }

  async fetchTpl(path){
    const candidates = [];
    try{ if (typeof RootURL !== 'undefined' && RootURL !== null) candidates.push(String(RootURL).replace(/\/$/, '') + path); }catch(e){}
    candidates.push(path);

    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
        return await res.text();
      } catch (err) {
        lastErr = err;
        console.warn('fetchTpl attempt failed for', url, err);
      }
    }

    console.error('All fetchTpl attempts failed. Tried:', candidates, 'lastErr:', lastErr);
    // return a small inline fallback so UI still works
    return `
      <div class="card">
        <h2>Submit Assignment</h2>
        <form id="submissionForm">
          <label>Assignment</label>
          <div id="assignmentSelectContainer"></div>
          <label>Student ID</label>
          <input type="number" name="studentId" />
          <label>Student Name</label>
          <input type="text" name="studentName" />
          <label>Submitted At</label>
          <input type="datetime-local" name="submittedAt" />
          <label>Content</label>
          <textarea name="content"></textarea>
          <div style="margin-top:8px"><button type="submit">Submit</button></div>
        </form>
        <pre id="submissionResult"></pre>
        <div id="allSubmissions"></div>
      </div>
    `;
  }

  async populateAssignmentSelect(){
    const data = await this.apiService.getAllAssignments();
    const container = document.getElementById('assignmentSelectContainer');
    if (!container) return;
    // cache assignments for quick lookup when autofilling
    this.assignments = {};
    const select = document.createElement('select');
    select.name = 'assignmentId';
    select.className = 'w-full rounded-md border border-gray-300 px-3 py-2';
    select.innerHTML = '<option value="">Please select assignment</option>';
    if (data.isSuccess && Array.isArray(data.result)){
      data.result.forEach(a=>{
        const id = a.id||a.ID; const title = a.title||a.Title||`Assignment ${id}`;
        const opt = document.createElement('option'); opt.value = id; opt.textContent = title; select.appendChild(opt);
        this.assignments[id] = a;
      })
    }
    container.innerHTML = '';
    container.appendChild(select);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // coerce types
    if (data.assignmentId) data.assignmentId = Number(data.assignmentId);
    if (data.studentId) data.studentId = Number(data.studentId);

    // If an assignment is selected, auto-fill submission type/title/maxScore from cached assignment
    if (data.assignmentId) {
      let a = this.assignments && this.assignments[data.assignmentId];
      if (!a) {
        // fallback: try fetching single assignment (do not block submission on failure)
        try {
          const res = await fetch(RootURL + `/eval/assignment/get/${data.assignmentId}`);
          const j = await res.json();
          if (j.isSuccess) a = j.result;
        } catch (err) {
          console.warn('Failed to auto-fill from assignment (fetch)', err);
        }
      }

      if (a) {
        data.type = 'assignment';
        data.title = a.title || a.Title || data.title || '';
        data.maxScore = a.maxScore || a.MaxScore || data.maxScore || 100;
        // determine late by comparing submittedAt to assignment due date if available
        try {
          const due = a.dueDate || a.DueDate || a.Due || null;
          if (due) {
            const dueDate = new Date(due);
            const submitted = new Date(data.submittedAt || new Date().toISOString());
            data.isLate = submitted.getTime() > dueDate.getTime();
          }
        } catch (e) { console.warn('Cannot compute isLate', e); }
      } else {
        console.warn('Assignment data not available for autofill, continuing without assignment autofill');
      }
    }

  // set submittedAt to current time if not present
  if (!data.submittedAt) data.submittedAt = new Date().toISOString();

  // ensure status default
  if (!data.status) data.status = 'submitted';

    // Validate
  const validation = this.validator.validateSubmission ? this.validator.validateSubmission(data) : { errors: [] };
  if (this.validator && !this.validator.showErrors(validation.errors)) return;

    // create submission
    const result = await this.apiService.createSubmission(data);
    document.getElementById('submissionResult').textContent = JSON.stringify(result, null, 2);
    await this.loadAllSubmissions();
    form.reset();
  }

  async loadAllSubmissions() {
    const data = await this.apiService.getAllSubmissions();
    const container = document.getElementById('allSubmissions');
    if (!container) return;
    if (data.isSuccess && Array.isArray(data.result)){
      container.innerHTML = '';
      data.result.forEach(s=>{
        const assignment = s.assignmentId || s.AssignmentID || '';
        const student = s.studentName || s.StudentName || '';
        const submittedAt = s.submittedAt || s.SubmittedAt || '';
        const isLate = s.isLate || s.IsLate || false;
        const score = s.score !== undefined ? s.score : (s.Score || 'Not graded');
        const div = document.createElement('div');
        div.className = 'submission-item';
        div.innerHTML = `<strong>Assignment:${assignment}</strong> ${student} - ${submittedAt} - Score:${score} ${isLate?'<span style="color:red">LATE</span>':''}`;
        container.appendChild(div);
      })
    } else container.textContent = 'Error loading submissions: ' + JSON.stringify(data);
  }
}

// Make it globally available
window.SubmissionCreate = SubmissionCreate;
