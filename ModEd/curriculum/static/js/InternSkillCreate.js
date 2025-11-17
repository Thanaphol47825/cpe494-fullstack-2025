// curriculum/static/js/InternSkillCreate.js
if (typeof window !== "undefined" && !window.InternSkillCreate) {
  class InternSkillCreate {
    constructor(application) {
      this.application = application;

      this.rootURL =
        (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || "";

      this.endpoints = {
        list: this.rootURL + "/curriculum/InternSkill",
        create: this.rootURL + "/curriculum/CreateInternSkill",
        update: (id) => this.rootURL + "/curriculum/UpdateInternSkill/" + id,
        remove: (id) => this.rootURL + "/curriculum/DeleteInternSkill/" + id,
      };

      // >>> ใช้ internskill_role ก่อน ถ้าไม่มีค่อยไปอ่าน role เดิม
      const rawRole =
        localStorage.getItem("internskill_role") ||
        localStorage.getItem("role") ||
        "student";

      this.userRole = String(rawRole).toLowerCase();
      console.log("[InternSkillCreate] userRole =", this.userRole);

      this.mainContainer = null;
    }


    // ===== helper หา mainContainer ตอน render =====
    getMainContainer() {
      if (
        this.application.templateEngine &&
        this.application.templateEngine.mainContainer
      ) {
        return this.application.templateEngine.mainContainer;
      }
      // กันเผื่อ
      return document.getElementById("main-container") || document.body;
    }

    // ====== สิทธิพื้นฐาน ======
    isAdmin() {
      return this.userRole === "admin";
    }

    canRead() {
      return true; // ทุก role อ่านได้
    }

    canWrite() {
      return this.isAdmin(); // CRUD เฉพาะ admin
    }

    // ====== โหลด template กลาง ======
    async loadInternshipPageTemplate() {
      if (!window.InternshipPageTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipPageTemplate.js`;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = () => {
            if (window.InternshipPageTemplate) {
              resolve();
            } else {
              reject(new Error("InternshipPageTemplate failed to load"));
            }
          };
          script.onerror = () =>
            reject(new Error("Failed to load InternshipPageTemplate script"));
        });
      }
    }

    // ====== page config (header / layout) ======
    getPageConfig() {
      return {
        title: "Intern Skills",
        description: "List of all skills used in the internship system.",
        showBackButton: false,
        pageClass: "intern-skill-page",
        headerClass: "internship-header",
        contentClass: "internship-content",
      };
    }

    // ====== สร้างเนื้อหาในหน้า (form + table) ======
    async createPageContent() {
      const createSection = this.canWrite()
        ? `
        <div class="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-800 mb-3">
            Add New Skill
          </h3>
          <form id="intern-skill-create-form" class="flex flex-col sm:flex-row gap-3">
            <input
              id="skill_name"
              name="skill_name"
              type="text"
              required
              placeholder="Enter Skill Name"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              class="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Skill
            </button>
          </form>
        </div>
      `
        : "";

      const tableSection = `
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 text-sm" id="intern-skill-table">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-700">ID</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Skill Name</th>
                ${
                  this.canWrite()
                    ? `<th class="px-4 py-2 text-right font-medium text-gray-700 w-40">Actions</th>`
                    : ""
                }
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" id="intern-skill-tbody">
            </tbody>
          </table>
        </div>
      `;

      // debug: โชว์ role บนหน้า (จะเอาออกก็ได้)
      const roleBadge = `
        <div class="mb-2 text-xs text-gray-500">
          Current role: <span class="font-mono">${this.userRole}</span>
        </div>
      `;

      return `
        <div class="space-y-4">
          ${roleBadge}
          ${createSection}
          ${tableSection}
        </div>
      `;
    }

    // ====== โหลดข้อมูลแล้วใส่ในตาราง ======
    async renderTable() {
      const tbody = document.getElementById("intern-skill-tbody");
      if (!tbody) return;

      tbody.innerHTML = `
        <tr>
          <td colspan="${this.canWrite() ? 3 : 2}" class="px-4 py-4 text-center text-gray-500">
            Loading...
          </td>
        </tr>
      `;

      try {
        const res = await fetch(this.endpoints.list);
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to load skills");
        }

        const skills = data.result || [];
        if (!skills.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="${this.canWrite() ? 3 : 2}" class="px-4 py-4 text-center text-gray-500">
                No skills found.
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = "";
        skills.forEach((skill) => {
          // บาง handler อาจส่ง skill_id แทน id
           const idValue = skill.ID; 

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="px-4 py-2 text-gray-700">${skill.skill_id}</td>
            <td class="px-4 py-2 text-gray-900">${skill.skill_name}</td>
            ${
              this.canWrite()
                ? `
            <td class="px-4 py-2 text-right space-x-2">
              <button
                data-action="edit"
                data-id="${idValue}"
                data-name="${skill.skill_name}"
                class="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                data-action="delete"
                data-id="${idValue}"
                class="inline-flex items-center px-3 py-1 rounded-md border border-red-300 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </td>
            `
                : ""
            }
          `;
          tbody.appendChild(tr);
        });

        if (this.canWrite()) {
          tbody.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;

            const id = btn.getAttribute("data-id");
            const action = btn.getAttribute("data-action");

            if (action === "edit") {
              const currentName = btn.getAttribute("data-name") || "";
              this.handleEdit(id, currentName);
            } else if (action === "delete") {
              this.handleDelete(id);
            }
          });
        }
      } catch (err) {
        console.error("Error loading skills:", err);
        tbody.innerHTML = `
          <tr>
            <td colspan="${this.canWrite() ? 3 : 2}" class="px-4 py-4 text-center text-red-600">
              ${err.message || "Error loading skills"}
            </td>
          </tr>
        `;
      }
    }

    // ====== event listener ต่าง ๆ ======
    setupEventListeners() {
      if (this.canWrite()) {
        const createForm = document.getElementById("intern-skill-create-form");
        if (createForm) {
          createForm.addEventListener("submit", this.handleCreate.bind(this));
        }
      }
    }

    // ====== สร้าง skill ใหม่ ======
    async handleCreate(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch(this.endpoints.create, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to create skill");
        }

        form.reset();
        await this.renderTable();
      } catch (err) {
        console.error("Error creating skill:", err);
        alert(err.message || "Error creating skill");
      }
    }

    // ====== edit ชื่อ skill ======
    async handleEdit(id, currentName) {
      const newName = window.prompt("Edit skill name:", currentName);
      if (newName === null || newName.trim() === "") return;

      const payload = { skill_name: newName.trim() };

      try {
        const res = await fetch(this.endpoints.update(id), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to update skill");
        }

        await this.renderTable();
      } catch (err) {
        console.error("Error updating skill:", err);
        alert(err.message || "Error updating skill");
      }
    }

    // ====== ลบ skill ======
    async handleDelete(id) {
      if (!window.confirm("Are you sure you want to delete this skill?")) return;

      try {
        const res = await fetch(this.endpoints.remove(id), {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.error || "Failed to delete skill");
        }

        await this.renderTable();
      } catch (err) {
        console.error("Error deleting skill:", err);
        alert(err.message || "Error deleting skill");
      }
    }

    // ====== render หลัก ======
    async render() {
      if (!this.canRead()) {
        alert("Access denied.");
        return;
      }

      console.log("Rendering Intern Skill");

      try {
        await this.loadInternshipPageTemplate();

        // ตอนนี้ mainContainer พร้อมแล้ว ค่อยเก็บ
        this.mainContainer = this.getMainContainer();

        if (!this.mainContainer) {
          throw new Error("Main container not found");
        }

        this.mainContainer.innerHTML = "";

        const pageConfig = this.getPageConfig();
        const content = await this.createPageContent();

        const pageElement = await window.InternshipPageTemplate.render(
          pageConfig,
          content,
          this.application.templateEngine || this.application
        );

        this.mainContainer.appendChild(pageElement);

        this.setupEventListeners();
        await this.renderTable();
      } catch (err) {
        console.error("Error rendering InternSkillCreate (list page):", err);
        const target =
          this.mainContainer || this.getMainContainer() || document.body;
        if (window.InternshipPageTemplate) {
          window.InternshipPageTemplate.showError(
            err.message || "Failed to load page",
            target
          );
        } else {
          target.innerHTML =
            "<p class='text-red-600'>Failed to load page.</p>";
        }
      }
    }
  }

  window.InternSkillCreate = InternSkillCreate;
}
