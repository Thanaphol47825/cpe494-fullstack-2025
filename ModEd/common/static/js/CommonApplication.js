class CommonApplication {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.rootURL = window.__ROOT_URL__ || RootURL || "";

    // Register Common module features (id => metadata)
    this.features = {
      "student/create": {
        title: "Add Student",
        load: async () => {
          if (!window.CommonStudentFormFeature) {
            await this.templateEngine.fetchModule(
              "/common/static/js/features/StudentForm.js"
            );
          }
          return () =>
            new window.CommonStudentFormFeature(
              this.templateEngine,
              this.rootURL
            );
        },
      },
      "instructor/create": {
        title: "Add Instructor",
        load: async () => {
          if (!window.CommonInstructorFormFeature) {
            await this.templateEngine.fetchModule(
              "/common/static/js/features/InstructorForm.js"
            );
          }
          return () =>
            new window.CommonInstructorFormFeature(
              this.templateEngine,
              this.rootURL
            );
        },
      },
      "department/create": {
        title: "Add Department",
        load: async () => {
          if (!window.CommonDepartmentFormFeature) {
            await this.templateEngine.fetchModule(
              "/common/static/js/features/DepartmentForm.js"
            );
          }
          return () =>
            new window.CommonDepartmentFormFeature(
              this.templateEngine,
              this.rootURL
            );
        },
      },
      "faculty/create": {
        title: "Add Faculty",
        load: async () => {
          if (!window.CommonFacultyFormFeature) {
            await this.templateEngine.fetchModule(
              "/common/static/js/features/FacultyForm.js"
            );
          }
          return () =>
            new window.CommonFacultyFormFeature(
              this.templateEngine,
              this.rootURL
            );
        },
      },
      "department/list": {
        title: "List Departments",
        load: async () => {
          if (!window.CommonDepartmentListFeature) {
            await this.templateEngine.fetchModule(
              "/common/static/js/features/DepartmentList.js"
            );
          }
          return () =>
            new window.CommonDepartmentListFeature(
              this.templateEngine,
              this.rootURL
            );
        },
      },
    };

    console.log("CommonApplication initialized with TemplateEngine support");
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    return await this.#route();
  }

  async #route() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const route = raw.startsWith("common/") ? raw.slice("common/".length) : raw;

    if (route && this.features[route]) {
      return await this.navigateTo(route);
    }

    this.renderMenu();
    return true;
  }

  renderMenu() {
    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const html = `
    <div class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-12 px-6">
      <div class="max-w-5xl mx-auto text-center mb-12">
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          Common Module
        </h1>
        <p class="text-slate-600 text-lg">Manage Faculty, Department, Instructor, and Student information.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        ${Object.entries(this.features)
        .map(
          ([id, feature]) => `
              <div
                class="group relative bg-white border border-slate-200 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                data-common-action="${id}"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div class="relative p-6 text-center">
                  <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg mb-4">
                    ${this.getIconForFeature(id)}
                  </div>
                  <h3 class="text-lg font-bold text-slate-800">${feature.title}</h3>
                  <p class="text-sm text-slate-500 mt-1">Click to open</p>
                </div>
              </div>
            `
        )
        .join("")}
      </div>
    </div>
  `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);

    // 🔹 เพิ่ม event listener ให้การ์ดทั้งหมด
    container.querySelectorAll("[data-common-action]").forEach((card) => {
      card.addEventListener("click", async (event) => {
        const id = event.currentTarget.getAttribute("data-common-action");
        location.hash = `#common/${id}`;
        await this.navigateTo(id);
      });
    });
  }

  // ฟังก์ชัน helper สำหรับ icon (เพิ่มไว้ใน class)
  getIconForFeature(id) {
    switch (id) {
      case "student/create":
        return '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7m0-7l9-5m-9 5L3 9m9 5l-9 5" /></svg>';
      case "instructor/create":
        return '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-5 4v6" /></svg>';
      case "department/create":
        return '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" /></svg>';
      case "faculty/create":
        return '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" /></svg>';
    }
  }

  async navigateTo(id) {
    const featureMeta = this.features[id];
    if (!featureMeta) {
      console.error(`Unknown Common feature: ${id}`);
      return false;
    }

    try {
      const getInstance = await featureMeta.load();
      const feature = getInstance();
      return await feature.render();
    } catch (err) {
      console.error(`Failed to load/render Common feature '${id}'`, err);
      return false;
    }
  }
}

if (typeof window !== "undefined") {
  window.CommonApplication = CommonApplication;
}


