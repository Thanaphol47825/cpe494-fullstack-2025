
class InterviewCriteriaCreate {
  constructor(application) {
    this.application = application;
    this.RootURL = window.__ROOT_URL__ || "";
  }

async render() {
    console.log("InterviewCriteriaCreate: render()");

    if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    const formTpl = `
      <div class="max-w-4xl mx-auto py-10 px-4">
        <header class="mb-6">
          <h1 class="text-3xl font-bold tracking-tight text-gray-800">
            Create Interview Criteria
          </h1>
          <p class="text-sm text-gray-500">
            เพิ่มการตั้งค่าเกณฑ์การสัมภาษณ์สำหรับการรับสมัคร
          </p>
        </header>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form id="createCriteriaForm" class="grid grid-cols-1 gap-4">
            {{#fields}}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{label}}</label>
              <input name="{{name}}" type="{{type}}" value="{{value}}" required
                     class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-800 
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                            transition" />
            </div>
            {{/fields}}

            <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-gray-100">
              <div class="flex gap-2 flex-1">
                <button id="submitCreateCriteria" type="submit"
                  class="flex-1 inline-flex justify-center items-center rounded-lg bg-indigo-600 text-white 
                         px-4 py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-indigo-400 transition">
                  Save Criteria
                </button>
                <button type="reset"
                  class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm 
                         text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 
                         transition">
                  Reset
                </button>
              </div>
              
              <div class="flex items-center gap-3">
                <button id="addCriteriaBtn" type="button"
                  class="inline-flex items-center rounded-lg border border-indigo-200 text-indigo-700 
                         px-3 py-2 text-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 
                         focus:ring-indigo-400 transition">
                  Add Config
                </button>
                <span id="formMessage" class="text-sm text-gray-500 min-w-[120px]"></span>
              </div>
            </div>
          </form>

          <pre id="resultBox" class="hidden mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto max-h-64"></pre>
        </div>
      </div>
    `;

    const fields = [
      { label: "Application Round ID", name: "application_rounds_id", type: "text", value: "1" },
      { label: "Faculty ID", name: "faculty_id", type: "text", value: "2" },
      { label: "Department ID", name: "department_id", type: "text", value: "3" },
      { label: "Passing Score", name: "passing_score", type: "text", value: "60.5" },
    ];

    const html = Mustache.render(formTpl, { fields });
    this.application.mainContainer.innerHTML = html;

    const form = document.getElementById("createCriteriaForm");
    if (form) form.addEventListener("submit", (e) => this.submit(e));

    const addBtn = document.getElementById("addCriteriaBtn");
    if (addBtn) addBtn.addEventListener("click", (e) => this.addConfig(e));
}

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    const statusEl = document.getElementById("formMessage");
    const resultBox = document.getElementById("resultBox");
    const submitBtn = document.getElementById("submitCreateCriteria");

    if (!form) return;
    submitBtn && (submitBtn.disabled = true);
    statusEl && (statusEl.textContent = "Submitting...");
    statusEl && (statusEl.className = "text-sm text-gray-600");

    const fd = new FormData(form);
    const payload = {
      application_rounds_id: (() => { const v = fd.get("application_rounds_id"); const n = parseInt(v,10); return Number.isNaN(n) ? v : n; })(),
      faculty_id: (() => { const v = fd.get("faculty_id"); const n = parseInt(v,10); return Number.isNaN(n) ? v : n; })(),
      department_id: (() => { const v = fd.get("department_id"); const n = parseInt(v,10); return Number.isNaN(n) ? v : n; })(),
      passing_score: (() => { const v = fd.get("passing_score"); const n = parseFloat(v); return Number.isNaN(n) ? v : n; })(),
    };

    try {
      const res = await fetch(this.RootURL + "/recruit/CreateInterviewCriteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.isSuccess) {
        throw new Error(data?.result || `HTTP ${res.status}`);
      }

      statusEl && (statusEl.textContent = "Saved.");
      statusEl && (statusEl.className = "text-sm text-green-600 font-medium");
      resultBox.className = "mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800";
      resultBox.textContent = JSON.stringify(data.result ?? { message: "OK" }, null, 2);
      resultBox.classList.remove("hidden");
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl && (statusEl.textContent = "Error: " + (err.message || "unknown"));
      statusEl && (statusEl.className = "text-sm text-red-600 font-medium");
      resultBox.className = "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
      resultBox.textContent = err.toString();
      resultBox.classList.remove("hidden");
    } finally {
      submitBtn && (submitBtn.disabled = false);
      setTimeout(() => { statusEl && (statusEl.textContent = ""); }, 3000);
    }
  }

  async addConfig(e) {
    e.preventDefault();
    const btn = document.getElementById("addCriteriaBtn");
    const statusEl = document.getElementById("formMessage");
    const resultBox = document.getElementById("resultBox");

    if (!btn) return;
    btn.disabled = true;
    statusEl && (statusEl.textContent = "Seeding config...");
    statusEl && (statusEl.className = "text-sm text-gray-600");

    try {
      const res = await fetch(this.RootURL + "/recruit/CreateRawSQL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.isSuccess) {
        throw new Error(data?.result || `HTTP ${res.status}`);
      }

      statusEl && (statusEl.textContent = "Config added.");
      statusEl && (statusEl.className = "text-sm text-green-600 font-medium");
      resultBox.className = "mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800";
      resultBox.textContent = JSON.stringify(data.result ?? { message: "Seeded" }, null, 2);
      resultBox.classList.remove("hidden");
    } catch (err) {
      console.error("Add config error:", err);
      statusEl && (statusEl.textContent = "Error: " + (err.message || "unknown"));
      statusEl && (statusEl.className = "text-sm text-red-600 font-medium");
      resultBox.className = "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
      resultBox.textContent = err.toString();
      resultBox.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      setTimeout(() => { statusEl && (statusEl.textContent = ""); }, 3000);
    }
  }
}