class ApplicationReportList {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.ENDPOINT_LIST = this.rootURL + "/recruit/GetApplicationReports";
    this.ENDPOINT_DELETE = this.rootURL + "/recruit/DeleteApplicationReport";
  }

  async render() {
    const container = this.templateEngine?.mainContainer || document.getElementById("MainContainer");
    if (!container) return console.error("MainContainer not found");

    container.innerHTML = `
      <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-[1200px] mx-auto bg-white shadow rounded-2xl p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📊 Application Reports
            </h1>
            <div class="flex flex-wrap gap-2">
              <button id="btnCreate"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">＋ Create New</button>
            </div>
          </div>

          <div id="tableContainer" class="overflow-x-auto border rounded-lg"></div>
        </div>
      </div>
    `;

    await this.loadList();

    document.getElementById("btnCreate")?.addEventListener("click", () => this.openCreateForm());
  }

  async loadList() {
    const mount = document.getElementById("tableContainer");
    mount.innerHTML = `<p class="text-gray-500 p-4">Loading...</p>`;

    try {
      const listRes = await fetch(this.ENDPOINT_LIST);
      const listData = await listRes.json();
      if (!listRes.ok || listData?.isSuccess === false) {
        throw new Error(listData?.message || `Load failed (HTTP ${listRes.status})`);
      }
      const rows = Array.isArray(listData?.result) ? listData.result : [];

      const displayFields = [
        { name: "applicant_id", label: "Applicant ID" },
        { name: "application_rounds_id", label: "Application Round ID" },
        { name: "faculty_id", label: "Faculty ID" },
        { name: "department_id", label: "Department ID" },
        { name: "program", label: "Program" },
        { name: "application_statuses", label: "Status" },
      ];

      this.renderSimpleTable(rows, displayFields, mount);

      mount.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          const action = e.currentTarget.getAttribute("data-action");
          if (action === "edit") this.openEditForm(id);
          else if (action === "delete") this.deleteItem(id);
        });
      });
    } catch (err) {
      mount.innerHTML = `<p class="text-red-500 p-4">Error: ${err.message}</p>`;
    }
  }

  getIdFromRow(row) {
    return row?.ID ?? row?.Id ?? row?.id ?? null;
  }

  getCellValue(row, fieldName) {
    const n = String(fieldName);
    if (n.toLowerCase() === "id") return this.getIdFromRow(row) ?? "-";
    return row?.[n] ?? row?.[n.toLowerCase?.()] ?? "-";
  }

  renderSimpleTable(rows, fields, mountEl) {
    if (!mountEl) return;

    if (!rows || rows.length === 0) {
      mountEl.innerHTML = `
        <div class="p-8 text-center text-gray-500">
          <p class="text-lg font-medium">No application reports found</p>
          <p class="text-sm text-gray-400 mt-1">Try adding a new application report.</p>
        </div>`;
      return;
    }

    const headerCells = fields.map(f => `<th class="px-4 py-2 text-left">${f.label || f.name}</th>`).join("");
    const thead = `
      <thead class="bg-gray-100 text-gray-800">
        <tr>${headerCells}<th class="px-4 py-2 text-right">Actions</th></tr>
      </thead>`;

    const tbodyRows = rows.map(r => {
      const tds = fields.map(f => {
        const val = this.getCellValue(r, f.name);
        return `<td class="px-4 py-2">${val === "" ? "-" : val}</td>`;
      }).join("");

      const rowId = this.getIdFromRow(r);
      return `
        <tr class="border-b hover:bg-gray-50 transition">
          ${tds}
          <td class="px-4 py-2 text-right whitespace-nowrap">
            <button class="text-blue-600 hover:underline" data-id="${rowId}" data-action="edit">Edit</button>
            <button class="text-red-600 hover:underline ml-3" data-id="${rowId}" data-action="delete">Delete</button>
          </td>
        </tr>`;
    }).join("");

    const tableHTML = `
      <table class="min-w-full text-sm text-gray-700">
        ${thead}
        <tbody>${tbodyRows}</tbody>
      </table>`;

    mountEl.innerHTML = tableHTML;

    mountEl.style.width = "100%";
    mountEl.style.overflowX = "auto";
    mountEl.style.webkitOverflowScrolling = "touch";
    const tbl = mountEl.querySelector("table");
    if (tbl) {
      tbl.style.width = "max-content";
      tbl.querySelectorAll("th,td").forEach(el => (el.style.whiteSpace = "nowrap"));
    }
  }

  openCreateForm() {
    window.location.href = `${this.rootURL}/recruit/RenderApplicationReport`;
  }

  openEditForm(id) {
    window.location.href = `${this.rootURL}/recruit/RenderApplicationReport?edit=${id}`;
  }

  async deleteItem(id) {
    if (!id) return alert("Missing ID");
    if (!confirm("Are you sure you want to delete this application report?")) return;

    try {
      const res = await fetch(this.ENDPOINT_DELETE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id) }),
      });
      const result = await res.json();
      if (res.ok && result?.isSuccess !== false) {
        alert("Deleted successfully");
        await this.loadList();
      } else {
        throw new Error(result?.message || `Delete failed (HTTP ${res.status})`);
      }
    } catch (e) {
      alert("Delete error: " + e.message);
    }
  }
}

if (typeof window !== "undefined") window.ApplicationReportList = ApplicationReportList;
