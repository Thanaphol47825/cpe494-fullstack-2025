
(function (global) {
  if (global.ApplicantCreate) return;

  class ApplicantCreate {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || global.__ROOT_URL__ || global.RootURL || "";
      this.formRenderer = null;
    }

    async render() {
      if (!this.templateEngine?.mainContainer) {
        console.error("Template engine or main container not found");
        return false;
      }

      const container = this.templateEngine.mainContainer;
      container.innerHTML = "";

      try {
        const formRoot = await global.RecruitFormTemplate.getForm("ApplicantForm", "create");
        container.appendChild(formRoot);

        const msgSlot = formRoot.querySelector("#recruit-form-messages-slot");
        const resultSlot = formRoot.querySelector("#recruit-form-result-slot");

        if (msgSlot) {
          const m = document.createElement("div");
          m.id = "applicantMessages";
          msgSlot.appendChild(m);
        }

        if (resultSlot) {
          const r = document.createElement("div");
          r.id = "applicantResult";
          r.style.marginTop = "12px";
          resultSlot.appendChild(r);
        }

        this.formRenderer = new AdvanceFormRender(this.templateEngine, {
          modelPath: "recruit/applicant",
          targetSelector: "#applicant-form",
          submitHandler: this.handleSubmit.bind(this),
          autoFocus: true,
          validateOnBlur: true,
        });

        await this.formRenderer.render();
        return true;
      } catch (error) {
        console.error("Error rendering ApplicantCreate:", error);
        this.showMessage(`Failed to load form: ${error.message}`, "error");
        return false;
      }
    }

    async handleSubmit(formData) {
      this.showMessage("Saving applicant...", "info");
      const payload = this.transformData(formData);

      let resp, data;
      try {
        resp = await fetch(`${this.rootURL}/recruit/CreateApplicant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        this.showMessage("Network error while saving applicant.", "error");
        this.renderResult({ error: "Network error" }, "error");
        return false;
      }

      try {
        data = await resp.json();
      } catch {
        data = {};
      }

      if (!resp.ok || data?.isSuccess !== true) {
        const msg =
          data?.message ||
          `Request failed (${resp.status}${resp.statusText ? " " + resp.statusText : ""})`;
        this.showMessage(msg, "error");
        this.renderResult(data, "error");
        return false;
      }

      const result = data.result ?? {};
      const id =
        result?.ID ??
        result?.Id ??
        result?.id ??
        (Array.isArray(result) ? result[0]?.ID ?? result[0]?.Id ?? result[0]?.id : undefined);

      this.clearMessages();
      const successText = `Applicant created successfully!${id ? " ID: " + id : ""}`;
      this.renderResult(result, "success", successText);
      this.safeFormReset();
      return true;
    }

    transformData(formData) {
      const toRFC3339 = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? `${dateStr}T00:00:00Z` : d.toISOString();
      };
      return {
        ...formData,
        birth_date: toRFC3339(formData.birth_date),
        start_date: toRFC3339(formData.start_date),
      };
    }

    showMessage(message, type = "info") {
      const box = document.getElementById("applicantMessages");
      if (!box) return;
      const cls =
        type === "error" ? "msg error" :
        type === "success" ? "msg success" : "msg info";
      box.innerHTML = `<div class="${cls}">${this.escapeHtml(String(message))}</div>`;
    }

    clearMessages() {
      const box = document.getElementById("applicantMessages");
      if (box) box.innerHTML = "";
    }

    renderResult(data, type = "info", notice = null) {
      const box = document.getElementById("applicantResult");
      if (!box) return;
      box.innerHTML = "";
      if (notice) {
        const n = document.createElement("div");
        n.className = `notice ${type === "error" ? "error" : "success"}`;
        n.textContent = notice;
        box.appendChild(n);
      }
      const pre = document.createElement("pre");
      pre.className = `json-box ${type === "error" ? "error" : "success"}`;
      try {
        pre.textContent = JSON.stringify(data, null, 2);
      } catch {
        pre.textContent = String(data);
      }
      box.appendChild(pre);
    }

    safeFormReset() {
      const container = document.getElementById("applicant-form");
      if (!container) return false;
      container.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
    }

    escapeHtml(str) {
      return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
  }

  global.ApplicantCreate = ApplicantCreate;
})(window);
