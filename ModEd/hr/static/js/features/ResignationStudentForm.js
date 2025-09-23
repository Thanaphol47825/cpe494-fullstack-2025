// 📍 File: /hr/static/js/features/ResignationStudentForm.js
// Feature module for "Student Request of Resignation" form

class HrResignationStudentFormFeature {
  /**
   * @param {object} templateEngine - must provide .mainContainer and .create(html)
   * @param {string} rootURL - optional base URL (falls back to window.__ROOT_URL__)
   * @param {string} endpointPath - optional path for POST; defaults to "/hr/resignation-students"
   */
  constructor(templateEngine, rootURL, endpointPath) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.endpointPath = endpointPath || "/hr/resignation-student-requests";
    this._isSubmitting = false;
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
        <h2>Student Request of Resignation</h2>
        <form id="resignFormCore" novalidate>
          <fieldset>
            <legend>Required Information</legend>
            <div>
              <label>Student Code * 
                <input name="StudentCode" type="text" autocomplete="off" required />
              </label>
            </div>
            <div>
              <label>Reason * 
                <textarea name="Reason" rows="4" required placeholder="State the reason clearly…"></textarea>
              </label>
            </div>
          </fieldset>
          <div style="margin-top:8px;">
            <button id="btnSubmit" type="submit">Submit Request</button>
            <button type="reset">Reset</button>
            <span id="resignStatusCore" style="margin-left:8px;"></span>
          </div>
        </form>
        <div id="resignResultCore" style="display:none; margin-top:10px;"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById("backToMain");
    if (backBtn) backBtn.addEventListener("click", () => this.templateEngine.render());

    const form = document.getElementById("resignFormCore");
    if (!form) return true;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });

    form.addEventListener("reset", () => this.#handleReset());

    const first = form.querySelector('input[name="StudentCode"]');
    if (first) setTimeout(() => first.focus(), 100);

    return true;
  }

  // Replace your #collect with this:
#collect(form) {
  const payload = {};

  // Prefer direct access via form.elements (more robust than FormData for odd DOMs)
  const scEl = form.elements.NamedItem
    ? form.elements.NamedItem("StudentCode")
    : form.elements["StudentCode"];
  const rsEl = form.elements.NamedItem
    ? form.elements.NamedItem("Reason")
    : form.elements["Reason"];

  // Fallbacks in case the template engine lowercased or renamed attrs
  const scAlt =
    scEl ||
    form.querySelector('[name="StudentCode"], [name="studentcode"], [name="student_code"]');
  const rsAlt =
    rsEl || form.querySelector('[name="Reason"], [name="reason"]');

  const sc = (scAlt?.value ?? "").trim();
  const rs = (rsAlt?.value ?? "").trim();

  if (sc) payload.StudentCode = sc;
  if (rs) payload.Reason = rs;

  // Also sweep other inputs just in case you later add more fields
  try {
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      const s = String(v ?? "").trim();
      if (!s) continue;
      // normalize common aliases back to expected server keys
      const key =
        k === "studentcode" || k === "student_code" ? "StudentCode"
        : k === "reason" ? "Reason"
        : k; // keep others as-is
      if (!payload[key]) payload[key] = s;
    }
  } catch (_) {}

  return payload;
}

// (Optional) keep as-is, or leave it strict:
#validate(p) {
  const req = ["StudentCode", "Reason"];
  const miss = req.filter((k) => !p[k]);
  return { ok: miss.length === 0, miss };
}


  // For this controller, no conversion needed other than trimming & exact keys
  #transform(p) {
    return {
      StudentCode: p.StudentCode,
      Reason: p.Reason,
    };
  }

  async #handleSubmit() {
    if (this._isSubmitting) return;
    this._isSubmitting = true;

    const form = document.getElementById("resignFormCore");
    const statusEl = document.getElementById("resignStatusCore");
    const resultEl = document.getElementById("resignResultCore");
    const btnSubmit = document.getElementById("btnSubmit");

    const setStatus = (msg) => {
      statusEl.textContent = msg || "";
    };
    const showResult = (html) => {
      resultEl.style.display = "block";
      resultEl.innerHTML = html;
    };
    const disableForm = (disabled) => {
      if (btnSubmit) btnSubmit.disabled = disabled;
      const inputs = form.querySelectorAll("input, textarea, button, select");
      inputs.forEach((el) => (el.disabled = disabled));
    };

    setStatus("Submitting…");
    resultEl.style.display = "none";
    disableForm(true);

    const raw = this.#collect(form);
    console.log(raw)
    const { ok, miss } = this.#validate(raw);
    if (!ok) {
      setStatus(`Please fill required fields: ${miss.join(", ")}`);
      disableForm(false);
      this._isSubmitting = false;
      return;
    }

    const payload = this.#transform(raw);

    try {
      const res = await fetch(`${this.rootURL}${this.endpointPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // The controller returns:
      // 201 with { "isSuccess": true, "result": row }
      // 400 with { "isSuccess": false, "error": { code, message } }
      // 500 with { "isSuccess": false, "error": { code, message } }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.isSuccess === false) {
        const message =
          data?.error?.message ||
          data?.message ||
          `Request failed (${res.status})`;
        throw new Error(message);
      }

      setStatus("Submitted successfully.");
      const createdInfo = data?.result
        ? `<pre>${this.#safeJSONStringify(data.result, 2)}</pre>`
        : "";
      showResult(
        `<div><strong>Result:</strong> success</div>${createdInfo}`
      );

      // Reset the form after a short delay
      setTimeout(() => {
        form.reset();
        setStatus("Ready.");
        const first = document.querySelector('input[name="StudentCode"]');
        if (first) first.focus();
      }, 1200);
    } catch (err) {
      setStatus(err?.message || "Submission failed.");
      showResult(
        `<div><strong>Error:</strong> ${
          err?.message || String(err)
        }</div>`
      );
    } finally {
      disableForm(false);
      this._isSubmitting = false;
    }
  }

  #handleReset() {
    const statusEl = document.getElementById("resignStatusCore");
    const resultEl = document.getElementById("resignResultCore");
    statusEl.textContent = "Form reset";
    resultEl.style.display = "none";
    setTimeout(() => {
      const first = document.querySelector('input[name="StudentCode"]');
      if (first) first.focus();
    }, 100);
  }

  #safeJSONStringify(obj, space = 0) {
    try {
      return JSON.stringify(obj, null, space);
    } catch {
      return String(obj);
    }
  }
}

if (typeof window !== "undefined") {
  window.HrResignationStudentFormFeature = HrResignationStudentFormFeature;
}

console.log("📦 HrResignationStudentFormFeature loaded");
