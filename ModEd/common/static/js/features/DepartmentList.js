if (!window.CommonDepartmentListFeature) {
    class CommonDepartmentListFeature {
        constructor(templateEngine, rootURL) {
            this.templateEngine = templateEngine;
            this.rootURL = rootURL || "";
        }

        async render() {
            if (!this.templateEngine || !this.templateEngine.mainContainer) {
                console.error("❌ Template engine or main container not found");
                return false;
            }

            const container = this.templateEngine.mainContainer;
            if (!container) return false;

            container.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-10 px-6">
          <div class="max-w-5xl mx-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800">Department List</h2>
              <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
            </div>
            <div id="departmentList" class="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <p class="text-gray-500">Loading departments...</p>
            </div>
          </div>
        </div>
      `;

            const listEl = document.getElementById("departmentList");

            try {
                const res = await fetch(`${this.rootURL}/common/departments/getall`);
                const data = await res.json();

                if (data.length > 0) {
                    // สร้างตาราง
                    const tableHTML = `
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">#</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Department Name</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Budget</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${data.map((d, i) => `
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-600">${i + 1}</td>
                    <td class="px-6 py-4 text-sm text-gray-800">${d.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${d.budget || "-"}</td>

                  </tr>
                `).join("")}
              </tbody>
            </table>
          `;
                    listEl.innerHTML = tableHTML;
                } else {
                    listEl.innerHTML = `<p class="text-gray-500">No departments found.</p>`;
                }
            } catch (err) {
                console.error(err);
                listEl.innerHTML = `<p class="text-red-600">Error loading departments.</p>`;
            }

            return true;
        }
    }

    window.CommonDepartmentListFeature = CommonDepartmentListFeature;
}
