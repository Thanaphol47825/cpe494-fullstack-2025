if (!window.CommonStudentListFeature) {
  class CommonStudentListFeature {
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
              <h2 class="text-3xl font-bold text-gray-800">Student List</h2>
              <div class="flex items-center gap-3">
                <a href="#common" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">← Back</a>
                <a href="#common/student/create" class="button">+ Add Student</a>
              </div>
            </div>
            <div id="studentTable" class="bg-white rounded-xl shadow p-4 overflow-x-auto">
              <p class="text-gray-500">Loading students...</p>
            </div>
          </div>
        </div>
      `;

      try {
        const response = await fetch(`${this.rootURL}/common/students/getall`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Check current user role
        const currentRole = localStorage.getItem('userRole') || localStorage.getItem('role');
        const isAdmin = currentRole === 'Admin';
        const isInstructor = currentRole === 'Instructor';

        // Build action buttons based on role
        const customColumns = [];

        // Show actions column for Admin and Instructor
        if (isAdmin || isInstructor) {
          let actionButtons = `
            <div class="flex space-x-2">
              <button onclick="commonStudentList.viewStudent('{ID}')"
                      class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                View
              </button>`;

          // Only Admin can edit and delete
          if (isAdmin) {
            actionButtons += `
              <button onclick="commonStudentList.editStudent('{ID}')"
                      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Edit
              </button>
              <button onclick="commonStudentList.deleteStudent('{ID}', '{first_name} {last_name}')"
                      class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                Delete
              </button>`;
          }

          actionButtons += `</div>`;

          customColumns.push({
            name: "actions",
            label: "Actions",
            template: actionButtons
          });
        }

        const table = new AdvanceTableRender(this.templateEngine, {
          modelPath: "common/student",
          dataPath: "common/students/getall",
          data: data.result || [],
          targetSelector: "#studentTable",
          customColumns: customColumns,
        });

        await table.render();
        window.commonStudentList = this;
      } catch (err) {
        console.error("❌ Error rendering table:", err);
        const tableEl = document.getElementById("studentTable");
        if (tableEl)
          tableEl.innerHTML = `<p class="text-red-600">Error loading student data.</p>`;
      }

      return true;
    }

    editStudent(id) {
      location.hash = `#common/student/edit/${encodeURIComponent(id)}`;
    }

    async viewStudent(id) {
      try {
        // Load CommonViewDetailModal if not already loaded
        if (!window.CommonViewDetailModal) {
          const script = document.createElement('script');
          script.src = `${this.rootURL}/common/static/js/CommonViewDetailModal.js`;
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);
        }

        // Fetch student data
        const res = await fetch(`${this.rootURL}/common/students/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { result } = await res.json();

        // Create and show modal
        const modalId = `student-view-${id}`;
        await window.CommonViewDetailModal.createModal({
          modalType: 'Student',
          modalId: modalId,
          data: result
        });
      } catch (e) {
        console.error(e);
        alert("Failed to load student details.");
      }
    }

    async deleteStudent(id, fullName = `ID ${id}`) {
      if (
        !confirm(
          `Are you sure you want to delete student "${fullName}" (${id})?\n\nThis action cannot be undone.`
        )
      ) {
        return;
      }
      try {
        let res = await fetch(`${this.rootURL}/common/students/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (res.status === 405 || res.status === 404) {
          res = await fetch(`${this.rootURL}/common/students/delete/${id}`, {
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
        alert(`Student "${fullName}" deleted successfully!`);
        await this.render();
      } catch (e) {
        console.error("Error deleting student:", e);
        alert(`Failed to delete student: ${e.message}`);
      }
    }
  }

  window.CommonStudentListFeature = CommonStudentListFeature;
}
