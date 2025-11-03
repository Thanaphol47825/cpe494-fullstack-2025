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
      "applicant/create": { title: "Create Applicant", icon: "🧑‍💼", script: "ApplicantForm.js" },
      "applicant/list": { title: "Manage Applicant", icon: "🗂️", script: "ApplicantTable.js" },
      "applicationreport/create": { title: "Create Application Report", icon: "📝", script: "ApplicationReportForm.js" },
      "applicationreport/list": { title: "Manage Application Report", icon: "📊", script: "ApplicationReportTable.js" },
      "applicationround/list": { title: "Manage Application Round", icon: "📅", script: "ApplicationRoundList.js" },
      "interview/create": { title: "Create Interview", icon: "💬", script: "InterviewForm.js" },
      "interview/list": { title: "Manage Interview", icon: "🎯", script: "InterviewTable.js" },
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
      "ApplicantForm.js"
    );
    this.addRouteWithSubModule(
      "/applicant/edit/:id",
      this.renderApplicantEdit.bind(this),
      "ApplicantForm.js"
    );
    this.addRouteWithSubModule(
      "/applicant/list",
      this.renderApplicantList.bind(this),
      "ApplicantTable.js"
    );
    this.addRouteWithSubModule(
      "/applicationreport/create",
      this.renderApplicationReportCreate.bind(this),
      "ApplicationReportForm.js"
    );
    this.addRouteWithSubModule(
      "/applicationreport/edit/:id",
      this.renderApplicationReportEdit.bind(this),
      "ApplicationReportForm.js"
    );
    this.addRouteWithSubModule(
      "/applicationreport/list",
      this.renderApplicationReportList.bind(this),
      "ApplicationReportTable.js"
    );
    this.addRouteWithSubModule(
      "/applicationround/list",
      this.renderApplicationRoundList.bind(this),
      "ApplicationRoundList.js"
    );
    this.addRouteWithSubModule(
      "/interview/create",
      this.renderInterviewCreate.bind(this),
      "InterviewForm.js"
    );
    this.addRouteWithSubModule(
      "/interview/list",
      this.renderInterviewList.bind(this),
      "InterviewTable.js"
    );
    this.addRouteWithSubModule(
      "/interview/edit/:id",
      this.renderInterviewEdit.bind(this),
      "InterviewForm.js"
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
    
    if (!window.ApplicantService) {
      await this.loadSubModule("services/ApplicantService.js");
    }
    
    if (!window.ApplicantForm) return this.renderError("Failed to load ApplicantForm");
    const feature = new window.ApplicantForm(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicantEdit(params) {
    await this.loadRecruitFormTemplate();
    
    if (!window.ApplicantService) {
      await this.loadSubModule("services/ApplicantService.js");
    }
    
    if (!window.ApplicantForm) return this.renderError("Failed to load ApplicantForm");
    
    const id = params?.id || this.getRouteParam('id');
    if (!id) {
      return this.renderError("Applicant ID is required for editing");
    }
    
    const feature = new window.ApplicantForm(this.templateEngine, this.rootURL);
    return await feature.render(id); 
  }

  async renderApplicantList() {
    await this.loadRecruitTableTemplate();
    
    if (!window.ApplicantService) {
      await this.loadSubModule("services/ApplicantService.js");
    }
    if (!window.ApplicantImportService) {
      await this.loadSubModule("services/ApplicantImportService.js");
    }
    
    if (!window.ApplicantTable) return this.renderError("Failed to load ApplicantTable");
    const feature = new window.ApplicantTable(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationReportCreate() {
    await this.loadRecruitFormTemplate();
    
    if (!window.ApplicationReportService) {
      await this.loadSubModule("services/ApplicationReportService.js");
    }
    
    if (!window.ApplicationReportForm) return this.renderError("Failed to load ApplicationReportForm");
    const feature = new window.ApplicationReportForm(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationReportEdit(params) {
    await this.loadRecruitFormTemplate();
    
    if (!window.ApplicationReportService) {
      await this.loadSubModule("services/ApplicationReportService.js");
    }
    
    if (!window.ApplicationReportForm) return this.renderError("Failed to load ApplicationReportForm");
    
    const id = params?.id || this.getRouteParam('id');
    if (!id) {
      return this.renderError("Application Report ID is required for editing");
    }
    
    const feature = new window.ApplicationReportForm(this.templateEngine, this.rootURL);
    return await feature.render(id);
  }

  async renderApplicationReportList() {
    await this.loadRecruitTableTemplate();
    
    if (!window.ApplicationReportService) {
      await this.loadSubModule("services/ApplicationReportService.js");
    }
    
    if (!window.ApplicationStatusService) {
      await this.loadSubModule("services/ApplicationStatusService.js");
    }

    if (!window.ApplicationReportTransferConfirmedStudentService) {
      await this.loadSubModule("services/ApplicationReportTransferConfirmedStudentService.js");
    }
    
    if (!window.ApplicationReportTable) return this.renderError("Failed to load ApplicationReportTable");
    const feature = new window.ApplicationReportTable(this.templateEngine, this.rootURL);
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
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.InterviewScheduler) {
      await this.loadSubModule("InterviewScheduler.js");
    }
    
    if (!window.ApplicationReportService) {
      await this.loadSubModule("services/ApplicationReportService.js");
    }
    
    if (!window.ApplicationStatusService) {
      await this.loadSubModule("services/ApplicationStatusService.js");
    }
    
    if (!window.InterviewForm) return this.renderError("Failed to load InterviewForm");
    const feature = new window.InterviewForm(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewList() {
    await this.loadRecruitTableTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.InterviewTable) return this.renderError("Failed to load InterviewTable");
    const feature = new window.InterviewTable(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderInterviewEdit(params) {
    await this.loadRecruitFormTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.InterviewScheduler) {
      await this.loadSubModule("InterviewScheduler.js");
    }
    
    if (!window.ApplicationReportService) {
      await this.loadSubModule("services/ApplicationReportService.js");
    }
    
    if (!window.ApplicationStatusService) {
      await this.loadSubModule("services/ApplicationStatusService.js");
    }
    
    if (!window.InterviewForm) return this.renderError("Failed to load InterviewForm");
    
    const id = params?.id || this.getRouteParam('id');
    if (!id) {
      return this.renderError("Interview ID is required for editing");
    }
    
    const feature = new window.InterviewForm(this.templateEngine, this.rootURL);
    return await feature.render(id);
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
