class ApplicationReportCreate {
  constructor(engine, rootURL, reportId = null) {
    this.engine = engine;
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || "";
    this.reportId = reportId; 
  }

  async render() {
    if (!this.engine?.mainContainer) return false;
    this.engine.mainContainer.innerHTML = "";
    try {
      await this.#renderFormPage();
      if (this.reportId) await this.#loadExistingData(this.reportId);
      return true;
    } catch (err) {
      console.error(err);
      this.#showError("Failed to initialize ApplicationReport form: " + err.message);
      return false;
    }
  }

  async #renderFormPage() {
    const pageHTML = `
      <div class="min-h-screen bg-gray-50 py-10 px-6">
        <div class="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">
              ${this.reportId ? "Edit Application Report" : "Create Application Report"}
            </h1>
            <button id="btnBack"
              class="text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              ← Back
            </button>
          </div>

          <form id="reportForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Applicant ID <span class="text-red-500">*</span></label>
              <input name="applicant_id" type="number" required
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Application Round ID <span class="text-red-500">*</span></label>
              <input name="application_rounds_id" type="number" required
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Faculty ID</label>
              <input name="faculty_id" type="number"
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Department ID</label>
              <input name="department_id" type="number"
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Program Name / Type</label>
              <input name="program" type="text" placeholder="e.g. Portfolio, Scholarship"
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Application Status</label>
              <select name="application_statuses"
                      class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none">
                <option value="">-- Select Status --</option>
                <option value="Pending">Pending</option>
                <option value="Eligible">Eligible</option>
                <option value="Interview">Interview</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div class="md:col-span-2 flex justify-end items-center gap-3 pt-4">
              <button type="button" id="btnCancel"
                      class="rounded-xl border px-4 py-2 hover:bg-gray-50">Cancel</button>
              <button type="reset"
                      class="rounded-xl border px-4 py-2 hover:bg-gray-50">Reset</button>
              <button type="submit"
                      class="rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">
                ${this.reportId ? "Update" : "Save"}
              </button>
              <span id="formStatus" class="text-sm ml-4"></span>
            </div>
          </form>

          <div id="resultBox" class="hidden mt-6 border bg-white p-4 rounded-lg text-sm">
            <pre id="resultContent" class="whitespace-pre-wrap text-gray-800"></pre>
          </div>
        </div>
      </div>
    `;

    const pageEl = this.engine.create(pageHTML);
    this.engine.mainContainer.appendChild(pageEl);

    document.getElementById("reportForm")?.addEventListener("submit", (e) => this.#submit(e));
    document.getElementById("btnCancel")?.addEventListener("click", () => this.#goBack());
    document.getElementById("btnBack")?.addEventListener("click", () => this.#goBack());
  }

  async #loadExistingData(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetApplicationReport/${id}`);
      const data = await res.json();
      if (data.isSuccess && data.result) {
        const formEl = document.getElementById("reportForm");
        Object.keys(data.result).forEach((key) => {
          if (formEl.elements[key]) formEl.elements[key].value = data.result[key];
        });
      }
    } catch (err) {
      console.error("Error loading report:", err);
    }
  }

  async #submit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    for (const key of ["applicant_id", "application_rounds_id", "faculty_id", "department_id"]) {
      if (data[key]) data[key] = Number(data[key]);
    }

    if (!data.application_statuses) delete data.application_statuses;

    if (this.reportId) data.id = this.reportId;

    const url = this.rootURL + (
      this.reportId
        ? "/recruit/UpdateApplicationReport"
        : "/recruit/CreateApplicationReport"
    );

    this.#setStatus(this.reportId ? "Updating..." : "Submitting...", "text-gray-600");

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await resp.json().catch(() => ({}));

      if (result?.isSuccess) {
        this.#setStatus(this.reportId ? "✅ Updated successfully!" : "✅ Saved successfully!", "text-green-600");
        setTimeout(() => this.#goBack(), 1000);
      } else {
        this.#setStatus("❌ Operation failed: " + (result.message || ""), "text-red-600");
      }
    } catch (err) {
      console.error("Error while submitting:", err);
      this.#setStatus("Error: " + err.message, "text-red-600");
    }
  }
  async #goBack() {
    await this.engine.fetchModule("/recruit/static/js/ApplicationReportList.js");
    const list = new ApplicationReportList(this.engine, this.rootURL);
    this.engine.mainContainer.innerHTML = "";
    await list.render();
  }

  #setStatus(text, cls) {
    const el = document.getElementById("formStatus");
    if (!el) return;
    el.textContent = text || "";
    el.className = "text-sm font-medium " + (cls || "text-gray-500");
  }

  #showError(msg) {
    const div = document.createElement("div");
    div.className = "max-w-3xl mx-auto my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800";
    div.textContent = msg;
    (this.engine?.mainContainer || document.body).appendChild(div);
  }
}
