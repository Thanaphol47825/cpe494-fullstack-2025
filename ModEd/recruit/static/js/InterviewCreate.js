if (typeof window.InterviewCreate === 'undefined') {
class InterviewCreate {
  constructor(engine, rootURL, interviewId = null) {
    this.engine = engine;
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || "";
    this.interviewId = interviewId;
  }

  async render() {
    if (!this.engine?.mainContainer) return false;
    this.engine.mainContainer.innerHTML = "";
    try {
      await this.#renderFormPage();
      if (this.interviewId) await this.#loadExistingData(this.interviewId);
      return true;
    } catch (err) {
      console.error(err);
      this.#showError("Failed to initialize Interview form: " + err.message);
      return false;
    }
  }

  async #renderFormPage() {
    const pageHTML = `
      <div class="min-h-screen bg-gray-50 py-10 px-6">
        <div class="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">
              ${this.interviewId ? "Edit Interview" : "Create Interview"}
            </h1>
            <button id="btnBack"
              class="text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              ← Back
            </button>
          </div>

          <form id="interviewForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Instructor ID <span class="text-red-500">*</span></label>
              <input name="instructor_id" type="number" required
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Application Report ID <span class="text-red-500">*</span></label>
              <input name="application_report_id" type="number" required
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Scheduled Appointment <span class="text-red-500">*</span></label>
              <input name="scheduled_appointment" type="datetime-local" required
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Interview Status</label>
              <select name="interview_status"
                      class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none">
                <option value="">-- Select Status --</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Evaluated">Evaluated</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Total Score</label>
              <input name="total_score" type="number" step="0.1"
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Evaluated At</label>
              <input name="evaluated_at" type="datetime-local"
                     class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1">Criteria Scores (JSON)</label>
              <textarea name="criteria_scores" rows="4" placeholder='{"communication": 8.5, "technical": 9.0, "motivation": 8.0}'
                        class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none"></textarea>
              <p class="text-sm text-gray-500 mt-1">Enter JSON format for criteria scores</p>
            </div>

            <div class="md:col-span-2 flex justify-end items-center gap-3 pt-4">
              <button type="button" id="btnCancel"
                      class="rounded-xl border px-4 py-2 hover:bg-gray-50">Cancel</button>
              <button type="reset"
                      class="rounded-xl border px-4 py-2 hover:bg-gray-50">Reset</button>
              <button type="submit"
                      class="rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">
                ${this.interviewId ? "Update" : "Save"}
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

    document.getElementById("interviewForm")?.addEventListener("submit", (e) => this.#submit(e));
    document.getElementById("btnCancel")?.addEventListener("click", () => this.#goBack());
    document.getElementById("btnBack")?.addEventListener("click", () => this.#goBack());
  }

  async #loadExistingData(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetInterview/${id}`);
      const data = await res.json();
      if (data.isSuccess && data.result) {
        const formEl = document.getElementById("interviewForm");
        const interview = data.result;
        
        // Set form values
        if (formEl.elements["instructor_id"]) formEl.elements["instructor_id"].value = interview.instructor_id || "";
        if (formEl.elements["application_report_id"]) formEl.elements["application_report_id"].value = interview.application_report_id || "";
        if (formEl.elements["interview_status"]) formEl.elements["interview_status"].value = interview.interview_status || "";
        if (formEl.elements["total_score"]) formEl.elements["total_score"].value = interview.total_score || "";
        if (formEl.elements["criteria_scores"]) formEl.elements["criteria_scores"].value = interview.criteria_scores || "";
        
        // Handle datetime fields
        if (interview.scheduled_appointment) {
          const scheduledDate = new Date(interview.scheduled_appointment).toISOString().slice(0, 16);
          if (formEl.elements["scheduled_appointment"]) formEl.elements["scheduled_appointment"].value = scheduledDate;
        }
        
        if (interview.evaluated_at) {
          const evaluatedDate = new Date(interview.evaluated_at).toISOString().slice(0, 16);
          if (formEl.elements["evaluated_at"]) formEl.elements["evaluated_at"].value = evaluatedDate;
        }
      }
    } catch (err) {
      console.error("Error loading interview:", err);
    }
  }

  async #submit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    if (this.interviewId) data.id = Number(this.interviewId);
    
    for (const key of ["instructor_id", "application_report_id"]) {
      if (data[key]) data[key] = Number(data[key]);
    }

    if (data.total_score) data.total_score = parseFloat(data.total_score) || 0;

    // Handle datetime fields
    if (data.scheduled_appointment) {
      data.scheduled_appointment = new Date(data.scheduled_appointment).toISOString();
    }
    if (data.evaluated_at) {
      data.evaluated_at = new Date(data.evaluated_at).toISOString();
    }

    if (!data.interview_status) delete data.interview_status;
    if (!data.criteria_scores) delete data.criteria_scores;

    const url = this.rootURL + (
      this.interviewId
        ? "/recruit/UpdateInterview"
        : "/recruit/CreateInterview"
    );

    this.#setStatus(this.interviewId ? "Updating..." : "Submitting...", "text-gray-600");

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await resp.json().catch(() => ({}));

      if (result?.isSuccess) {
        this.#setStatus(this.interviewId ? "✅ Updated successfully!" : "✅ Saved successfully!", "text-green-600");
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
    await this.engine.fetchModule("/recruit/static/js/InterviewList.js");
    const list = new InterviewList(this.engine, this.rootURL);
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

window.InterviewCreate = InterviewCreate;
}