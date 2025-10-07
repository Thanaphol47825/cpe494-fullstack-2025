if (typeof window.InterviewCriteriaList === 'undefined') {
class InterviewCriteriaList {
    constructor(application) {
        this.application = application;
        this.RootURL = window.__ROOT_URL__ || "";
    }

    async render() {
        console.log("InterviewCriteriaList: render()");

        if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
            const script = document.createElement("script");
            script.src = "https://cdn.tailwindcss.com";
            document.head.appendChild(script);
        }

        this.application.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-6xl mx-auto bg-white shadow rounded-2xl p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📋 Interview Criteria Management
            </h1>
            <div class="flex flex-wrap gap-2">
              <button id="btnSeed"
                class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200">🌱 Seed Data</button>
              <button id="btnRefresh"
                class="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">🔄 Refresh</button>
              <button id="btnCreate"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">＋ Create New</button>
            </div>
          </div>

          <div id="tableContainer" class="overflow-x-auto border rounded-lg"></div>
        </div>
      </div>
    `;

        await this.loadList();

        document.getElementById("btnCreate")?.addEventListener("click", () => this.openForm());
        document.getElementById("btnSeed")?.addEventListener("click", () => this.seedData());
        document.getElementById("btnRefresh")?.addEventListener("click", () => this.loadList());
    }

    async loadList() {
        const tableContainer = document.getElementById("tableContainer");
        tableContainer.innerHTML = `<p class="text-gray-500 p-4">Loading interview criteria...</p>`;

        try {
            const res = await fetch(this.RootURL + "/recruit/GetAllInterviewCriteria");
            const data = await res.json();
            if (!data.isSuccess) throw new Error(data.result || "Load failed");

            if (!data.result || data.result.length === 0) {
                tableContainer.innerHTML = `
          <div class="p-8 text-center text-gray-500">
            <p class="text-lg font-medium">No interview criteria found</p>
            <p class="text-sm text-gray-400 mt-1">Create a new criteria to get started.</p>
          </div>
        `;
                return;
            }

            console.log("Loaded interview criteria:", data.result);

            const rows = data.result.map((r) => `
        <tr class="border-b hover:bg-gray-50 transition">
          <td class="px-4 py-2 font-medium">${r.ID}</td>
          <td class="px-4 py-2">${r.application_rounds_id || "-"}</td>
          <td class="px-4 py-2">${r.ApplicationRound?.round_name || "Round " + r.application_rounds_id}</td>
          <td class="px-4 py-2">${r.faculty_id || "-"}</td>
          <td class="px-4 py-2">${r.department_id || "-"}</td>
          <td class="px-4 py-2 font-medium ${r.passing_score >= 70 ? 'text-green-600' : r.passing_score >= 50 ? 'text-yellow-600' : 'text-red-600'}">${r.passing_score}</td>
          <td class="px-4 py-2 text-right">
            <button class="text-blue-600 hover:underline text-sm" data-id="${r.ID}" data-action="view">View</button>
            <button class="text-green-600 hover:underline ml-3 text-sm" data-id="${r.ID}" data-action="edit">Edit</button>
            <button class="text-red-600 hover:underline ml-3 text-sm" data-id="${r.ID}" data-action="delete">Delete</button>
          </td>
        </tr>`
            );

            tableContainer.innerHTML = `
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-gray-100 text-gray-800">
            <tr>
              <th class="px-4 py-3 text-left font-medium">ID</th>
              <th class="px-4 py-3 text-left font-medium">Round ID</th>
              <th class="px-4 py-3 text-left font-medium">Round Name</th>
              <th class="px-4 py-3 text-left font-medium">Faculty ID</th>
              <th class="px-4 py-3 text-left font-medium">Department ID</th>
              <th class="px-4 py-3 text-left font-medium">Passing Score</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      `;

            tableContainer.querySelectorAll("button[data-action]").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    const action = e.target.getAttribute("data-action");
                    console.log(`Action: ${action}, ID: ${id}`);
                    if (action === "view") this.viewItem(id);
                    else if (action === "edit") this.openForm(id);
                    else if (action === "delete") this.deleteItem(id);
                });
            });
        } catch (err) {
            console.error("Load list error:", err);
            tableContainer.innerHTML = `
        <div class="p-4 text-red-600 bg-red-50 border border-red-200 rounded">
          <p class="font-medium">Error loading interview criteria</p>
          <p class="text-sm mt-1">${err.message}</p>
        </div>
      `;
        }
    }

    async viewItem(id) {
        try {
            console.log("Viewing item with ID:", id);
            const res = await fetch(this.RootURL + "/recruit/GetInterviewCriteriaByID/" + id);
            const data = await res.json();
            if (!data.isSuccess) throw new Error(data.result || "Failed to load item");

            const item = data.result;
            const details = `
ID: ${item.ID}
Application Round: ${item.ApplicationRound?.round_name || item.application_rounds_id}
Faculty: ${item.Faculty?.name || "Faculty " + item.faculty_id}
Department: ${item.Department?.name || "Dept " + item.department_id}
Passing Score: ${item.passing_score}
Created: ${new Date(item.CreatedAt).toLocaleString()}
Updated: ${new Date(item.UpdatedAt).toLocaleString()}
      `;
            alert("Interview Criteria Details:\n\n" + details);
        } catch (err) {
            console.error("viewItem error:", err);
            alert("Error viewing item: " + err.message);
        }
    }

    async openForm(id = null) {
        try {
            await this.application.fetchModule("/recruit/static/js/InterviewCriteriaCreate.js");
            const form = new InterviewCriteriaCreate(this.application);
            this.application.mainContainer.innerHTML = "";
            await form.render();

            // If editing, populate form with existing data
            if (id) {
                console.log("Editing item with ID:", id);
                const res = await fetch(this.RootURL + "/recruit/GetInterviewCriteriaByID/" + id);
                const data = await res.json();
                if (data.isSuccess && data.result) {
                    const item = data.result;
                    // Populate form fields
                    setTimeout(() => {
                        const formElement = document.getElementById("createCriteriaForm");
                        if (formElement) {
                            const applicationRoundsInput = formElement.querySelector('input[name="application_rounds_id"]');
                            const facultyInput = formElement.querySelector('input[name="faculty_id"]');
                            const departmentInput = formElement.querySelector('input[name="department_id"]');
                            const passingScoreInput = formElement.querySelector('input[name="passing_score"]');

                            if (applicationRoundsInput) applicationRoundsInput.value = item.application_rounds_id || "";
                            if (facultyInput) facultyInput.value = item.faculty_id || "";
                            if (departmentInput) departmentInput.value = item.department_id || "";
                            if (passingScoreInput) passingScoreInput.value = item.passing_score || "";

                            // Change form action for update
                            formElement.setAttribute('data-mode', 'edit');
                            formElement.setAttribute('data-id', id);

                            // Update button text
                            const submitBtn = document.getElementById("submitCreateCriteria");
                            if (submitBtn) submitBtn.textContent = "Update Criteria";

                            // Update title
                            const title = document.querySelector("h1");
                            if (title) title.textContent = "Edit Interview Criteria";
                        }
                    }, 100);
                }
            }
        } catch (err) {
            console.error("openForm error:", err);
            alert("Error opening form: " + err.message);
        }
    }

    async deleteItem(id) {
        if (!confirm("Are you sure you want to delete this interview criteria?")) return;

        try {
            console.log("Deleting item with ID:", id);
            const res = await fetch(this.RootURL + "/recruit/DeleteInterviewCriteria/" + id, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const result = await res.json();

            if (result.isSuccess) {
                alert("Interview criteria deleted successfully");
                await this.loadList();
            } else {
                throw new Error(result.result || "Delete failed");
            }
        } catch (err) {
            console.error("deleteItem error:", err);
            alert("Delete failed: " + err.message);
        }
    }

    async seedData() {
        if (!confirm("This will create sample data for application rounds, faculties, and departments. Continue?")) return;

        try {
            const res = await fetch(this.RootURL + "/recruit/CreateRawSQL", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const result = await res.json();

            if (result.isSuccess) {
                alert("Sample data created successfully!\n\n" + result.result);
                await this.loadList();
            } else {
                throw new Error(result.result || "Seed operation failed");
            }
        } catch (err) {
            console.error("seedData error:", err);
            alert("Seed data failed: " + err.message);
        }
    }
}

window.InterviewCriteriaList = InterviewCriteriaList;

if (typeof window !== "undefined") window.InterviewCriteriaList = InterviewCriteriaList;

}