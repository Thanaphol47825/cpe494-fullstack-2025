(function (global) {
  if (global.RecruitTableTemplate) return;

  const ROOT = global.__ROOT_URL__ || global.RootURL || "";
  const MustacheRef = global.Mustache;

  const DEFAULT_TABLE_OPTIONS = {
    title: "Table",
    subtitle: "",
    tableId: "recruit-table",
    panelTitle: "Form",
    backLink: "recruit",
    backText: "Back",
    colorPrimary: "#2563eb",
    colorAccent: "#1e40af",
    iconPath: ""
  };

  class RecruitTableTemplate {
    static _normalizeOptions(options) {
      if (!options || typeof options !== "object") {
        throw new Error(
          "RecruitTableTemplate.getTable(options, mode): options must be an object"
        );
      }
      return { ...DEFAULT_TABLE_OPTIONS, ...options };
    }

    static async getTable(options, mode = "manage") {
      const cfg = this._normalizeOptions(options);

      let tpl;
      try {
        const res = await fetch(`${ROOT}/recruit/static/view/RecruitTableTemplate.tpl`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        tpl = await res.text();
      } catch (err) {
        throw new Error(`Failed to load RecruitTableTemplate.tpl (${err.message})`);
      }

      if (!MustacheRef) {
        throw new Error("Mustache is not available on window.Mustache.");
      }

      const html = MustacheRef.render(tpl, { ...cfg, mode });
      const wrap = document.createElement("div");
      wrap.innerHTML = (html || "").trim();
      const rootEl = wrap.firstElementChild;
      if (!rootEl) throw new Error("RecruitTableTemplate: Empty template output.");

      rootEl.dataset.recruitTableId = cfg.tableId || "recruit-table";
      try {
        rootEl.style.setProperty("--rt-primary", cfg.colorPrimary || DEFAULT_TABLE_OPTIONS.colorPrimary);
        rootEl.style.setProperty("--rt-accent", cfg.colorAccent || DEFAULT_TABLE_OPTIONS.colorAccent);
      } catch {  }

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
