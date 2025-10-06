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
      <section class="menu-container">
        <h1 class="menu-title">Common Module</h1>
        <p>Manage Faculty, Department, Instructor, and Student information.</p>

        <div class="module-list">
          ${Object.entries(this.features)
            .map(
              ([id, feature]) => `
                <a href="#common/${id}" class="module-button" data-common-action="${id}">
                  ${this.getIconForFeature(id)} ${feature.title}
                </a>
              `
            )
            .join("")}
        </div>
      </section>
    `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);

    // bind clicks (SPA-friendly)
    container.querySelectorAll("[data-common-action]").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = el.getAttribute("data-common-action");
        location.hash = `#common/${id}`;
        await this.navigateTo(id);
      });
    });
  }

  getIconForFeature(id) {
    switch (id) {
      case "student/create":
        return "👩‍🎓";
      case "instructor/create":
        return "👨‍🏫";
      case "department/create":
        return "📚";
      case "faculty/create":
        return "🏫";
      case "department/list":
        return "🗂️";
      default:
        return "•";
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