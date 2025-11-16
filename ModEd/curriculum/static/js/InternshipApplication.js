if (typeof window !== "undefined" && !window.InternshipApplication) {
  class InternshipApplication extends BaseModuleApplication {
    constructor(templateEngine) {
      super(templateEngine);

      this.setSubModuleBasePath("/curriculum/static/js");
      this.setupRoutes();
    }

    setupRoutes() {
      this.addRoute("", this.renderMainPage.bind(this));

      this.addRouteWithSubModule(
        "/internshipreport",
        this.renderInternshipReport.bind(this),
        "InternshipReportCreate.js"
      );
      //Company (new version)
      this.addRouteWithSubModule(
        "/company",
        this.renderCompanyList.bind(this),
        "CompanyList.js"
      );
      this.addRouteWithSubModule(
        "/company/create",
        this.renderCompanyCreate.bind(this),
        "CompanyCreate.js"
      );
      this.addRouteWithSubModule(
        "/company/edit/:id",
        this.renderCompanyEdit.bind(this),
        "CompanyEdit.js"
      );
      this.addRouteWithSubModule(
        "/internshipmentor",
        this.renderInternshipMentor.bind(this),
        "InternshipMentorCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipattendance",
        this.renderInternshipAttendance.bind(this),
        "InternshipAttendanceList.js"
      );
      this.addRouteWithSubModule(
        "/internshipattendance/create",
        this.renderCreateInternshipAttendance.bind(this),
        "InternshipAttendanceCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipcriteria",
        this.renderInternshipCriteria.bind(this),
        "InternshipCriteriaCreate.js"
      );
      this.addRouteWithSubModule(
        "/internstudent",
        this.renderInternStudentList.bind(this),
        "InternStudentList.js"
      );
      this.addRouteWithSubModule(
        "/internstudent/create",
        this.renderInternStudentCreate.bind(this),
        "InternStudentCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipworkexperience/create",
        this.renderInternshipWorkExperience.bind(this),
        "InternWorkExperienceCreate.js"
      );
      this.addRouteWithSubModule(
        "/internskill/create",
        this.renderInternSkill.bind(this),
        "InternSkillCreate.js"
      );
      // this.addRouteWithSubModule(
      //   "/internstudentskill/create",
      //   this.renderInternStudentSkill.bind(this),
      //   "InternStudentSkillCreate.js"
      // );
      this.addRouteWithSubModule(
        "/internstudent/edit/:id",
        this.renderInternStudentEdit.bind(this),
        "InternStudentEdit.js"
      );
      this.addRouteWithSubModule(
        "/internstudentskill/create/:internStudentId",
        this.renderInternStudentSkill.bind(this),
        "InternStudentSkillCreate.js"
      );
      this.addRouteWithSubModule(
        "/interncertificate/create",
        this.renderInternCertificateCreate.bind(this),
        "InternCertificateCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipattendance/personal",
        this.renderPersonalAttendance.bind(this),
        "InternshipPersonalAttendance.js"
      );

      this.setDefaultRoute("");
    }

    models = [
      { label: "Intern Student", route: "/internstudent" },
      // { label: "internship report", route: "/internshipreport" },
      { label: "Company", route: "/company" },
      { label: "Internship Mentor", route: "/internshipmentor" },
      { label: "Internship Attendance", route: "/internshipattendance" },
      // { label: "Internship Criteria", route: "/internshipcriteria" },
      // { label: "Intern Student Create", route: "/internstudent/create" },
      // {
      //   label: "Internship Work Experience Create",
      //   route: "/internshipworkexperience/create",
      // },
      { label: "Intern Skill Create", route: "/internskill/create" },
      // {
      //   label: "Intern Student Skill Create",
      //   route: "/internstudentskill/create",
      // },
      {
        label: "Intern Certificate Create",
        route: "/interncertificate/create",
      },
    ];

    async renderMainPage() {
      // Ensure Tailwind CSS is loaded
      if (
        !document.querySelector('script[src*="tailwindcss"]') &&
        !document.querySelector('link[href*="tailwind"]')
      ) {
        const script = document.createElement("script");
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
      }

      // Clear main container
      this.templateEngine.mainContainer.innerHTML = "";

      // Load InternshipHomeTemplate if not available
      if (!window.InternshipHomeTemplate) {
        console.log("Loading InternshipHomeTemplate...");
        await this.loadTemplates();
      }

      // Ensure templates are loaded in templateEngine
      if (!this.templateEngine.template) {
        await this.templateEngine.fetchTemplate();
      }

      // Use InternshipHomeTemplate to render with templateEngine
      console.log("Rendering internship main page with models:", this.models);
      const homeElement = await InternshipHomeTemplate.getTemplate(
        this.models,
        this.templateEngine
      );
      this.templateEngine.mainContainer.appendChild(homeElement);
    }

    async loadTemplates() {
      if (!window.InternshipHomeTemplate) {
        const script = document.createElement("script");
        script.src = `${RootURL}/curriculum/static/js/template/InternshipHomeTemplate.js`;
        document.head.appendChild(script);

        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
    }

    async renderInternshipReport() {
      console.log("Rendering Internship Report");
      if (window.InternshipReportCreate) {
        const reportCreate = new window.InternshipReportCreate(
          this.templateEngine
        );
        await reportCreate.render();
      } else {
        console.error("InternshipReportCreate class not found");
      }
    }

    async renderCompanyCreate() {
      console.log("Rendering Company Create");
      if (window.CompanyCreate) {
        const companyCreate = new window.CompanyCreate(this);
        await companyCreate.render();
      } else {
        console.error("CompanyCreate class not found");
      }
    }

    async renderCompanyList() {
      console.log("Rendering Company List");
      await this.loadSubModule("CompanyList.js");
      console.log("Finish await");
      if (window.CompanyList) {
        const companyList = new window.CompanyList(
          this.templateEngine,
          RootURL || ""
        );
        await companyList.render();
      } else {
        console.error("CompanyList class not found");
      }
    }

    async renderCompanyEdit() {
      console.log("Rendering Company Edit");
      const currentPath = this.templateEngine.getCurrentPath();
      const pathParts = currentPath.split("/");
      const companyId = pathParts[pathParts.length - 1];

      if (window.CompanyEdit) {
        const companyEdit = new window.CompanyEdit(this, companyId);
        await companyEdit.render();
      } else {
        console.log("CompanyEdit class not found");
      }
    }

    async renderInternStudentCreate() {
      console.log("Rendering Intern Student");
      if (window.InternStudentCreate) {
        const internStudentCreate = new window.InternStudentCreate(
          this.templateEngine
        );
        await internStudentCreate.render();
      } else {
        console.error("InternStudentCreate class not found");
      }
    }

    async renderInternStudentList() {
      console.log("Rendering Intern Student List");
      if (window.InternStudentList) {
        const internStudentList = new window.InternStudentList(
          this.templateEngine
        );
        await internStudentList.render();
      } else {
        console.error("InternStudentCreate class not found");
      }
    }

    async renderInternStudentEdit() {
      console.log("Rendering Intern Student Edit Form");
      const currentPath = this.templateEngine.getCurrentPath();
      const pathParts = currentPath.split("/");
      const internId = pathParts[pathParts.length - 1];

      if (window.InternStudentEdit) {
        const internStudentEdit = new window.InternStudentEdit(
          this.templateEngine,
          internId
        );
        await internStudentEdit.render();
      } else {
        console.error("InternStudentEdit class not found");
      }
    }

    async renderInternshipMentor() {
      console.log("Rendering Internship Mentor");
      if (window.InternshipMentorCreate) {
        const mentorCreate = new window.InternshipMentorCreate(
          this.templateEngine
        );
        await mentorCreate.render();
      } else {
        console.error("InternshipMentorCreate class not found");
      }
    }

    async renderInternshipAttendance() {
      console.log("Rendering Internship Attendance");
      if (window.InternshipAttendanceList) {
        const attendanceList = new window.InternshipAttendanceList(
          this.templateEngine
        );
        await attendanceList.render();
      } else {
        console.error("InternshipAttendanceList class not found");
      }
    }

    async renderCreateInternshipAttendance() {
      console.log("Rendering Create Internship Attendance");
      if (window.InternshipAttendanceCreate) {
        const attendanceCreate = new window.InternshipAttendanceCreate(
          this.templateEngine
        );
        await attendanceCreate.render();
      } else {
        console.error("InternshipAttendanceCreate class not found");
      }
    }

    async renderInternshipCriteria() {
      console.log("Rendering Internship Criteria");
      if (window.InternshipCriteriaCreate) {
        const criteriaCreate = new window.InternshipCriteriaCreate(
          this.templateEngine
        );
        await criteriaCreate.render();
      } else {
        console.error("InternshipCriteriaCreate class not found");
      }
    }

    async renderInternshipWorkExperience() {
      console.log("Rendering Internship Work Experience");
      if (window.InternWorkExperienceCreate) {
        const workExperienceCreate = new window.InternWorkExperienceCreate(
          this.templateEngine
        );
        await workExperienceCreate.render();
      } else {
        console.error("InternWorkExperienceCreate class not found");
      }
    }

    async renderInternSkill() {
      console.log("Rendering Intern Skill");
      if (window.InternSkillCreate) {
        const page = new window.InternSkillCreate(this.templateEngine);
        await page.render();
      } else {
        console.error("InternSkillCreate class not found");
      }
    }

    async renderInternStudentSkill(params = {}) {
      console.log("Rendering Intern Student Skill Create", params);
      const internStudentId = params?.internStudentId || null;
      if (window.InternStudentSkillCreate) {
        const page = new window.InternStudentSkillCreate(
          this,
          internStudentId,
          null
        );
        await page.render();
      } else {
        console.error("InternStudentSkillCreate class not found");
      }
    }

    async renderInternCertificateCreate() {
      console.log("Rendering Internship Certificate Create");
      if (window.InternCertificateCreate) {
        const page = new window.InternCertificateCreate(this.templateEngine);
        await page.render();
      } else {
        console.error("InternCertificateCreate class not found");
      }
    }

    async renderPersonalAttendance() {
      console.log("Rendering Personal Attendance");
      if (window.InternshipPersonalAttendance) {
        const personalAttendance = new window.InternshipPersonalAttendance(
          this.templateEngine
        );
        await personalAttendance.render();
      } else {
        console.error("InternshipPersonalAttendance class not found");
      }
    }

    async render() {
      try {
        const handled = await this.handleRoute(
          this.templateEngine.getCurrentPath()
        );
        if (handled) {
          return true;
        }

        await this.renderMainPage();
        return false;
      } catch (error) {
        console.error("Error in InternshipApplication render:", error);
        await this.renderErrorPage(error);
        return false;
      }
    }

    async renderErrorPage(error) {
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-md w-full space-y-8">
            <div class="text-center">
              <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Oops! Something went wrong</h2>
              <p class="mt-2 text-sm text-gray-600">We're sorry, but there was an error loading the page.</p>
              <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p class="text-red-800 text-sm">${error.message || error}</p>
              </div>
              <div class="mt-6">
                <a routerLink="curriculum" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Back to Internship Menu
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (typeof window !== "undefined") {
    window.InternshipApplication = InternshipApplication;
  }
}
