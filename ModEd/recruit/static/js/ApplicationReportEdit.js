class ApplicationReportEdit extends ApplicationReportCreate {
  async render(id) {
    if (!id) return console.error("No ID provided for edit");

    const container = this.templateEngine?.mainContainer || document.getElementById("MainContainer");
    if (!container) return;

    container.innerHTML = "";

    const wrapper = document.createElement("main");
    wrapper.className = "form-container";
    wrapper.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a href="#recruit/applicationreportmanager" class="btn-home">← Back to Report List</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 class="text-xl font-semibold text-gray-800">Edit Application Report #${id}</h2>
      </header>
      <div id="applicationReportMessages"></div>
      <div id="applicationReportFormContainer"></div>
      <div id="applicationReportResult" class="mt-4"></div>
    `;
    container.appendChild(wrapper);

    try {
      const resp = await fetch(`${this.rootURL}/recruit/GetApplicationReportById/${id}`);
      const data = await resp.json();
      if (!data.isSuccess) throw new Error(data.message || "Load failed");

      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "recruit/applicationreport",
        targetSelector: "#applicationReportFormContainer",
        submitHandler: (formData) => this.handleEditSubmit(formData, id),
      });

      await this.formRenderer.render();
      this.formRenderer.setData(data.result);
    } catch (e) {
      console.error(e);
      this.showMessage("Failed to load report.", "error");
    }
  }

  async handleEditSubmit(formData, id) {
    const payload = this.transformData(formData);
    try {
      const resp = await fetch(`${this.rootURL}/recruit/UpdateApplicationReport/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.isSuccess) {
        this.showMessage("Report updated successfully.", "success");
      } else {
        this.showMessage("Update failed.", "error");
      }
    } catch {
      this.showMessage("Network error while updating.", "error");
    }
  }
}

if (typeof window !== "undefined") window.ApplicationReportEdit = ApplicationReportEdit;
