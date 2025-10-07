class ApplicationReportList {
  constructor(engine, rootURL) {
    this.engine = engine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    this.engine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-6xl mx-auto bg-white shadow rounded-2xl p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <button id="btnBack" 
                class="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                ← Back
            </button>
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📊 Application Reports
            </h1>
            <div class="flex flex-wrap gap-2">
              <button id="btnImport"
                class="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200">📥 Import</button>
              <button id="btnTrack"
                class="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">🔍 Track Status</button>
              <button id="btnVerify"
                class="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-200">✅ Verify</button>
              <button id="btnCreate"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">＋ Create New</button>
            </div>
          </div>

          <div id="tableContainer" class="overflow-x-auto border rounded-lg"></div>
        </div>
      </div>
    `;

    await this.loadList();

    document.getElementById("btnBack")?.addEventListener("click", async () => {
      await this.engine.fetchModule("/recruit/static/js/RecruitApplication.js");
      const dashboard = new RecruitApplication(this.engine);
      this.engine.mainContainer.innerHTML = "";
      await dashboard.render();
    });

    document.getElementById("btnCreate")?.addEventListener("click", () => this.openForm());
    document.getElementById("btnImport")?.addEventListener("click", () => this.importFromFile());
    document.getElementById("btnTrack")?.addEventListener("click", () => this.trackStatus());
    document.getElementById("btnVerify")?.addEventListener("click", () => this.verifyEligibility());
  }

async loadList() {
  const tableContainer = document.getElementById("tableContainer");
  tableContainer.innerHTML = `<p class="text-gray-500 p-4">Loading...</p>`;

  try {
    const res = await fetch(this.rootURL + "/recruit/GetApplicationReports");
    const data = await res.json();
    if (!data.isSuccess) throw new Error(data.message || "Load failed");

    if (!data.result || data.result.length === 0) {
      tableContainer.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <p class="text-lg font-medium">No data available</p>
          <p class="text-sm text-gray-400 mt-1">Try adding a new application report.</p>
        </div>
      `;
      return;
    }

    const rows = data.result.map(
      (r) => `
      <tr class="border-b hover:bg-gray-50 transition">
        <td class="px-4 py-2">${r.id}</td>
        <td class="px-4 py-2">${r.applicant_id || "-"}</td>
        <td class="px-4 py-2">${r.application_statuses || "-"}</td>
        <td class="px-4 py-2">${r.faculty_id || "-"}</td>
        <td class="px-4 py-2">${r.department_id || "-"}</td>
        <td class="px-4 py-2 text-right">
          <button class="text-blue-600 hover:underline" data-id="${r.id}" data-action="edit">Edit</button>
          <button class="text-red-600 hover:underline ml-3" data-id="${r.id}" data-action="delete">Delete</button>
        </td>
      </tr>`
    );

    tableContainer.innerHTML = `
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-gray-100 text-gray-800">
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Applicant</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Faculty</th>
            <th class="px-4 py-2 text-left">Department</th>
            <th class="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;

    tableContainer.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");
        if (action === "edit") this.openForm(id);
        else if (action === "delete") this.deleteItem(id);
      });
    });
  } catch (err) {
    tableContainer.innerHTML = `<p class="text-red-500 p-4">Error: ${err.message}</p>`;
  }
}

  async openForm(id = null) {
    await this.engine.fetchModule("/recruit/static/js/ApplicationReportCreate.js");
    const form = new ApplicationReportCreate(this.engine, this.rootURL, id);
    this.engine.mainContainer.innerHTML = "";
    await form.render();
  }

  async deleteItem(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    const res = await fetch(this.rootURL + "/recruit/DeleteApplicationReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id) }),
    });
    const result = await res.json();
    if (result.isSuccess) {
      alert("Deleted successfully");
      await this.loadList();
    } else {
      alert("Delete failed: " + result.message);
    }
  }

  async importFromFile() {
    const filePath = prompt("Enter file path (CSV/JSON):");
    if (!filePath) return;
    const url = this.rootURL + "/recruit/GetApplicationReportsFromFile?path=" + encodeURIComponent(filePath);
    await this.#fetchAndShow(url, "GET");
  }

  async trackStatus() {
    const applicantId = prompt("Enter Applicant ID:");
    if (!applicantId) return;
    const url = this.rootURL + "/recruit/GetApplicationReportByApplicant/" + encodeURIComponent(applicantId);
    await this.#fetchAndShow(url, "GET");
  }

  async verifyEligibility() {
    const applicantId = prompt("Enter Applicant ID to verify eligibility:");
    if (!applicantId) return;
    const url = this.rootURL + "/recruit/VerifyApplicationEligibility";
    await this.#fetchAndShow(url, "POST", { applicantId: Number(applicantId) });
  }

  async #fetchAndShow(url, method = "GET", body = null) {
    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await resp.json();
      alert(JSON.stringify(result, null, 2));
      if (result.isSuccess) await this.loadList();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }
}

if (typeof window !== "undefined") {
  window.ApplicationReportList = ApplicationReportList;
}