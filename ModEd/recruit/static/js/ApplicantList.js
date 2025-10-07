class ApplicantList {
  constructor(engine, rootURL) {
    this.engine = engine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";

    this.ENDPOINT_LIST = this.rootURL + "/recruit/GetApplicants";
    this.ENDPOINT_DELETE = this.rootURL + "/recruit/DeleteApplicant";
    this.ENDPOINT_IMPORT = this.rootURL + "/recruit/ImportApplicantsFromFile";
    this.ENDPOINT_SCHEMA = this.rootURL + "/api/modelmeta/applicant";
    this.FORM_MODULE = "/recruit/static/js/ApplicantList_Create.js";
  }

  async render() {
    this.engine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-[1200px] mx-auto bg-white shadow rounded-2xl p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🧑‍💼 Applicants
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

    document.getElementById("btnCreate")?.addEventListener("click", () => this.#openForm());
    document.getElementById("btnImport")?.addEventListener("click", () => this.importFromFile());
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

      let displayFields = [];
      try {
        const schemaRes = await fetch(this.ENDPOINT_SCHEMA);
        if (!schemaRes.ok) throw new Error(`Schema HTTP ${schemaRes.status}`);
        const schema = await schemaRes.json();
        displayFields = (Array.isArray(schema) ? schema : []).filter(f => f.display !== false);
      } catch (e) {
        console.warn("Schema fetch failed, using fallback columns:", e.message);
        displayFields = [
          { name: "first_name", label: "First Name" },
          { name: "last_name", label: "Last Name" },
          { name: "email", label: "Email" },
          { name: "phone_number", label: "Phone" },
        ];
      }

      const idIndex = displayFields.findIndex(f => String(f.name).toLowerCase() === "id");
      if (idIndex === -1) {
        displayFields.unshift({ name: "ID", label: "ID" });
      } else {
        const idField = displayFields.splice(idIndex, 1)[0];
        displayFields.unshift({ name: "ID", label: idField.label || "ID" });
      }

      this.renderSimpleTable(rows, displayFields, mount);

      mount.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          const action = e.currentTarget.getAttribute("data-action");
          if (action === "edit") this.#openForm(id);
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
          <p class="text-lg font-medium">No applicants found</p>
          <p class="text-sm text-gray-400 mt-1">Try adding a new applicant.</p>
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

  async #openForm(id = null) {
    try {
      await this.engine.fetchModule(this.FORM_MODULE);
    } catch (e) {
      alert("Failed to load form module: " + e.message);
      return;
    }

    const FormClass = window.ApplicantListCreate;
    if (typeof FormClass !== "function") {
      alert("Form class not found. Make sure ApplicantList_Create.js sets window.ApplicantListCreate.");
      return;
    }

    const form = new FormClass(this.engine, this.rootURL, id);
    this.engine.mainContainer.innerHTML = "";
    await form.render();
  }

  async deleteItem(id) {
    if (!id) return alert("Missing ID");
    if (!confirm("Are you sure you want to delete this applicant?")) return;

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

    const mount = document.getElementById("tableContainer");
    const prevHTML = mount.innerHTML;
    mount.innerHTML = `<p class="text-gray-500 p-4">Uploading & importing <b>${file.name}</b>…</p>`;

    try {
      const resp = await fetch(this.ENDPOINT_IMPORT, { method: "POST", body: formData });

      let data = {};
      try { data = await resp.json(); } catch { /* non-JSON */ }

      if (!resp.ok || data?.isSuccess === false) {
        throw new Error(data?.message || `Import failed (HTTP ${resp.status})`);
      }

      const count = Array.isArray(data?.result) ? data.result.length : (data?.result?.count ?? 0);
      alert(`Imported ${count} applicant(s) from ${file.name}.`);
      await this.loadList();
    } catch (err) {
      alert("Error importing file: " + err.message);
      mount.innerHTML = prevHTML;
    }
  }
}

if (typeof window !== "undefined") {
  window.ApplicantList = ApplicantList;
}
