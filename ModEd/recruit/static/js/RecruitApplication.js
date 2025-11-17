if (typeof window !== "undefined" && !window.RecruitApplication) {
  class RecruitApplication extends BaseModuleApplication {
    constructor(templateEngine) {
      super(templateEngine);
      this.rootURL = window.__ROOT_URL__ || RootURL || "";

      this.setSubModuleBasePath("/recruit/static/js");
    
      this.userRole = localStorage.getItem('role') || 'Admin';
      console.log('[RecruitApplication] Current user role:', this.userRole);
    
      this.features = this.getFeaturesForRole(this.userRole);

      this.setupRoutes();
      this.setDefaultRoute("");
    }

    getFeaturesForRole(role) {
      const allFeatures = {
        "applicant/list": { title: "Manage Applicant", icon: "🗂️", script: "ApplicantTable.js", roles: ["Admin"] },
        "applicationreport/list": { title: "Manage Application Report", icon: "📊", script: "ApplicationReportTable.js", roles: ["Admin"] },
        "applicationround/list": { title: "Manage Application Round", icon: "📅", script: "ApplicationRoundTable.js", roles: ["Admin"] },
        "interview/list": { title: "Manage Interview", icon: "🎯", script: "InterviewTable.js", roles: ["Admin"] },
        "my/interviews": { title: "My Interview Queue", icon: "📋", script: "MyInterviewList.js", roles: ["Instructor"] },
        "interviewcriteria/list": { title: "Manage Interview Criteria", icon: "📋", script: "InterviewCriteriaList.js", roles: ["Admin", "Instructor"] },
      };

      // Filter features based on user role
      const filteredFeatures = {};
      for (const [key, feature] of Object.entries(allFeatures)) {
        if (feature.roles.includes(role)) {
          filteredFeatures[key] = feature;
        }
      }

      console.log('[RecruitApplication] Features available for', role, ':', Object.keys(filteredFeatures));
      return filteredFeatures;
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
      "/applicationround/create",
      this.renderApplicationRoundForm.bind(this),
      "ApplicationRoundForm.js"
    );
    this.addRouteWithSubModule(
      "/applicationround/list",
      this.renderApplicationRoundList.bind(this),
      "ApplicationRoundTable.js"
    );
    this.addRouteWithSubModule(
      "/applicationround/edit/:id",
      this.renderApplicationRoundForm.bind(this),
      "ApplicationRoundForm.js"
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
    
    this.addRouteWithSubModule(
      "/my/interviews",
      this.renderMyInterviewList.bind(this),
      "MyInterviewList.js"
    );
    this.addRouteWithSubModule(
      "/my/interviews/pending",
      this.renderMyInterviewListPending.bind(this),
      "MyInterviewList.js"
    );
    this.addRouteWithSubModule(
      "/my/interviews/evaluated",
      this.renderMyInterviewListEvaluated.bind(this),
      "MyInterviewList.js"
    );
    this.addRouteWithSubModule(
      "/interview/evaluate/:id",
      this.renderInterviewEvaluate.bind(this),
      "InterviewEvaluateForm.js"
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
    
    if (Object.keys(this.features).length === 0) {
      const templatePath = `${this.rootURL}/recruit/static/view/AccessRestricted.tpl`;
      const response = await fetch(templatePath);
      const templateContent = await response.text();
      const rendered = Mustache.render(templateContent, { userRole: this.userRole });
      container.innerHTML = rendered;
      return true;
    }
    
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
    
    const id = params?.id;
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

    if (!window.ApplicantModalConfig) {
      await this.loadSubModule("config/modal/applicantFields.js");
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
    
    const id = params?.id;
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

    if (!window.ApplicationReportModalConfig) {
      await this.loadSubModule("config/modal/applicationReportFields.js");
    }
    
    if (!window.ApplicationReportTable) return this.renderError("Failed to load ApplicationReportTable");
    const feature = new window.ApplicationReportTable(this.templateEngine, this.rootURL);
    return await feature.render();
  }

  async renderApplicationRoundList() {
    await this.loadRecruitTableTemplate();
    if (!window.ApplicationRoundService) {
      await this.loadSubModule("ApplicationRoundService.js");
    }
    if (!window.ApplicationRoundTable) return this.renderError("Failed to load ApplicationRoundTable");
    const feature = new window.ApplicationRoundTable(this.templateEngine, this.rootURL);
    return await feature.render();
 }

  async renderApplicationRoundForm(params = null) {
    await this.loadRecruitFormTemplate();
    if (!window.ApplicationRoundService) {
      await this.loadSubModule("ApplicationRoundService.js");
    }
    if (!window.ApplicationRoundForm)
      return this.renderError("Failed to load ApplicationRoundForm");
    
    const id = params?.id;
    const feature = new window.ApplicationRoundForm(this.templateEngine, this.rootURL);
    return await feature.render(id);
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

    if (!window.InterviewModalConfig) {
      await this.loadSubModule("config/modal/interviewFields.js");
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
    
    const id = params?.id;
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

  // My Interview routes (for Instructor)
  async renderMyInterviewList() {
    await this.loadRecruitTableTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.MyInterviewList) return this.renderError("Failed to load MyInterviewList");
    const feature = new window.MyInterviewList(this.templateEngine, this.rootURL);
    return await feature.render('all');
  }

  async renderMyInterviewListPending() {
    await this.loadRecruitTableTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.MyInterviewList) return this.renderError("Failed to load MyInterviewList");
    const feature = new window.MyInterviewList(this.templateEngine, this.rootURL);
    return await feature.render('pending');
  }

  async renderMyInterviewListEvaluated() {
    await this.loadRecruitTableTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.MyInterviewList) return this.renderError("Failed to load MyInterviewList");
    const feature = new window.MyInterviewList(this.templateEngine, this.rootURL);
    return await feature.render('evaluated');
  }

  async renderInterviewEvaluate(params) {
    await this.loadRecruitFormTemplate();
    
    if (!window.InterviewService) {
      await this.loadSubModule("services/InterviewService.js");
    }
    
    if (!window.InterviewEvaluateForm) return this.renderError("Failed to load InterviewEvaluateForm");
    
    const id = params?.id;
    if (!id) {
      return this.renderError("Interview ID is required for evaluation");
    }
    
    const feature = new window.InterviewEvaluateForm(this.templateEngine, this.rootURL, id);
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
