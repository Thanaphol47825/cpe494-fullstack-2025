class CommonApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine);
    this.rootURL = window.__ROOT_URL__ || RootURL || "";

    this.setSubModuleBasePath("/common/static/js/features");

    this.features = {
      "student/create": {
        title: "Add Student",
        icon: "👩‍🎓",
      },
      "student/list": {
        title: "List Students",
        icon: "📋",
      },
      "instructor/create": {
        title: "Add Instructor",
        icon: "👨‍🏫",
      },
      "instructor/list": {
        title: "List Instructors",
        icon: "📋",
      },
      "department/create": {
        title: "Add Department",
        icon: "📚",
      },
      "department/list": {
        title: "List Departments",
        icon: "🗂️",
      },
      "faculty/create": {
        title: "Add Faculty",
        icon: "🏫",
      },
      "faculty/list": {
        title: "List Faculty",
        icon: "📋",
      },
    };

    this.setupRoutes();

    console.log("CommonApplication initialized with TemplateEngine support");
  }

  setupRoutes() {
    this.addRoute("", this.renderMenu.bind(this));

    this.addRouteWithSubModule(
      "/login",
      this.renderLogin.bind(this),
      "LoginForm.js"
    );
    this.addRouteWithSubModule(
      "/student/create",
      this.renderStudentCreate.bind(this),
      "StudentForm.js"
    );
    this.addRouteWithSubModule(
      "/student/list",
      this.renderStudentList.bind(this),
      "StudentList.js"
    );
    this.addRouteWithSubModule(
      "/student/edit/:id",
      this.renderStudentEdit.bind(this),
      "StudentEdit.js"
    );
    this.addRouteWithSubModule(
      "/instructor/create",
      this.renderInstructorCreate.bind(this),
      "InstructorForm.js"
    );
    this.addRouteWithSubModule(
      "/instructor/edit/:id",
      this.renderInstructorEdit.bind(this),
      "InstructorEdit.js"
    );
    this.addRouteWithSubModule(
      "/department/create",
      this.renderDepartmentCreate.bind(this),
      "DepartmentForm.js"
    );
    this.addRouteWithSubModule(
      "/department/edit/:id",
      this.renderDepartmentEdit.bind(this),
      "DepartmentEdit.js"
    );
    this.addRouteWithSubModule(
      "/faculty/create",
      this.renderFacultyCreate.bind(this),
      "FacultyForm.js"
    );
    this.addRouteWithSubModule(
      "/faculty/edit/:id",
      this.renderFacultyEdit.bind(this),
      "FacultyEdit.js"
    );
    this.addRouteWithSubModule(
      "/department/list",
      this.renderDepartmentList.bind(this),
      "DepartmentList.js"
    );
    this.addRouteWithSubModule(
      "/faculty/list",
      this.renderFacultyList.bind(this),
      "FacultyList.js"
    );
    this.addRouteWithSubModule(
      "/instructor/list",
      this.renderInstructorList.bind(this),
      "InstructorList.js"
    );

    this.setDefaultRoute("");
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }
    return await this.handleRoute(this.templateEngine.getCurrentPath());
  }

  renderMenu() {
    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const html = `
      <section class="menu-container">
        <div class="form-container">
          <h1 class="menu-title">Common Module</h1>
          <a href='#' class="btn-home">🏠 Back to ModEd</a>
          <p>Manage Faculty, Department, Instructor, and Student information.</p>

          <div class="module-list">
            ${Object.entries(this.features)
        .map(
          ([id, feature]) => `
                  <a href="#common/${id}" class="module-button" routerLink="common/${id}">
                    ${feature.icon} ${feature.title}
                  </a>
                `
        )
        .join("")}
          </div>
        </div>
      </section>
    `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);
  }

  getIconForFeature(id) {
    return this.features[id]?.icon || "•";
  }

  async renderLogin() {
    if (!window.CommonLoginFormFeature) {
      console.error("CommonLoginFormFeature not available after loading");
      this.renderError("Failed to load Login Form");
      return false;
    }
    const feature = new window.CommonLoginFormFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderStudentCreate() {
    if (!window.CommonStudentFormFeature) {
      console.error("CommonStudentFormFeature not available after loading");
      this.renderError("Failed to load Student Form");
      return false;
    }
    const feature = new window.CommonStudentFormFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderStudentList() {
    if (!window.CommonStudentListFeature) {
      console.error("CommonStudentListFeature not available after loading");
      this.renderError("Failed to load Student List");
      return false;
    }
    const feature = new window.CommonStudentListFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderStudentEdit(params) {
    if (!window.CommonStudentEditFeature) {
      console.error("CommonStudentEditFeature not available after loading");
      this.renderError("Failed to load Student Edit Form");
      return false;
    }
    const studentId = params?.id;
    if (!studentId) {
      console.error("No student ID provided");
      this.renderError("Invalid student ID");
      return false;
    }
    const feature = new window.CommonStudentEditFeature(
      this.templateEngine,
      this.rootURL,
      studentId
    );
    return await feature.render();
  }

   async renderInstructorList() {
    if (!window.CommonInstructorListFeature) {
      console.error("CommonInstructorListFeature not available after loading");
      this.renderError("Failed to load Instructor List");
      return false;
    }
    const feature = new window.CommonInstructorListFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

   async renderFacultyList() {
    if (!window.CommonFacultyListFeature) {
      console.error("CommonFacultyListFeature not available after loading");
      this.renderError("Failed to load Faculty List");
      return false;
    }
    const feature = new window.CommonFacultyListFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderInstructorCreate() {
    if (!window.CommonInstructorFormFeature) {
      console.error("CommonInstructorFormFeature not available after loading");
      this.renderError("Failed to load Instructor Form");
      return false;
    }
    const feature = new window.CommonInstructorFormFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderInstructorEdit(params) {
    if (!window.CommonInstructorEditFeature) {
      console.error("CommonInstructorEditFeature not available after loading");
      this.renderError("Failed to load Instructor Edit Form");
      return false;
    }
    const instructorId = params?.id;
    if (!instructorId) {
      console.error("No instructor ID provided");
      this.renderError("Invalid instructor ID");
      return false;
    }
    const feature = new window.CommonInstructorEditFeature(
      this.templateEngine,
      this.rootURL,
      instructorId
    );
    return await feature.render();
  }

  async renderDepartmentCreate() {
    if (!window.CommonDepartmentFormFeature) {
      console.error("CommonDepartmentFormFeature not available after loading");
      this.renderError("Failed to load Department Form");
      return false;
    }
    const feature = new window.CommonDepartmentFormFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderDepartmentEdit(params) {
    if (!window.CommonDepartmentEditFeature) {
      console.error("CommonDepartmentEditFeature not available after loading");
      this.renderError("Failed to load Department Edit Form");
      return false;
    }
    const departmentId = params?.id;
    if (!departmentId) {
      console.error("No department ID provided");
      this.renderError("Invalid department ID");
      return false;
    }
    const feature = new window.CommonDepartmentEditFeature(
      this.templateEngine,
      this.rootURL,
      departmentId
    );
    return await feature.render();
  }

  async renderFacultyCreate() {
    if (!window.CommonFacultyFormFeature) {
      console.error("CommonFacultyFormFeature not available after loading");
      this.renderError("Failed to load Faculty Form");
      return false;
    }
    const feature = new window.CommonFacultyFormFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  async renderFacultyEdit(params) {
    if (!window.CommonFacultyEditFeature) {
      console.error("CommonFacultyEditFeature not available after loading");
      this.renderError("Failed to load Faculty Edit Form");
      return false;
    }
    const facultyId = params?.id;
    if (!facultyId) {
      console.error("No faculty ID provided");
      this.renderError("Invalid faculty ID");
      return false;
    }
    const feature = new window.CommonFacultyEditFeature(
      this.templateEngine,
      this.rootURL,
      facultyId
    );
    return await feature.render();
  }

  async renderDepartmentList() {
    if (!window.CommonDepartmentListFeature) {
      console.error("CommonDepartmentListFeature not available after loading");
      this.renderError("Failed to load Department List");
      return false;
    }
    const feature = new window.CommonDepartmentListFeature(
      this.templateEngine,
      this.rootURL
    );
    return await feature.render();
  }

  renderError(message) {
    const container = this.templateEngine.mainContainer;
    container.innerHTML = `
      <div class="error-page">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="#common" class="btn-home" routerLink="common">Back to Common Module</a>
      </div>
    `;
  }
}

if (typeof window !== "undefined") {
  window.CommonApplication = CommonApplication;
}
