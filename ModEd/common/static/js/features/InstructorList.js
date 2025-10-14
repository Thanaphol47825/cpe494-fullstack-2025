if (!window.CommonInstructorListFeature) {
    class CommonInstructorListFeature {
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
              <h2 class="text-3xl font-bold text-gray-800">Instructor List</h2>
              <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
            </div>
            <div id="instructorTable" class="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <p class="text-gray-500">Loading instructors...</p>
            </div>
          </div>
        </div>
      `;


            try {
                const response = await fetch(`${this.rootURL}/common/instructors/getall`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                const table = new AdvanceTableRender(this.templateEngine, {
                    modelPath: "common/instructor", // โหลด schema: /api/modelmeta/common/Instructor
                    dataPath: "common/instructors/getall",
                    data: data || [],// โหลดข้อมูลจริง
                    targetSelector: "#instructorTable",


                    customColumns: [
                        {
                            name: "actions",
                            label: "Actions",
                            template: `
                <div class="flex space-x-2">
                  <button onclick="editInstructor({id})"
                          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Edit
                  </button>
                  <button onclick="viewInstructor({id})"
                          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    View
                  </button>
                  <button onclick="deleteInstructor({id})"
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
                const tableEl = document.getElementById("instructorTable");
                if (tableEl)
                    tableEl.innerHTML = `<p class="text-red-600">Error loading instructor data.</p>`;
            }

            return true;
        }
    }

    window.CommonInstructorListFeature = CommonInstructorListFeature;
}


async function editInstructor(id) {
    location.hash = `#common/instructor/edit/${encodeURIComponent(id)}`;
}

async function viewInstructor(id) {
    alert(`👁 View instructor ID: ${id}`);

}

async function deleteInstructor(id) {
   
}
