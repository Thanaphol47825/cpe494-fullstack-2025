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
      <div class="max-w-xl space-y-4">
        <h2 class="text-2xl font-bold">Common Module</h2>
        <p class="text-sm text-gray-600">Choose a task to continue.</p>
        <ul class="space-y-2">
          ${Object.entries(this.features)
            .map(
              ([id, feature]) => `
                <li>
                  <button data-common-action="${id}" class="text-blue-700 underline hover:text-blue-900">
                    ${feature.title}
                  </button>
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);

    container.querySelectorAll("[data-common-action]").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const id = event.currentTarget.getAttribute("data-common-action");
        location.hash = `#common/${id}`;
        await this.navigateTo(id);
      });
    });
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
