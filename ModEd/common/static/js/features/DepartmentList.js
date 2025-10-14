if (!window.CommonDepartmentListFeature) {
  class CommonDepartmentListFeature {
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
              <h2 class="text-3xl font-bold text-gray-800">Department List</h2>
              <div class="flex items-center gap-3">
                <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
                <a href="#common/department/create" class="button">+ Add Department</a>
              </div>
            </div>
            <div id="departmentTable" class="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <p class="text-gray-500">Loading departments...</p>
            </div>
          </div>
        </div>
      `;


      try {

        const response = await fetch(`${this.rootURL}/common/departments/getall`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const table = new AdvanceTableRender(this.templateEngine, {
          modelPath: "common/department", // โหลด schema: /api/modelmeta/common/Department
          dataPath: "common/departments/getall",
          data: data || [], // โหลดข้อมูลจริง
          targetSelector: "#departmentTable",


          customColumns: [
            {
              name: "actions",
              label: "Actions",
              template: `
                <div class="flex space-x-2">
                  <button onclick="commonDepartmentList.editDepartment('{ID}')"
                          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Edit
                  </button>
                  <button onclick="commonDepartmentList.viewDepartment('{ID}')"
                          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    View
                  </button>
                  <button onclick="commonDepartmentList.deleteDepartment('{ID}', '{name}')"
                          class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                    Delete
                  </button>
                </div>
              `
            }
          ]
        });

        await table.render();
        window.commonDepartmentList = this;
      } catch (err) {
        console.error("❌ Error rendering table:", err);
        const tableEl = document.getElementById("departmentTable");
        if (tableEl)
          tableEl.innerHTML = `<p class="text-red-600">Error loading department data.</p>`;
      }

      return true;
    }

    editDepartment(id) {  
      location.hash = `#common/department/create?id=${id}`;
    }

    async viewDepartment(id) {
        try {
          const res = await fetch(`${this.rootURL}/common/departments/${id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const { result } = await res.json();
          alert(
            `👁 Department Details\n` +
            `Name: ${result?.name ?? "-"}\n` +
            `Faculty: ${result?.faculty ?? "-"}`
          );
        } catch (e) {
          console.error(e);
          alert("Failed to load department details.");
        }
      }

    async deleteDepartment(id, name = `ID ${id}`) {
      if (!confirm(`Are you sure you want to delete department "${name}" (${id})?\n\nThis action cannot be undone.`)) {
        return;
      }
      try {
        let res = await fetch(`${this.rootURL}/common/departments/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
        if (res.status === 405 || res.status === 404) {
          res = await fetch(`${this.rootURL}/common/departments/delete/${id}`, {
            method: "GET",
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
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
        alert(`Department "${name}" deleted successfully!`);
        await this.render();
      } catch (e) {
        console.error("Error deleting department:", e);
        alert(`Failed to delete department: ${e.message}`);
      }
    }
  }

  window.CommonDepartmentListFeature = CommonDepartmentListFeature;
}