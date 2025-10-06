class ApplicantManager {
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
              🧑‍💼 Applicant Manager
            </h1>
            <div class="flex flex-wrap gap-2">
              <button id="btnImport"
                class="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200">📥 Import</button>
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

    document.getElementById("btnCreate")?.addEventListener("click", () => this.#openForm());
    document.getElementById("btnImport")?.addEventListener("click", () => this.importFromFile());
  }

  async loadList() {
    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = `<p class="text-gray-500 p-4">Loading...</p>`;

    try {
      const res = await fetch(this.rootURL + "/recruit/GetApplicants");
      const data = await res.json();
      if (!data.isSuccess) throw new Error(data.message || "Load failed");

      const list = data.result || [];
      if (list.length === 0) {
        tableContainer.innerHTML = `
          <div class="p-8 text-center text-gray-500">
            <p class="text-lg font-medium">No applicants found</p>
            <p class="text-sm text-gray-400 mt-1">Try adding a new applicant.</p>
          </div>`;
        return;
      }

      const rows = list.map(a => `
        <tr class="border-b hover:bg-gray-50 transition">
          <td class="px-4 py-2">${a.ID}</td>
          <td class="px-4 py-2">${a.first_name || "-"}</td>
          <td class="px-4 py-2">${a.last_name || "-"}</td>
          <td class="px-4 py-2">${a.email || "-"}</td>
          <td class="px-4 py-2">${a.phone_number || "-"}</td>
          <td class="px-4 py-2 text-right">
            <button class="text-blue-600 hover:underline" data-id="${a.ID}" data-action="edit">Edit</button>
            <button class="text-red-600 hover:underline ml-3" data-id="${a.ID}" data-action="delete">Delete</button>
          </td>
        </tr>`).join("");

      tableContainer.innerHTML = `
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-gray-100 text-gray-800">
            <tr>
              <th class="px-4 py-2 text-left">ID</th>
              <th class="px-4 py-2 text-left">First Name</th>
              <th class="px-4 py-2 text-left">Last Name</th>
              <th class="px-4 py-2 text-left">Email</th>
              <th class="px-4 py-2 text-left">Phone</th>
              <th class="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;

      tableContainer.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const action = e.target.getAttribute("data-action");
          if (action === "edit") this.#openForm(id); 
          else if (action === "delete") this.deleteItem(id);
        });
      });

    } catch (err) {
      tableContainer.innerHTML = `<p class="text-red-500 p-4">Error: ${err.message}</p>`;
    }
  }

  async #openForm(id = null) {
    try {
      await this.engine.fetchModule("/recruit/static/js/ApplicantManager_Create.js");
    } catch (e) {
      alert("Failed to load form module: " + e.message);
      return;
    }

    const FormClass = window.ApplicantManagerCreate || window.ApplicantCreate;
    if (typeof FormClass !== "function") {
      alert("Form class not found. Make sure ApplicantManager_Create.js sets window.ApplicantManagerCreate.");
      return;
    }

    const form = new FormClass(this.engine, this.rootURL, id);
    this.engine.mainContainer.innerHTML = "";
    await form.render();
  }

  async deleteItem(id) {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    const res = await fetch(this.rootURL + "/recruit/DeleteApplicant", {
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
    
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".csv,.json,text/csv,application/json";
    picker.style.display = "none";
    document.body.appendChild(picker);

    const file = await new Promise((resolve) => {
      picker.onchange = () => resolve(picker.files?.[0] || null);
      picker.click();
    });
    document.body.removeChild(picker);

    if (!file) return; 

    const formData = new FormData();
    formData.append("file", file, file.name);

    const tableContainer = document.getElementById("tableContainer");
    const prevHTML = tableContainer.innerHTML;
    tableContainer.innerHTML = `<p class="text-gray-500 p-4">Uploading & importing <b>${file.name}</b>…</p>`;

    try {

      const url = this.rootURL + "/recruit/GetApplicantsFromFile";
      const resp = await fetch(url, { method: "POST", body: formData });

      let data = {};
      try {
        data = await resp.json();
      } catch {
        throw new Error(`HTTP ${resp.status} (non-JSON response)`);
      }

      if (!resp.ok || data?.isSuccess === false) {
        throw new Error(data?.message || `Import failed (HTTP ${resp.status})`);
      }

      alert(`Imported ${Array.isArray(data.result) ? data.result.length : 0} applicant(s) from ${file.name}.`);
      await this.loadList();
    } catch (err) {

      alert("Error importing file: " + err.message);
      tableContainer.innerHTML = prevHTML;
    }
  }
}

window.ApplicantManager = ApplicantManager;
