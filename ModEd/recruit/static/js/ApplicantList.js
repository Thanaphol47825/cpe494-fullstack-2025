(function (global) {
  class ApplicantList {
    constructor(application, rootURL) {
      this.application = application;
      this.rootURL = rootURL || global.__ROOT_URL__ || global.RootURL || "";

      this.ENDPOINT_LIST     = `${this.rootURL}/recruit/GetApplicants`;
      this.ENDPOINT_GET_ONE  = (id) => `${this.rootURL}/recruit/GetApplicant/${id}`;
      this.ENDPOINT_CREATE   = `${this.rootURL}/recruit/CreateApplicant`;
      this.ENDPOINT_UPDATE   = `${this.rootURL}/recruit/UpdateApplicant`;
      this.ENDPOINT_DELETE   = `${this.rootURL}/recruit/DeleteApplicant`;
      this.ENDPOINT_IMPORT   = `${this.rootURL}/recruit/ImportApplicantsFromFile`;

      this.table = null;
      this.form  = null;
      this.currentEditId = null;
      this.ui = null;

      global.applicantManager = this;
    }

    async render() {
      const container = this.application?.mainContainer;
      if (!container) {
        console.error("❌ mainContainer not found");
        return false;
      }

      if (!global.RecruitTableTemplate) {
        console.error("RecruitTableTemplate not loaded — ensure RecruitApplication preloads it.");
        return false;
      }

      try {
        container.innerHTML = "";
        const root = await global.RecruitTableTemplate.getTable("ApplicantTable", "manage");
        container.appendChild(root);

        this.ui = global.RecruitTableTemplate.mountMessageAndResult(root, {
          messagesId: "applicantMessages",
          resultId: "applicantResult"
        });

        this.$tableHost = root.querySelector("#recruit-table-container");
        this.$panelHost = root.querySelector("#recruit-sidepanel-container");

        root.querySelector('[data-action="import"]')?.addEventListener("click", () => this.importFromFile());
        root.querySelector('[data-action="reset"]')?.addEventListener("click", () => this.resetForm());

        this.setupTable();
        this.setupForm();

        await this.renderTable();
        await this.renderForm();
        return true;
      } catch (err) {
        console.error(err);
        this.ui?.showMessage?.(`Load error: ${err.message}`, "error");
        return false;
      }
    }

    setupTable() {
      this.table = new global.AdvanceTableRender(this.application, {
        modelPath: "recruit/applicant",
        data: [],
        targetSelector: "#recruit-table-container",
        customColumns: [
          {
            name: "actions",
            label: "Actions",
            template: `
              <div style="white-space:nowrap;">
                <button onclick="applicantManager.edit({ID})" class="text-blue-600 hover:underline" style="margin-right:8px;">Edit</button>
                <button onclick="applicantManager.delete({ID})" class="text-red-600 hover:underline">Delete</button>
              </div>
            `
          }
        ]
      });
    }

    async renderTable() {
      if (!this.$tableHost) return;
      this.$tableHost.innerHTML = `<p style="padding:8px; color:#6b7280;">Loading applicants…</p>`;

      await this.table.loadSchema();

      if (Array.isArray(this.HIDDEN_COLUMNS) && this.HIDDEN_COLUMNS.length > 0 && this.table.schema) {
        this.table.schema = this.table.schema.filter(col =>
          !this.HIDDEN_COLUMNS.includes(col.name) &&
          col.type !== 'hidden' && col.type !== '-' && col.display !== false
        );
      }

      this.table.targetSelector = "#recruit-table-container";

      await this.table.render();
      await this.refreshTable();
    }

    async refreshTable() {
      try {
        const resp = await fetch(this.ENDPOINT_LIST);
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || "Failed to load applicants");
        }
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        this.table.setData(rows);
      } catch (err) {
        this.ui?.showMessage(`Error loading applicants: ${err.message}`, "error");
      }
    }

    setupForm() {
      this.form = new global.AdvanceFormRender(this.application, {
        modelPath: "recruit/applicant",
        targetSelector: "#recruit-sidepanel-container",
        submitHandler: async (formData) => await this.handleFormSubmit(formData),
        autoFocus: true,
        validateOnBlur: true
      });
    }

    async renderForm() {
      await this.form.render();
      this.resetForm();
    }

    async handleFormSubmit(formData) {
      this.ui?.showMessage("Saving applicant...", "info");

      const toRFC3339 = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? `${dateStr}T00:00:00Z` : d.toISOString();
      };

      const resolvedId =
        formData?.ID ?? formData?.Id ?? formData?.id ?? this.currentEditId ?? null;

      const payload = {
        ...formData,
        ...(resolvedId != null ? { ID: Number(resolvedId), id: Number(resolvedId) } : {}),
        birth_date: toRFC3339(formData.birth_date),
        start_date: toRFC3339(formData.start_date),
      };

      const isUpdate = resolvedId != null;
      const url = isUpdate ? this.ENDPOINT_UPDATE : this.ENDPOINT_CREATE;

      let resp, data;
      try {
        resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch {
        this.ui?.showMessage("Network error while saving applicant.", "error");
        return false;
      }

      try { data = await resp.json(); } catch { data = {}; }

      if (!resp.ok || data?.isSuccess !== true) {
        const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? " " + resp.statusText : ""})`;
        this.ui?.showMessage(msg, "error");
        return false;
      }

      const result = data.result ?? {};
      const id =
        result?.ID ?? result?.Id ?? result?.id ??
        (Array.isArray(result) ? result[0]?.ID ?? result[0]?.Id ?? result[0]?.id : resolvedId);

      this.ui?.showMessage(
        `Applicant ${isUpdate ? "updated" : "created"} successfully! ID: ${id || "?"}`,
        "success"
      );

      await this.refreshTable();
      this.resetForm();
      return true;
    }

    async edit(id) {
      if (!id) return;
      try {
        this.currentEditId = Number(id);
        const resp = await fetch(this.ENDPOINT_GET_ONE(id));
        const payload = await resp.json().catch(() => ({}));
        if (!resp.ok || payload?.isSuccess === false) {
          throw new Error(payload?.message || `Unable to load applicant #${id}`);
        }
        const applicant = payload?.result || payload || {};
        await this.form.render();
        this.form.setData(applicant);
        this.ui?.showMessage(`Editing applicant ID ${id}`, "info");
      } catch (err) {
        this.ui?.showMessage(`Edit error: ${err.message}`, "error");
      }
    }

    resetForm() {
      this.currentEditId = null;
      try {
        const formRoot = this.form?.form?.html || this.form?.html;
        if (!formRoot) return;

        if (typeof formRoot.reset === "function") {
          formRoot.reset();
        } else {
          const fields = formRoot.querySelectorAll("input, select, textarea");
          fields.forEach(el => {
            const tag = (el.tagName || "").toLowerCase();
            const type = (el.type || "").toLowerCase();
            if (tag === "input") {
              if (["checkbox", "radio"].includes(type)) el.checked = false;
              else el.value = "";
            } else if (tag === "select") {
              el.selectedIndex = 0;
            } else if (tag === "textarea") {
              el.value = "";
            }
          });
        }
      } catch (err) {
        this.ui?.showMessage("Error resetting form: " + err.message, "error");
      }
    }

    async delete(id) {
      if (!id) return;
      if (!confirm("Delete this applicant?")) return;

      try {
        const resp = await fetch(this.ENDPOINT_DELETE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id) })
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || "Delete failed");
        }

        this.ui?.showMessage(`Applicant ID ${id} deleted successfully.`, "success");
        await this.refreshTable();
      } catch (err) {
        this.ui?.showMessage(`Delete error: ${err.message}`, "error");
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

      try {
        const formData = new FormData();
        formData.append("file", file, file.name);

        const resp = await fetch(this.ENDPOINT_IMPORT, { method: "POST", body: formData });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.isSuccess === false)
          throw new Error(data?.message || "Import failed");

        const count = Array.isArray(data?.result)
          ? data.result.length
          : (data?.result?.count ?? 0);

        this.ui?.showMessage(`Imported ${count} applicant(s) from ${file.name}.`, "success");
        await this.refreshTable();
      } catch (err) {
        this.ui?.showMessage(`Import error: ${err.message}`, "error");
      }
    }
  }

  if (typeof window !== "undefined") window.ApplicantList = ApplicantList;
})(window);
