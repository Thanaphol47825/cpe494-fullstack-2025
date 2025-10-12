class ApplicationReportCreate {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.formRenderer = null;
  }

  async render() {
    const container = document.getElementById("applicationReportFormContainer");
    if (!container) {
      console.error("Form container not found");
      return;
    }

    container.classList.remove("hidden");
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "mb-4 flex justify-between items-center";
    header.innerHTML = `
      <h2 class="text-xl font-semibold text-gray-800">Create Application Report</h2>
      <a href="#recruit/applicationreportmanager" class="text-blue-600 hover:underline text-sm">← Back to list</a>
    `;
    container.appendChild(header);

    const messageBox = document.createElement("div");
    messageBox.id = "applicationReportMessages";
    messageBox.className = "mb-4";
    container.appendChild(messageBox);

    const formSection = document.createElement("div");
    formSection.id = "applicationReportFormContainerInner";
    formSection.className = "bg-white rounded-xl shadow-sm border p-6";
    container.appendChild(formSection);

    const resultBox = document.createElement("div");
    resultBox.id = "applicationReportResult";
    resultBox.className = "mt-6";
    container.appendChild(resultBox);

    try {
      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "recruit/applicationreport",
        targetSelector: "#applicationReportFormContainerInner",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.formRenderer.render();
      console.log("Application Report form rendered");
    } catch (err) {
      console.error("Error rendering form:", err);
      this.showMessage(`Failed to render form: ${err.message}`, "error");
    }
  }

  async handleSubmit(formData, _event, _formInstance) {
    this.showMessage("Saving report...", "info");
    const payload = this.transformData(formData);

    try {
      const resp = await fetch(`${this.rootURL}/recruit/CreateApplicationReport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok || data?.isSuccess !== true) {
        const msg = data?.message || `Request failed (${resp.status} ${resp.statusText})`;
        this.showMessage(msg, "error");
        this.renderResult(data, "error");
        return false;
      }

      const result = data.result ?? {};
      const id =
        result?.ID ?? result?.Id ?? result?.id ??
        (Array.isArray(result) ? result[0]?.ID ?? result[0]?.Id ?? result[0]?.id : undefined);

      this.showMessage(`Application Report created successfully! ID: ${id || "-"}`, "success");
      this.renderResult(result, "success");

      this.safeFormReset();

      return true;
    } catch (error) {
      console.error("Error saving report:", error);
      this.showMessage("Network error while saving report.", "error");
      return false;
    }
  }

  transformData(formData) {
    const toRFC3339 = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? `${dateStr}T00:00:00Z` : d.toISOString();
    };

    return {
      ...formData,
      report_date: toRFC3339(formData.report_date),
      created_at: toRFC3339(formData.created_at),
    };
  }

  showMessage(message, type = "info") {
    const box = document.getElementById("applicationReportMessages");
    if (!box) return;

    const colors = {
      info: "bg-blue-50 text-blue-700 border border-blue-200",
      error: "bg-red-50 text-red-700 border border-red-200",
      success: "bg-green-50 text-green-700 border border-green-200",
    };

    box.innerHTML = `
      <div class="p-3 mb-4 rounded ${colors[type] || colors.info}">
        <p class="text-sm font-medium">${this.escapeHtml(String(message))}</p>
      </div>
    `;
  }

  renderResult(data, type = "info") {
    const box = document.getElementById("applicationReportResult");
    if (!box) return;

    box.innerHTML = "";
    const tone =
      type === "error"
        ? { bg: "bg-red-50 border-red-200", text: "text-red-700" }
        : { bg: "bg-green-50 border-green-200", text: "text-green-700" };

    const pre = document.createElement("pre");
    pre.className = `mt-1 p-4 rounded-lg border ${tone.bg} text-xs ${tone.text} whitespace-pre-wrap overflow-auto`;
    pre.style.maxHeight = "400px";

    try {
      pre.textContent = JSON.stringify(data, null, 2);
    } catch {
      pre.textContent = String(data);
    }

    box.appendChild(pre);
  }

  safeFormReset() {
    const form = document.querySelector("#applicationReportFormContainerInner form");
    if (form && typeof form.reset === "function") form.reset();
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

if (typeof window !== "undefined") window.ApplicationReportCreate = ApplicationReportCreate;
