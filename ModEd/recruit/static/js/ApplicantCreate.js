(function (global) {
  if (global.ApplicantCreate) return;

  class ApplicantCreate {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || global.__ROOT_URL__ || global.RootURL || "";
      this.formRenderer = null;
      this.ui = null;
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

        this.ui = global.RecruitFormTemplate.mountMessageAndResult(formRoot, {
          messagesId: "applicantMessages",
          resultId: "applicantResult",
        });

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
        this.ui?.showMessage?.(`Failed to load form: ${error.message}`, "error");
        return false;
      }
    }

    async handleSubmit(formData) {
      this.ui?.showMessage("Saving applicant...", "info");
      const payload = this.transformData(formData);

      let resp, data;
      try {
        resp = await fetch(`${this.rootURL}/recruit/CreateApplicant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        this.ui?.showMessage("Network error while saving applicant.", "error");
        this.ui?.renderResult({ error: "Network error" }, "error");
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
        this.ui?.showMessage(msg, "error");
        this.ui?.renderResult(data, "error");
        return false;
      }

      const resultArr = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
      const id = resultArr[0]?.ID;

      this.ui?.clearMessages();
      const successText = `Applicant created successfully!${id ? " ID: " + id : ""}`;
      this.ui?.renderResult(resultArr, "success", successText);
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

    safeFormReset() {
      const container = document.getElementById("applicant-form");
      if (!container) return false;
      container.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
    }
  }

  global.ApplicantCreate = ApplicantCreate;
})(window);
