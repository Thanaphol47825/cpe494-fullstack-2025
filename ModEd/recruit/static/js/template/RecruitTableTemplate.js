(function (global) {
  if (global.RecruitTableTemplate) return;

  const ROOT = global.__ROOT_URL__ || global.RootURL || "";

  class RecruitTableTemplate {
    static TABLE_CONFIGS = {
      ApplicantTable: {
        title: "🧑‍💼 Applicant Management",
        subtitle: "Browse, import, and edit applicants",
        tableId: "applicant-table",
        panelTitle: "Applicant Form",
        backLink: "recruit",
        backText: "Back to Recruit Menu",
        colorPrimary: "#2563eb",
        colorAccent: "#1e40af",
        iconPath:
          "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm3 4h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z",
      },
    };


    static async getTable(tableKey, mode = "manage") {
      const cfg = this.TABLE_CONFIGS[tableKey];
      if (!cfg) throw new Error(`RecruitTableTemplate: Unknown tableKey "${tableKey}"`);
      const root = await this._renderTemplate(cfg, mode);

      try {
        root.style.setProperty("--rt-primary", cfg.colorPrimary || "#2563eb");
        root.style.setProperty("--rt-accent", cfg.colorAccent || "#1e40af");
      } catch {

      }

      return root;
    }

    static async _renderTemplate(cfg, mode) {
      const res = await fetch(`${ROOT}/recruit/static/view/RecruitTableTemplate.tpl`);
      if (!res.ok) throw new Error(`Failed to load RecruitTableTemplate.tpl (${res.status})`);
      const tpl = await res.text();

      const html = global.Mustache.render(tpl, { ...cfg, mode });
      const wrap = document.createElement("div");
      wrap.innerHTML = html.trim();
      const rootEl = wrap.firstElementChild;

      rootEl.dataset.recruitTableId = cfg.tableId || "";
      return rootEl;
    }

    static mountMessageAndResult(root, opts = {}) {
      if (!root) throw new Error("mountMessageAndResult requires a root element.");
      if (root.__recruitTableUI) return root.__recruitTableUI;

      const tableId = root.dataset.recruitTableId || "recruit-table";
      const msgSlot = root.querySelector("#recruit-table-messages-slot");
      const resultSlot = root.querySelector("#recruit-table-result-slot");

      const messagesId = opts.messagesId || `${tableId}-messages`;
      const resultId = opts.resultId || `${tableId}-result`;

      let msgBox = null;
      if (msgSlot) {
        msgBox = document.createElement("div");
        msgBox.id = messagesId;
        msgBox.className = "recruit-messages";
        msgSlot.appendChild(msgBox);
      }

      let resultBox = null;
      if (resultSlot) {
        resultBox = document.createElement("div");
        resultBox.id = resultId;
        resultBox.className = "recruit-result";
        resultSlot.appendChild(resultBox);
      }

      const escapeHtml = (str) =>
        String(str)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");

      const showMessage = (message, type = "info") => {
        if (!msgBox) return;
        const cls =
          type === "error" ? "msg error" :
          type === "success" ? "msg success" : "msg info";
        msgBox.innerHTML = `<div class="${cls}">${escapeHtml(message)}</div>`;
      };

      const clearMessages = () => {
        if (msgBox) msgBox.innerHTML = "";
      };

      const renderResult = (data, type = "info", notice = null) => {
        if (!resultBox) return;
        resultBox.innerHTML = "";

        if (notice) {
          const n = document.createElement("div");
          n.className = `notice ${type === "error" ? "error" : "success"}`;
          n.textContent = notice;
          resultBox.appendChild(n);
        }

        const pre = document.createElement("pre");
        pre.className = `json-box ${type === "error" ? "error" : "success"}`;
        try {
          pre.textContent = JSON.stringify(data, null, 2);
        } catch {
          pre.textContent = String(data);
        }
        resultBox.appendChild(pre);
      };

      const clearResult = () => {
        if (resultBox) resultBox.innerHTML = "";
      };

      const api = { showMessage, clearMessages, renderResult, clearResult };
      root.__recruitTableUI = api;
      return api;
    }
  }

  global.RecruitTableTemplate = RecruitTableTemplate;
})(window);
