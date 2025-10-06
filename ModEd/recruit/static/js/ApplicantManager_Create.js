// /recruit/static/js/ApplicantManager_Create.js
class ApplicantManagerCreate {
  constructor(engine, rootURL, applicantId = null) {
    this.engine = engine;
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || "";
    this.applicantId = applicantId;
    this._confirmOnce = false;

    // cache schema for sanitization
    this._schema = [];
  }

  async render() {
    if (!this.engine?.mainContainer) return false;
    try {
      await this.#createDynamicApplicantForm();
      if (this.applicantId != null) await this.#prefillExisting(this.applicantId);
      return true;
    } catch (err) {
      console.error(err);
      this.#showError("Failed to initialize form: " + err.message);
      return false;
    }
  }

  async #createDynamicApplicantForm() {
    // 1) fetch metadata
    const metaURL = this.rootURL + "/api/modelmeta/applicant";
    const res = await fetch(metaURL);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    const meta = await res.json();
    if (!Array.isArray(meta)) throw new Error("Invalid metadata format");

    // keep schema for sanitization later
    this._schema = meta.map((f) => ({
      type: (f.type || "text").toLowerCase(),
      name: f.name,
      label: f.label || f.name,
    }));

    // 2) ensure template is available for FormRender
    if (!this.engine.template && typeof this.engine.fetchTemplate === "function") {
      await this.engine.fetchTemplate();
    }
    if (!this.engine.template) throw new Error("Template not loaded");
    const application = { template: this.engine.template };

    // 3) page shell
    const pageHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 11c.943 0 1.809.386 2.432 1.01A3.432 3.432 0 0115.442 14h.058A4.5 4.5 0 0012 9.5 4.5 4.5 0 007.5 14h.058c.07-1.043.504-2.003 1.265-2.744A3.432 3.432 0 0111 11h1z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              ${this.applicantId != null ? "Edit Applicant" : "Applicant Registration"}
            </h1>
            <p class="text-gray-600">Fill all fields and submit (you'll confirm on a second press).</p>
          </div>

          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Applicant Information
                </h2>
                <button id="btnBack" class="rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 ring-1 ring-white/30">
                  ← Back
                </button>
              </div>
            </div>

            <div class="p-8">
              <div class="applicant-form-container"></div>

              <div class="flex gap-3 mt-6">
                <button id="btnReset"
                  class="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                  Reset
                </button>
              </div>

              <div class="text-center mt-4">
                <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
              </div>
            </div>
          </div>

          <div id="resultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Form Submission Result
              </h3>
            </div>
            <div class="p-6">
              <pre id="resultContent" class="text-sm"></pre>
              <div class="mt-4">
                <button id="btnBackToList" class="rounded-xl border px-4 py-2 hover:bg-gray-50">Back to List</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const pageEl = this.engine.create(pageHTML);
    this.engine.mainContainer.innerHTML = "";
    this.engine.mainContainer.appendChild(pageEl);

    // 4) render the dynamic form
    const formRender = new FormRender(application, this._schema, ".applicant-form-container");
    await formRender.render();

    // 5) cosmetics + handlers
    requestAnimationFrame(() => {
      this.#applyTailwindStyles();
      this.#styleSubmitButton();
      this.#enforceRequiredFields();
    });

    const container = this.engine.mainContainer.querySelector(".applicant-form-container");
    document.getElementById("btnReset")?.addEventListener("click", () => {
      const f = container?.querySelector("form");
      if (f) f.reset();
      this.#setStatus("", "");
      this.#hideResult();
      this._confirmOnce = false;
    });
    document.getElementById("btnBack")?.addEventListener("click", () => this.#goBack());
    document.getElementById("btnBackToList")?.addEventListener("click", () => this.#goBack());

    container?.addEventListener("submit", (e) => this.#submit(e), true);
  }

  async #prefillExisting(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetApplicant/${id}`);
      const data = await res.json();
      if (!data?.isSuccess) return;

      const f = this.engine.mainContainer.querySelector(".applicant-form-container form");
      if (!f) return;

      const rec = data.result || {};
      for (const [k, v] of Object.entries(rec)) {
        const el = f.querySelector(`[name="${k}"]`);
        if (!el || v == null) continue;

        if (el.type === "date") {
          const d = new Date(v);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            el.value = `${yyyy}-${mm}-${dd}`;
            continue;
          }
        }
        el.value = v;
      }
    } catch (e) {
      console.warn("Prefill failed:", e);
    }
  }

  #applyTailwindStyles() {
    const root = this.engine.mainContainer.querySelector(".applicant-form-container");
    if (!root) return;
    root.querySelectorAll("label").forEach((l) =>
      l.classList.add("block", "text-sm", "font-medium", "text-gray-700", "mb-1")
    );
    root.querySelectorAll("input, select, textarea").forEach((el) => {
      const t = (el.getAttribute("type") || "").toLowerCase();
      if (["submit", "button", "reset", "hidden"].includes(t)) return;
      el.classList.add(
        "mt-1",
        "block",
        "w-full",
        "rounded-md",
        "border-gray-300",
        "shadow-sm",
        "focus:ring-indigo-500",
        "focus:border-indigo-500",
        "sm:text-sm",
        "mb-3"
      );
    });
  }

  #styleSubmitButton() {
    const root = this.engine.mainContainer.querySelector(".applicant-form-container");
    if (!root) return;
    const submit = root.querySelector('input[type="submit"], button[type="submit"]');
    if (!submit) return;
    submit.classList.add(
      "mt-4",
      "inline-flex",
      "items-center",
      "justify-center",
      "rounded-xl",
      "px-4",
      "py-2",
      "bg-indigo-600",
      "text-white",
      "font-medium",
      "shadow-md",
      "hover:bg-indigo-700",
      "transition",
      "duration-200"
    );
    if (!submit.value) submit.textContent = this.applicantId != null ? "Update" : "Submit";
  }

  #enforceRequiredFields() {
    const form = this.engine.mainContainer.querySelector(".applicant-form-container form");
    if (!form) return;
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      const type = (el.getAttribute("type") || "").toLowerCase();
      if (["submit", "button", "reset", "hidden"].includes(type)) return;
      el.required = true;
      el.addEventListener("input", () => this.#clearInvalid(el));
      el.addEventListener("change", () => this.#clearInvalid(el));
    });
  }

  #markInvalid(el) {
    el.classList.add("border-red-500", "ring-1", "ring-red-400");
    const label = el.closest("p, .field, .form-row")?.querySelector("label");
    if (label) label.classList.add("text-red-600");
  }
  #clearInvalid(el) {
    el.classList.remove("border-red-500", "ring-1", "ring-red-400");
    const label = el.closest("p, .field, .form-row")?.querySelector("label");
    if (label) label.classList.remove("text-red-600");
  }

  #validateForm(form) {
    form.querySelectorAll("input, select, textarea").forEach((el) => this.#clearInvalid(el));
    const ok = form.checkValidity();
    if (!ok) {
      const invalids = Array.from(form.querySelectorAll(":invalid"));
      invalids.forEach((el) => this.#markInvalid(el));
      invalids[0]?.focus();
      invalids[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  // Build a clean payload matching Go struct types exactly.
  #buildSanitizedPayload(form) {
    const fd = new FormData(form);
    const raw = Object.fromEntries(fd.entries());

    const typeMap = new Map(this._schema.map((s) => [s.name, (s.type || "text").toLowerCase()]));
    const data = {};

    for (const [k, v] of Object.entries(raw)) {
      if (!typeMap.has(k)) continue; // drop unknown keys

      const t = typeMap.get(k);
      if (t === "number") {
        // Empty -> omit (avoid "" to int/float)
        if (v === "" || Number.isNaN(Number(v))) continue;
        data[k] = Number(v);
      } else if (t === "date") {
        if (!v) continue;
        const d = new Date(v);
        if (!isNaN(d.getTime())) data[k] = d.toISOString();
      } else {
        data[k] = v;
      }
    }

    // extra guard if meta didn't mark birth_date as date
    if ("birth_date" in data && data.birth_date) {
      const d = new Date(data.birth_date);
      if (!isNaN(d.getTime())) data.birth_date = d.toISOString();
      else delete data.birth_date;
    }

    // set id for edit (lowercase to match json:"id")
    if (this.applicantId != null) data.id = Number(this.applicantId);

    return data;
  }

  async #submit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');

    // First press: validate only
    if (!this._confirmOnce) {
      const ok = this.#validateForm(form);
      if (!ok) {
        this.#setStatus("Please complete all required fields.", "text-red-600");
        this.#hideResult();
        return;
      }
      this.#setStatus("Press submit again to confirm.", "text-yellow-600");
      submitBtn?.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
      submitBtn?.classList.add("bg-yellow-500", "hover:bg-yellow-600");
      this._confirmOnce = true;
      return;
    }

    // Second press: send
    this._confirmOnce = false;
    submitBtn?.classList.remove("bg-yellow-500", "hover:bg-yellow-600");
    submitBtn?.classList.add("bg-indigo-600", "hover:bg-indigo-700");
    this.#setStatus(this.applicantId != null ? "Updating..." : "Submitting...", "text-gray-600");

    const data = this.#buildSanitizedPayload(form);
    // Debug: uncomment to see exact outgoing payload
    // console.log("OUTGOING BODY →", JSON.stringify(data, null, 2));

    const url =
      this.rootURL + (this.applicantId != null ? "/recruit/UpdateApplicant" : "/recruit/CreateApplicant");

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // If server returns non-JSON (e.g. HTML error), avoid crashing:
      let payload = {};
      try {
        payload = await resp.json();
      } catch {
        payload = { isSuccess: false, message: `HTTP ${resp.status} (non-JSON)` };
      }

      if (!resp.ok || payload?.isSuccess === false) {
        this.#setStatus(payload?.message || `Submission failed (HTTP ${resp.status})`, "text-red-600");
        this.#hideResult();
        return;
      }

      this.#setStatus(
        this.applicantId != null ? "Updated successfully!" : "Applicant created successfully!",
        "text-green-600"
      );

      const result = payload.result;
      const idCreated = result?.ID ?? (Array.isArray(result) ? result[0]?.ID : undefined);
      const pretty =
        this.applicantId != null
          ? JSON.stringify({ updated: result }, null, 2)
          : JSON.stringify({ id: idCreated, result }, null, 2);

      this.#showResult(pretty);

      if (this.applicantId == null) form.reset();
    } catch (err) {
      this.#setStatus("Error submitting form.", "text-red-600");
      this.#hideResult();
    }
  }

  #setStatus(text, cls = "text-gray-500") {
    const el = this.engine.mainContainer.querySelector("#formStatus");
    if (!el) return;
    el.textContent = text || "";
    el.className = "text-sm font-medium " + cls;
  }

  #showResult(text) {
    const box = this.engine.mainContainer.querySelector("#resultBox");
    const content = this.engine.mainContainer.querySelector("#resultContent");
    if (!box || !content) return;
    content.textContent = text || "";
    box.classList.remove("hidden");
  }
  #hideResult() {
    const box = this.engine.mainContainer.querySelector("#resultBox");
    const content = this.engine.mainContainer.querySelector("#resultContent");
    if (content) content.textContent = "";
    if (box) box.classList.add("hidden");
  }

  async #goBack() {
    try {
      await this.engine.fetchModule("/recruit/static/js/ApplicantManager.js");
      const list = new ApplicantManager(this.engine, this.rootURL);
      this.engine.mainContainer.innerHTML = "";
      await list.render();
    } catch (e) {
      alert("Failed to go back: " + e.message);
    }
  }

  #showError(message) {
    const div = document.createElement("div");
    div.className = "max-w-2xl mx-auto my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800";
    div.textContent = message;
    (this.engine?.mainContainer || document.body).appendChild(div);
  }
}

window.ApplicantManagerCreate = ApplicantManagerCreate;
