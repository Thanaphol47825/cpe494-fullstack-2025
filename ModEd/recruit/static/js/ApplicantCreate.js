class ApplicantCreate {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || window.RootURL || "";
    this.formRenderer = null;
  }

  async render() {
    if (!this.templateEngine?.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const wrapper = document.createElement("main");
    wrapper.className = "form-container";

    const header = document.createElement("div");
    header.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a id="recruitBackToMain" href="#recruit" class="btn-home">← Back to Recruit Menu</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Add Applicant</h2>
      </header>
      <div id="applicantMessages"></div>
    `;
    wrapper.appendChild(header);

    const formContainer = document.createElement("div");
    formContainer.id = "applicantFormContainer";
    wrapper.appendChild(formContainer);

    const resultContainer = document.createElement("div");
    resultContainer.id = "applicantResult";
    resultContainer.style.marginTop = "12px";
    wrapper.appendChild(resultContainer);

    container.appendChild(wrapper);

    const backBtn = document.getElementById("recruitBackToMain");
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        location.hash = "#recruit";
      });
    }

    try {
      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "recruit/applicant",
        targetSelector: "#applicantFormContainer",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.formRenderer.render();
      console.log("Applicant form rendered using AdvanceFormRender");
      return true;
    } catch (error) {
      console.error("Error rendering applicant form:", error);
      this.showMessage(`Failed to load form: ${error.message}`, "error");
      return false;
    }
  }

  async handleSubmit(formData, _event, _formInstance) {
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
      const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? " " + resp.statusText : ""})`;
      this.showMessage(msg, "error");
      this.renderResult(data, "error");
      return false;
    }

    const result = data.result ?? {};
    const id =
      result?.ID ?? result?.Id ?? result?.id ??
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

    const colorClass =
      type === "error" ? "text-red-600" :
      type === "success" ? "text-green-600" : "text-blue-600";

    const bg =
      type === "error" ? "bg-red-50" :
      type === "success" ? "bg-green-50" : "bg-blue-50";

    box.innerHTML = `
      <div class="mb-4 p-3 rounded-lg ${bg}">
        <p class="text-sm font-medium ${colorClass}">${this.escapeHtml(String(message))}</p>
      </div>
    `;
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
      const tone =
        type === "error"
          ? { bg: "bg-red-50 border-red-200", text: "text-red-700" }
          : { bg: "bg-green-50 border-green-200", text: "text-green-700" };

      const n = document.createElement("div");
      n.className = `mb-3 p-3 rounded-lg border ${tone.bg}`;
      n.innerHTML = `<p class="text-sm font-medium ${tone.text}">${this.escapeHtml(String(notice))}</p>`;
      box.appendChild(n);
    }

    const tone =
      type === "error"
        ? { bg: "bg-red-50 border-red-200", text: "text-red-700" }
        : { bg: "bg-green-50 border-green-200", text: "text-green-700" };

    const pre = document.createElement("pre");
    pre.className = `mt-1 p-4 rounded-lg border ${tone.bg} text-xs ${tone.text} whitespace-pre-wrap overflow-auto`;
    pre.style.maxHeight = "420px";
    try {
      pre.textContent = JSON.stringify(data, null, 2);
    } catch {
      pre.textContent = String(data);
    }
    box.appendChild(pre);

    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  safeFormReset() {
    const candidates = [
      document.querySelector("#applicantFormContainer form"),
      this.formRenderer?.form?.html,
      this.formRenderer?.formEl,
      this.formRenderer?.form,
    ];

    for (const el of candidates) {
      if (el && typeof el.reset === "function") {
        try { el.reset(); return true; } catch {}
      }
    }

    const container = document.getElementById("applicantFormContainer");
    if (!container) return false;
    container.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else if (el.tagName === "SELECT") el.selectedIndex = 0;
      else el.value = "";
    });
    return false;
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

if (typeof window !== "undefined") window.ApplicantCreate = ApplicantCreate;
