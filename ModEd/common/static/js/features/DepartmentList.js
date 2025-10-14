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
              <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
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
                  <button onclick="editDepartment({id})"
                          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Edit
                  </button>
                  <button onclick="viewDepartment({id})"
                          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    View
                  </button>
                  <button onclick="deleteDepartment({id})"
                          class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                    Delete
                  </button>
                </div>
              `
            }
          ]
        });

        await table.render();
      } catch (err) {
        console.error("❌ Error rendering table:", err);
        const tableEl = document.getElementById("departmentTable");
        if (tableEl)
          tableEl.innerHTML = `<p class="text-red-600">Error loading department data.</p>`;
      }

      return true;
    }
  }

  window.CommonDepartmentListFeature = CommonDepartmentListFeature;
}


async function editDepartment(id) {
  location.hash = `#common/department/edit/${encodeURIComponent(id)}`;
}

async function viewDepartment(id) {
  alert(`👁 View department ID: ${id}`);

}

async function deleteDepartment(id) {
  if (confirm(`⚠️ Delete department ID ${id}?`)) {
    await fetch(`/common/departments/delete/${id}`, { method: "DELETE" });
    alert("✅ Department deleted!");

  }
}
