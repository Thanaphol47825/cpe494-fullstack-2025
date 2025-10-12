class ApplicationReportDelete {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async confirmDelete(id) {
    if (!confirm(`Are you sure you want to delete report #${id}?`)) return;

    try {
      const resp = await fetch(`${this.rootURL}/recruit/DeleteApplicationReport/${id}`, { method: "DELETE" });
      const data = await resp.json();
      if (data.isSuccess) {
        alert(`Report #${id} deleted successfully.`);
        new ApplicationReportList(this.templateEngine, this.rootURL).render();
      } else {
        alert("Failed to delete report.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting report.");
    }
  }
}

if (typeof window !== "undefined") window.ApplicationReportDelete = ApplicationReportDelete;
