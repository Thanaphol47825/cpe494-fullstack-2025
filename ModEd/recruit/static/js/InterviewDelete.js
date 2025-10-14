
if (typeof window !== 'undefined' && !window.InterviewDelete) {
  class InterviewDelete {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine;
      this.rootURL = rootURL || window.__ROOT_URL__ || "";
    }

    async confirmDelete(id) {
      if (!confirm(`Are you sure you want to delete interview #${id}?`)) return;

      try {
        const resp = await fetch(`${this.rootURL}/recruit/DeleteInterview`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id) })
        });
        const data = await resp.json();
        if (data.isSuccess) {
          alert(`Interview #${id} deleted successfully.`);
          window.location.hash = '#recruit/interview/list';
        } else {
          alert("Failed to delete interview: " + (data.message || ""));
        }
      } catch (e) {
        console.error(e);
        alert("Error deleting interview.");
      }
    }
  }

  window.InterviewDelete = InterviewDelete;
}

