if (!window.CommonFacultyListFeature) {
  class CommonFacultyListFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL || "";
    }

    async render() {
      // ตรวจสอบ container
      if (!this.templateEngine?.mainContainer) {
        console.error("❌ Template engine or main container not found");
        return false;
      }

      const container = this.templateEngine.mainContainer;
      container.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-10 px-6">
          <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800">Faculty List</h2>
              <div class="flex items-center gap-3">
                <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
                <a href="#common/faculty/create" class="button">+ Add Faculty</a>
              </div>
            </div>
            <div id="facultyTable" class="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <p class="text-gray-500">Loading faculties...</p>
            </div>
          </div>
        </div>
      `;

      try {
        const response = await fetch(`${this.rootURL}/common/faculties/getall`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Check current user role
        const currentRole = localStorage.getItem('userRole') || localStorage.getItem('role');
        const isAdmin = currentRole === 'Admin';

        // Build action buttons based on role
        const customColumns = [];

        // Only Admin can see actions for faculties
        if (isAdmin) {
          customColumns.push({
            name: "actions",
            label: "Actions",
            template: `
              <div class="flex space-x-2">
                <button onclick="commonFacultyList.viewFaculty('{ID}')"
                        class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  View
                </button>
                <button onclick="commonFacultyList.editFaculty('{ID}')"
                        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Edit
                </button>
                <button onclick="commonFacultyList.deleteFaculty('{ID}', '{name}')"
                        class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                  Delete
                </button>
              </div>
            `
          });
        }

        const table = new AdvanceTableRender(this.templateEngine, {
          modelPath: "common/faculty",
          dataPath: "common/faculties/getall",
          data: data.result || [],
          targetSelector: "#facultyTable",
          customColumns: customColumns,
        });

        await table.render();
        window.commonFacultyList = this;
      } catch (err) {
        console.error("❌ Error rendering table:", err);
        const tableEl = document.getElementById("facultyTable");
        if (tableEl)
          tableEl.innerHTML = `<p class="text-red-600">Error loading faculty data.</p>`;
      }

      return true;
    }

    editFaculty(id) {
      location.hash = `#common/faculty/create?id=${id}`;
    }

    async viewFaculty(id) {
      try {
        // Load CommonViewDetailModal if not already loaded
        if (!window.CommonViewDetailModal) {
          const script = document.createElement('script');
          script.src = `${this.rootURL}/common/static/js/CommonViewDetailModal.js`;
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
        }

        // Fetch faculty data
        const res = await fetch(`${this.rootURL}/common/faculties/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { result } = await res.json();

        // Create and show modal
        const modalId = `faculty-view-${id}`;
        await window.CommonViewDetailModal.createModal({
          modalType: 'Faculty',
          modalId: modalId,
          data: result
        });
      } catch (e) {
        console.error(e);
        alert("Failed to load faculty details.");
      }
    }

    async deleteFaculty(id, name = `ID ${id}`) {
      if (
        !confirm(
          `Are you sure you want to delete faculty "${name}" (${id})?\n\nThis action cannot be undone.`
        )
      ) {
        return;
      }
      try {
        let res = await fetch(`${this.rootURL}/common/faculty/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (res.status === 405 || res.status === 404) {
          res = await fetch(`${this.rootURL}/common/faculties/delete/${id}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });
        }
        if (!res.ok) {
          let msg = `Delete failed (HTTP ${res.status}).`;
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
          } catch {}
          alert(msg);
          return;
        }
        alert(`Faculty "${name}" deleted successfully!`);
        await this.render();
      } catch (e) {
        console.error("Error deleting faculty:", e);
        alert(`Failed to delete faculty: ${e.message}`);
      }
    }
  }

  window.CommonFacultyListFeature = CommonFacultyListFeature;
}

async function editFaculty(id) {
  location.hash = `#common/faculty/edit/${encodeURIComponent(id)}`;
}

async function viewFaculty(id) {
  alert(`👁 View faculty ID: ${id}`);
}

async function deleteFaculty(id) {}
