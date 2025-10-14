if (typeof window !== "undefined" && !window.RecruitApplication) {
  class RecruitApplication extends BaseModuleApplication {
    constructor(templateEngine) {
      super(templateEngine);
      this.rootURL = window.__ROOT_URL__ || RootURL || "";

      this.setSubModuleBasePath("/recruit/static/js");
    // Don't load templates in constructor - load them when needed
    // this.loadRecruitFormTemplate();
    // this.loadRecruitTableTemplate();
    // this.loadRecruitHomeTemplate();
    
    this.features = {
      "admin/create": { title: "Create Admin", icon: "👤", script: "AdminCreate.js" },
      "applicant/create": { title: "Create Applicant", icon: "🧑‍💼", script: "ApplicantCreate.js" },
      "applicant/list": { title: "Manage Applicant", icon: "🗂️", script: "ApplicantList.js" },
      "applicationreport/list": { title: "Manage Application Report", icon: "📊", script: "ApplicationReportList.js" },
      "applicationround/list": { title: "Manage Application Round", icon: "📅", script: "ApplicationRoundList.js" },
      "interview/create": { title: "Create Interview", icon: "💬", script: "InterviewCreate.js" },
      "interview/list": { title: "Manage Interview", icon: "🎯", script: "InterviewList.js" },
      "interviewcriteria/list": { title: "Manage Interview Criteria", icon: "📋", script: "InterviewCriteriaList.js" },
      "interviewcriteria/create": { title: "Create Interview Criteria", icon: "✏️", script: "InterviewCriteriaCreate.js" },
    };

    this.setupRoutes();
    this.setDefaultRoute("");
  }

  async loadRecruitFormTemplate() {
    if (!window.RecruitFormTemplate) {
      await this.loadSubModule("template/RecruitFormTemplate.js");
    }
  }

  async loadRecruitTableTemplate() {
    if (!window.RecruitTableTemplate) {
      await this.loadSubModule("template/RecruitTableTemplate.js");
    }
  }

  async loadRecruitHomeTemplate() {
    if (!window.RecruitHomeTemplate) {
      await this.loadSubModule("template/RecruitHomeTemplate.js");
    }
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
      "/interview/edit/:id",
      this.renderInterviewEdit.bind(this),
      "InterviewEdit.js"
    );
    this.addRouteWithSubModule(
      "/interviewcriteria/list",
      this.renderInterviewCriteriaList.bind(this),
      "InterviewCriteriaList.js"
    );
    this.addRouteWithSubModule(
      "/interviewcriteria/create",
      this.renderInterviewCriteriaCreate.bind(this),
      "InterviewCriteriaCreate.js"
    );
  }

  async render() {
    if (!this.templateEngine?.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }
    return await this.handleRoute(this.templateEngine.getCurrentPath());
  }

  async renderMenu() {
    if (!this.templateEngine?.mainContainer) {
      console.error("RecruitApplication: templateEngine or mainContainer not found");
      return false;
    }

    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    if (
      !document.querySelector('script[src*="tailwindcss"]') &&
      !document.querySelector('link[href*="tailwind"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    if (!window.RecruitHomeTemplate) {
      console.log("Loading RecruitHomeTemplate...");
      await this.loadRecruitHomeTemplate();
    }

    if (!this.templateEngine.template) {
      await this.templateEngine.fetchTemplate();
    }

    console.log("Rendering recruit main page with features:", this.features);
    const homeElement = await RecruitHomeTemplate.getTemplate(
      this.features,
      this.templateEngine
    );
    this.templateEngine.mainContainer.appendChild(homeElement);
    
    return true;
  }

  async renderAdminCreate() {
    await this.loadRecruitFormTemplate();
    if (!window.AdminCreate) return this.renderError("Failed to load AdminCreate");
    const feature = new window.AdminCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicantCreate() {
    await this.loadRecruitFormTemplate();
    if (!window.ApplicantCreate) return this.renderError("Failed to load ApplicantCreate");
    const feature = new window.ApplicantCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicantList() {
    await this.loadRecruitTableTemplate();
    if (!window.ApplicantList) return this.renderError("Failed to load ApplicantList");
    const feature = new window.ApplicantList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationReportList() {
    await this.loadRecruitTableTemplate();
    if (!window.ApplicationReportList) return this.renderError("Failed to load ApplicationReportList");
    const feature = new window.ApplicationReportList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationRoundList() {
    await this.loadRecruitTableTemplate();
    if (!window.ApplicationRoundList) return this.renderError("Failed to load ApplicationRoundList");
    const feature = new window.ApplicationRoundList(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewCriteriaCreate() {
    await this.loadRecruitFormTemplate();
    if (!window.InterviewCriteriaCreate) return this.renderError("Failed to load InterviewCriteriaCreate");
    const feature = new window.InterviewCriteriaCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewCreate() {
    await this.loadRecruitFormTemplate();
    if (!window.InterviewCreate) return this.renderError("Failed to load InterviewCreate");
    const feature = new window.InterviewCreate(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewList() {
    await this.loadRecruitTableTemplate();
    if (!window.InterviewList) return this.renderError("Failed to load InterviewList");
    const feature = new window.InterviewList(this.templateEngine, this.rootURL);
    window.interviewList = feature; // Store for button callbacks
    return await feature.render();
  }

  async renderInterviewEdit(params) {
    await this.loadRecruitFormTemplate();
    
    if (!window.InterviewCreate) {
      await this.loadSubModule("InterviewCreate.js");
    }
    
    if (!window.InterviewEdit) return this.renderError("Failed to load InterviewEdit");
    const interviewId = params?.id;
    if (!interviewId) return this.renderError("Interview ID is required");
    const feature = new window.InterviewEdit(this.templateEngine, this.rootURL, interviewId);
    return await feature.render();
  }

  async renderInterviewCriteriaList() {
    await this.loadRecruitTableTemplate();
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

  window.RecruitApplication = RecruitApplication;
}
