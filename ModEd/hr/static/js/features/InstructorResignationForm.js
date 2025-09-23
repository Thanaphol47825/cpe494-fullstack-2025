// 📍 File: /hr/static/js/features/InstructorResignationForm.js
// Feature module for Instructor Resignation Request form

class HrInstructorResignationFormFeature {
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
        <h2>Instructor Resignation Request</h2>
        <form id="resignationFormCore">
          <fieldset>
            <legend>Required Information</legend>
            <div>
              <label>Instructor Code * <input name="InstructorCode" type="text" required /></label>
            </div>
            <div>
              <label>Reason * <textarea name="Reason" required></textarea></label>
            </div>
          </fieldset>
          <div>
            <button type="submit">Submit Resignation</button>
            <button type="reset">Reset Form</button>
            <span id="resignationStatusCore"></span>
          </div>
        </form>
        <div id="resignationResultCore" style="display:none"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById('backToMain');
    if (backBtn) backBtn.addEventListener('click', () => this.templateEngine.render());

    const form = document.getElementById('resignationFormCore');
    if (!form) return true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });
    form.addEventListener('reset', () => this.#handleReset());

    const first = form.querySelector('input[name="InstructorCode"]');
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
    const req = ['InstructorCode', 'Reason'];
    const miss = req.filter((k) => !p[k]);
    return { ok: miss.length === 0, miss };
  }

  #transform(p) {
    return {
      InstructorCode: p.InstructorCode,
      Reason: p.Reason,
    };
  }

  async #handleSubmit() {
    const form = document.getElementById('resignationFormCore');
    const statusEl = document.getElementById('resignationStatusCore');
    const resultEl = document.getElementById('resignationResultCore');
    const setStatus = (msg) => { statusEl.textContent = msg || ''; };
    const showResult = (html) => {
      resultEl.style.display = 'block';
      resultEl.innerHTML = html;
    };

    setStatus('Submitting…');
    resultEl.style.display = 'none';

    const raw = this.#collect(form);
    const { ok, miss } = this.#validate(raw);
    if (!ok) {
      setStatus(`Please fill required fields: ${miss.join(', ')}`);
      return;
    }
    const payload = this.#transform(raw);

    try {
      const res = await fetch(`${this.rootURL}/hr/resignation-instructor-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.message || `Request failed (${res.status})`);

      setStatus('Resignation submitted successfully.');
      showResult(`<div><strong>Message:</strong> ${data?.message || ''}</div>`);
      setTimeout(() => { form.reset(); setStatus('Ready.'); }, 1500);
    } catch (err) {
      setStatus(err?.message || 'Submit failed.');
      showResult(`<div><strong>Error:</strong> ${err?.message || String(err)}</div>`);
    }
  }

  #handleReset() {
    const statusEl = document.getElementById('resignationStatusCore');
    const resultEl = document.getElementById('resignationResultCore');
    statusEl.textContent = 'Form reset';
    resultEl.style.display = 'none';
    setTimeout(() => {
      const first = document.querySelector('input[name="InstructorCode"]');
      if (first) first.focus();
    }, 100);
  }
}

if (typeof window !== 'undefined') {
  window.HrInstructorResignationFormFeature = HrInstructorResignationFormFeature;
}

console.log("📦 HrInstructorResignationFormFeature loaded");
