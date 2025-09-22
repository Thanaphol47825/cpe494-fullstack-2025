// 📍 File: /hr/static/js/features/StudentForm.js
// Feature module for Add Student form

class HrStudentFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("❌ Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";

    const html = `
      <div>
        <button id="backToMain">← Back to HR Menu</button>
        <h2>Add Student</h2>
        <form id="studentFormCore">
          <fieldset>
            <legend>Required Information</legend>
            <div>
              <label>Student Code * <input name="student_code" type="text" required /></label>
            </div>
            <div>
              <label>Email * <input name="email" type="email" required /></label>
            </div>
            <div>
              <label>First Name * <input name="first_name" type="text" required /></label>
            </div>
            <div>
              <label>Last Name * <input name="last_name" type="text" required /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Additional Information (Optional)</legend>
            <div>
              <label>Department <input name="department" type="text" /></label>
            </div>
            <div>
              <label>Program <input name="program" type="number" /></label>
            </div>
            <div>
              <label>Status <input name="status" type="number" /></label>
            </div>
            <div>
              <label>Gender
                <select name="Gender">
                  <option value="">— Select Gender —</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <div>
              <label>Citizen ID <input name="CitizenID" type="text" /></label>
            </div>
            <div>
              <label>Phone Number <input name="PhoneNumber" type="text" /></label>
            </div>
            <div>
              <label>Start Date <input name="start_date" type="date" /></label>
            </div>
            <div>
              <label>Birth Date <input name="birth_date" type="date" /></label>
            </div>
            <div>
              <label>Advisor Code <input name="AdvisorCode" type="text" /></label>
            </div>
          </fieldset>
          <div>
            <button type="submit">Create Student</button>
            <button type="reset">Reset Form</button>
            <span id="studentStatusCore"></span>
          </div>
        </form>
        <div id="studentResultCore" style="display:none"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById('backToMain');
    if (backBtn) backBtn.addEventListener('click', () => this.templateEngine.render());

    const form = document.getElementById('studentFormCore');
    if (!form) return true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });
    form.addEventListener('reset', () => this.#handleReset());
    const first = form.querySelector('input[name="student_code"]');
    if (first) setTimeout(() => first.focus(), 100);
    return true;
  }

  #collect(form) {
    const fd = new FormData(form);
    const payload = {};
    for (const [k, v] of fd.entries()) {
      const s = String(v ?? '').trim();
      if (s !== '') payload[k] = s;
    }
    return payload;
  }

  #validate(p) {
    const req = ['student_code','email','first_name','last_name'];
    const miss = req.filter((k) => !p[k]);
    return { ok: miss.length === 0, miss };
  }

  #transform(p) {
    const toInt = (x) => { const n = parseInt(x, 10); return Number.isFinite(n) ? n : null; };
    const toRFC3339 = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
    return {
      student_code: p.student_code,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      department: p.department || null,
      program: toInt(p.program),
      status: toInt(p.status),
      Gender: p.Gender || null,
      CitizenID: p.CitizenID || null,
      PhoneNumber: p.PhoneNumber || null,
      start_date: toRFC3339(p.start_date),
      birth_date: toRFC3339(p.birth_date),
      AdvisorCode: p.AdvisorCode || null,
    };
  }

  async #handleSubmit() {
    const form = document.getElementById('studentFormCore');
    const statusEl = document.getElementById('studentStatusCore');
    const resultEl = document.getElementById('studentResultCore');
    const setStatus = (msg) => { statusEl.textContent = msg || ''; };
    const showResult = (html) => {
      resultEl.style.display = 'block';
      resultEl.innerHTML = html;
    };

    setStatus('Saving…');
    resultEl.style.display = 'none';
    const raw = this.#collect(form);
    const { ok, miss } = this.#validate(raw);
    if (!ok) {
      setStatus(`Please fill required fields: ${miss.join(', ')}`);
      return;
    }
    const payload = this.#transform(raw);
    try {
      const res = await fetch(`${this.rootURL}/hr/students`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.message || `Request failed (${res.status})`);
      setStatus('Saved successfully.');
      showResult(`<div><strong>Created:</strong> ${data?.student_code || data?.StudentCode || ''}</div>
        <pre>${JSON.stringify(data, null, 2)}</pre>`);
      setTimeout(() => { form.reset(); setStatus('Ready.','info'); }, 1500);
    } catch (err) {
      setStatus(err?.message || 'Save failed.');
      showResult(`<div><strong>Error:</strong> ${err?.message || String(err)}</div>`);
    }
  }

  #handleReset() {
    const statusEl = document.getElementById('studentStatusCore');
    const resultEl = document.getElementById('studentResultCore');
    statusEl.textContent = 'Form reset';
    resultEl.style.display = 'none';
    setTimeout(() => {
      const first = document.querySelector('input[name="student_code"]');
      if (first) first.focus();
    }, 100);
  }
}

if (typeof window !== 'undefined') {
  window.HrStudentFormFeature = HrStudentFormFeature;
}

console.log("📦 HrStudentFormFeature loaded (placeholder)");