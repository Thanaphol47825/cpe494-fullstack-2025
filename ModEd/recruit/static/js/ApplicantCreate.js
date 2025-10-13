(function (global) {
  if (global.ApplicantCreate) return;

  class ApplicantCreate {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || global.RootURL || global.__ROOT_URL__ || "";
      this.formRenderer = null;
      this.ui = null;
    }

    async render() {
      const container = this.templateEngine?.mainContainer;
      if (!container) {
        console.error("ApplicantCreate: mainContainer not found");
        return false;
      }
      container.innerHTML = "";

      try {
        const formRoot = await global.RecruitFormTemplate.getForm(
          {
            title: "Applicant",
            subtitle: "Add a new applicant",
            formId: "applicant-form",
            backLink: "recruit",
            backText: "Back to Recruit Menu",
            colorPrimary: "#059669",
            colorAccent: "#0f766e",
            iconPath:
              "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
          },
          "create"
        );

        container.appendChild(formRoot);

        this.ui = global.RecruitFormTemplate.mountMessageAndResult(formRoot, {
          messagesId: "applicantMessages",
          resultId: "applicantResult",
        });

        this.formRenderer = new global.AdvanceFormRender(this.templateEngine, {
          modelPath: "recruit/applicant",
          targetSelector: "#applicant-form",
          submitHandler: this.handleSubmit.bind(this),
          autoFocus: true,
          validateOnBlur: true,
        });

        await this.formRenderer.render();
        return true;
      } catch (error) {
        console.error("ApplicantCreate render error:", error);
        this.ui?.showMessage?.(`Failed to load form: ${error.message}`, "error");
        return false;
      }
    }

    async handleSubmit(formData) {
      this.ui?.showMessage("Saving applicant...", "info");
      const payload = this.transformData(formData);

      let resp;
      try {
        resp = await fetch(`${this.rootURL}/recruit/CreateApplicant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        this.ui?.showMessage("Network error while saving applicant.", "error");
        this.ui?.renderResult({ error: "Network error" }, "error");
        return false;
      }

      let data = {};
      try { data = await resp.json(); } catch {}

      if (!resp.ok || data?.isSuccess !== true) {
        const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? " " + resp.statusText : ""})`;
        this.ui?.showMessage(msg, "error");
        this.ui?.renderResult(data, "error");
        return false;
      }

      const resultArr = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
      const id = resultArr[0]?.ID ?? resultArr[0]?.Id ?? resultArr[0]?.id;

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
      const root = document.getElementById("applicant-form");
      if (!root) return false;

      root.querySelectorAll("input, select, textarea").forEach((el) => {
        const tag = (el.tagName || "").toLowerCase();
        const type = (el.type || "").toLowerCase();

        if (tag === "input") {
          if (type === "checkbox" || type === "radio") el.checked = false;
          else el.value = "";
        } else if (tag === "select") {
          el.selectedIndex = 0;
        } else if (tag === "textarea") {
          el.value = "";
        }
      });
      return true;
    }
  }

  global.ApplicantCreate = ApplicantCreate;
})(window);
