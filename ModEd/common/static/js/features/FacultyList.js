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
              <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
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

                const table = new AdvanceTableRender(this.templateEngine, {
                    modelPath: "common/faculty", // โหลด schema: /api/modelmeta/common/Faculty
                    dataPath: "common/faculties/getall",
                    data: data.result || [],// โหลดข้อมูลจริง
                    targetSelector: "#facultyTable",


                    customColumns: [
                        {
                            name: "actions",
                            label: "Actions",
                            template: `
                <div class="flex space-x-2">
                  <button onclick="editFaculty({ID})"
                          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Edit
                  </button>
                  <button onclick="viewFaculty({ID})"
                          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    View
                  </button>
                  <button onclick="deleteFaculty({ID})"
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
                const tableEl = document.getElementById("facultyTable");
                if (tableEl)
                    tableEl.innerHTML = `<p class="text-red-600">Error loading faculty data.</p>`;
            }

            return true;
        }
    }

    window.CommonFacultyListFeature = CommonFacultyListFeature;
}


async function editFaculty(id) {
    alert(`✏️ Edit faculty ID: ${id}`);

}

async function viewFaculty(id) {
    alert(`👁 View faculty ID: ${id}`);

}

async function deleteFaculty(id) {
   
}
