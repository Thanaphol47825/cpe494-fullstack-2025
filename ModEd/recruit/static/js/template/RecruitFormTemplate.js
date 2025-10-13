(function (global) {
  if (global.RecruitFormTemplate) return;

  const ROOT = global.__ROOT_URL__ || global.RootURL || "";
  const MustacheRef = global.Mustache;

  const DEFAULT_FORM_OPTIONS = {
    title: "Form",
    subtitle: "",
    formId: "recruit-form",
    backLink: "recruit",
    backText: "Back",
    colorPrimary: "#059669",
    colorAccent: "#0f766e",
    iconPath: ""
  };

  class RecruitFormTemplate {

    static _normalizeOptions(options) {
      if (!options || typeof options !== "object") {
        throw new Error(
          "RecruitFormTemplate.getForm(options, mode): options must be an object"
        );
      }
      return { ...DEFAULT_FORM_OPTIONS, ...options };
    }

    static async getForm(options, mode = "create") {
      const cfg = this._normalizeOptions(options);

      let tpl;
      try {
        const res = await fetch(`${ROOT}/recruit/static/view/RecruitFormTemplate.tpl`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        tpl = await res.text();
      } catch (err) {
        throw new Error(`Failed to load RecruitFormTemplate.tpl (${err.message})`);
      }

      if (!MustacheRef) {
        throw new Error("Mustache is not available on window.Mustache.");
      }

      const html = MustacheRef.render(tpl, { ...cfg, mode });
      const wrap = document.createElement("div");
      wrap.innerHTML = (html || "").trim();
      const rootEl = wrap.firstElementChild;
      if (!rootEl) throw new Error("RecruitFormTemplate: Empty template output.");

      rootEl.dataset.recruitFormId = cfg.formId || "recruit-form";
      try {
        rootEl.style.setProperty("--rf-primary", cfg.colorPrimary || DEFAULT_FORM_OPTIONS.colorPrimary);
        rootEl.style.setProperty("--rf-accent", cfg.colorAccent || DEFAULT_FORM_OPTIONS.colorAccent);
      } catch { }

      return rootEl;
    }

    static mountMessageAndResult(formRoot, opts = {}) {
      if (!formRoot) throw new Error("mountMessageAndResult requires a form root element.");
      if (formRoot.__recruitUI) return formRoot.__recruitUI;

      const formId =
        formRoot.dataset.recruitFormId ||
        (formRoot.querySelector("form")?.id ?? "recruit-form");

      const msgSlot = formRoot.querySelector("#recruit-form-messages-slot");
      const resultSlot = formRoot.querySelector("#recruit-form-result-slot");

      const messagesId = opts.messagesId || `${formId}-messages`;
      const resultId = opts.resultId || `${formId}-result`;

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
        resultBox.style.marginTop = "12px";
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
      formRoot.__recruitUI = api;
      return api;
    }
  }

  global.RecruitFormTemplate = RecruitFormTemplate;
})(window);
