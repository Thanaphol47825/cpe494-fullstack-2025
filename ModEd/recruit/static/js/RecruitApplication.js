class RecruitApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine);
    this.rootURL = window.__ROOT_URL__ || RootURL || "";

    this.setSubModuleBasePath("/recruit/static/js");

    this.features = {
      "admin/create": { title: "Create Admin", icon: "👤", script: "AdminCreate.js" },
      "applicant/create": { title: "Create Applicant", icon: "🧑‍💼", script: "ApplicantCreate.js" },
      "applicant/list": { title: "Manage Applicant", icon: "🗂️", script: "ApplicantList.js" },
      "applicationreport/list": { title: "Manage Application Report", icon: "📊", script: "ApplicationReportList.js" },
      "applicationround/list": { title: "Manage Application Round", icon: "📅", script: "ApplicationRoundList.js" },
      "interview/create": { title: "Create Interview", icon: "💬", script: "InterviewCreate.js" },
      "interview/list": { title: "Manage Interview", icon: "🎯", script: "InterviewList.js" },
      "interviewcriteria/list": { title: "Manage Interview Criteria", icon: "📋", script: "InterviewCriteriaList.js" },
    };

    this.setupRoutes();
    this.setDefaultRoute("");
  }

  setupRoutes() {
    this.addRoute("", this.renderMenu.bind(this));

    this.addRouteWithSubModule(
      "/admin/create",
      this.renderAdminCreate.bind(this),
      "AdminCreate.js"
    );
    this.addRouteWithSubModule(
      "/applicant/create",
      this.renderApplicantCreate.bind(this),
      "ApplicantCreate.js"
    );
    this.addRouteWithSubModule(
      "/applicant/list",
      this.renderApplicantList.bind(this),
      "ApplicantList.js"
    );
    this.addRouteWithSubModule(
      "/applicationreport/list",
      this.renderApplicationReportList.bind(this),
      "ApplicationReportList.js"
    );
    this.addRouteWithSubModule(
      "/applicationround/list",
      this.renderApplicationRoundList.bind(this),
      "ApplicationRoundList.js"
    );
    this.addRouteWithSubModule(
      "/interview/create",
      this.renderInterviewCreate.bind(this),
      "InterviewCreate.js"
    );
    this.addRouteWithSubModule(
      "/interview/list",
      this.renderInterviewList.bind(this),
      "InterviewList.js"
    );
    this.addRouteWithSubModule(
      "/interviewcriteria/list",
      this.renderInterviewCriteriaList.bind(this),
      "InterviewCriteriaList.js"
    );
  }

  async render() {
    if (!this.templateEngine?.mainContainer) {
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
          <h1 class="menu-title">Recruit Module</h1>
          <p>Manage recruitment process — applicants, rounds, and interviews.</p>

          <div class="module-list">
            ${Object.entries(this.features)
              .map(
                ([path, feature]) => `
                  <a href="#recruit/${path}" class="module-button" routerLink="recruit/${path}">
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

  async renderAdminCreate() {
    if (!window.AdminCreate) return this.renderError("Failed to load AdminCreate");
    const feature = new window.AdminCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicantCreate() {
    if (!window.ApplicantCreate) return this.renderError("Failed to load ApplicantCreate");
    const feature = new window.ApplicantCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicantList() {
    if (!window.ApplicantList) return this.renderError("Failed to load ApplicantList");
    const feature = new window.ApplicantList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationReportList() {
    if (!window.ApplicationReportList) return this.renderError("Failed to load ApplicationReportList");
    const feature = new window.ApplicationReportList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationRoundList() {
    if (!window.ApplicationRoundList) return this.renderError("Failed to load ApplicationRoundList");
    const feature = new window.ApplicationRoundList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewCriteriaCreate() {
    if (!window.InterviewCriteriaCreate) return this.renderError("Failed to load InterviewCriteriaCreate");
    const feature = new window.InterviewCriteriaCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewCreate() {
    if (!window.InterviewCreate) return this.renderError("Failed to load InterviewCreate");
    const feature = new window.InterviewCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewList() {
    if (!window.InterviewList) return this.renderError("Failed to load InterviewList");
    const feature = new window.InterviewList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewCriteriaList() {
    if (!window.InterviewCriteriaList) return this.renderError("Failed to load InterviewCriteriaList");
    const feature = new window.InterviewCriteriaList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  renderError(message) {
    const container = this.templateEngine.mainContainer;
    container.innerHTML = `
      <div class="error-page">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="#recruit" class="btn-home" routerLink="recruit">Back to Recruit Menu</a>
      </div>
    `;
  }
}

if (typeof window !== "undefined") window.RecruitApplication = RecruitApplication;
