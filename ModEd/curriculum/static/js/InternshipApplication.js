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
      this.addRouteWithSubModule(
        "/company",
        this.renderCompany.bind(this),
        "CompanyCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipmentor",
        this.renderInternshipMentor.bind(this),
        "InternshipMentorCreate.js"
      );
      this.addRouteWithSubModule(
        "/internshipattendance",
        this.renderInternshipAttendance.bind(this),
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
      this.addRouteWithSubModule(
        "/internstudentskill/create",
        this.renderInternStudentSkill.bind(this),
        "InternStudentSkillCreate.js"
      );
      this.addRouteWithSubModule(
        "/internstudent/edit/:id",
        this.renderInternStudentEdit.bind(this),
        "InternStudentEdit.js"
      );

      this.setDefaultRoute("");
    }

    models = [
      { label: "internship report", route: "/internshipreport" },
      { label: "Company", route: "/company" },
      { label: "Internship Mentor", route: "/internshipmentor" },
      { label: "Internship Attendance", route: "/internshipattendance" },
      { label: "Internship Criteria", route: "/internshipcriteria" },
      { label: "Intern Student", route: "/internstudent" },
      { label: "Intern Student Create", route: "/internstudent/create" },
      {
        label: "Internship Work Experience Create",
        route: "/internshipworkexperience/create",
      },
      { label: "Intern Skill Create", route: "/internskill/create" },
      {
        label: "Intern Student Skill Create",
        route: "/internstudentskill/create",
      },
    ];

    async renderMainPage() {
      // Ensure Tailwind CSS is loaded
      if (
        !document.querySelector('script[src*="tailwindcss"]') &&
        !document.querySelector('link[href*="tailwind"]')
      ) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
        document.head.appendChild(script);
      }

      // Ensure templates are loaded
      if (!this.templateEngine.template) {
        await this.templateEngine.fetchTemplate();
      }

      // Prepare menu cards data for MenuCard template
      const menuCards = this.models.map((model) => ({
        card_title: model.label,
        card_description: this.getDescriptionForModel(model.label),
        icon_path: this.getIconPathForModel(model.label),
        button_link: `internship${model.route}`,
        icon_color: this.getGradientForModel(model.label),
        box_color: this.getBoxColorForModel(model.label),
        button_text: "Manage",
      }));

      // Render individual menu cards using MenuCard template
      const cardsHTML = menuCards
        .map((card) =>
          Mustache.render(this.templateEngine.template.MenuCard, card)
        )
        .join("");

      // Prepare main menu data for Menu template
      const menuData = {
        module_name: "Internship Management",
        module_description:
          "End-to-end internship management, company, mentor and evaluation system for comprehensive tracking and assessment",
        cards_html: cardsHTML,
      };

      // Render main menu using Menu template
      const menuHTML = Mustache.render(
        this.templateEngine.template.Menu,
        menuData
      );

      this.templateEngine.mainContainer.innerHTML = menuHTML;
    }

    getIconPathForModel(label) {
      const iconPaths = {
        "internship report":
          "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        Company:
          "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        "Internship Mentor":
          "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        "Internship Attendance":
          "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
        "Internship Criteria":
          "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
        "Intern Student":
          "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025",
        "Intern Student Create": "M12 6v6m0 0v6m0-6h6m-6 0H6",
        "Internship Work Experience Create":
          "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 112-2V6m8 0H8",
        "Intern Skill Create":
          "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
        "Intern Student Skill Create": "M13 10V3L4 14h7v7l9-11h-7z",
      };
      return (
        iconPaths[label] ||
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      );
    }

    getBoxColorForModel(label) {
      const boxColors = {
        "internship report": "from-emerald-500 to-teal-500",
        Company: "from-blue-500 to-cyan-500",
        "Internship Mentor": "from-purple-500 to-indigo-500",
        "Internship Attendance": "from-orange-500 to-red-500",
        "Internship Criteria": "from-pink-500 to-rose-500",
        "Intern Student": "from-green-500 to-emerald-500",
        "Intern Student Create": "from-indigo-500 to-purple-500",
        "Internship Work Experience Create": "from-yellow-500 to-orange-500",
        "Intern Skill Create": "from-teal-500 to-cyan-500",
        "Intern Student Skill Create": "from-rose-500 to-pink-500",
      };
      return boxColors[label] || "from-gray-500 to-gray-500";
    }

    getIconForModel(label) {
      const icons = {
        "internship report":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
        Company:
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>',
        "Internship Mentor":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
        "Internship Attendance":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>',
        "Internship Criteria":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>',
        "Intern Student":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025"></path></svg>',
        "Intern Student Create":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>',
        "Internship Work Experience Create":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 112-2V6m8 0H8"></path></svg>',
        "Intern Skill Create":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
        "Intern Student Skill Create":
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      };
      return (
        icons[label] ||
        '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'
      );
    }

    getDescriptionForModel(label) {
      const descriptions = {
        "internship report":
          "Create and manage internship reports and evaluations",
        Company: "Manage company information and partnerships",
        "Internship Mentor": "Assign and manage internship mentors",
        "Internship Attendance": "Track student attendance during internships",
        "Internship Criteria": "Define evaluation criteria for internships",
        "Intern Student": "View and manage intern student records",
        "Intern Student Create": "Add new intern student to the system",
        "Internship Work Experience Create": "Record work experience details",
        "Intern Skill Create": "Define and manage intern skills",
        "Intern Student Skill Create": "Assign skills to intern students",
      };
      return descriptions[label] || "Manage internship related tasks";
    }

    getGradientForModel(label) {
      const gradients = {
        "internship report": "from-emerald-500 to-teal-600",
        Company: "from-blue-500 to-cyan-600",
        "Internship Mentor": "from-purple-500 to-indigo-600",
        "Internship Attendance": "from-orange-500 to-red-600",
        "Internship Criteria": "from-pink-500 to-rose-600",
        "Intern Student": "from-green-500 to-emerald-600",
        "Intern Student Create": "from-indigo-500 to-purple-600",
        "Internship Work Experience Create": "from-yellow-500 to-orange-600",
        "Intern Skill Create": "from-teal-500 to-cyan-600",
        "Intern Student Skill Create": "from-rose-500 to-pink-600",
      };
      return gradients[label] || "from-gray-500 to-gray-600";
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

    async renderCompany() {
      console.log("Rendering Company");
      if (window.CompanyCreate) {
        const companyCreate = new window.CompanyCreate(this.templateEngine);
        await companyCreate.render();
      } else {
        console.error("CompanyCreate class not found");
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

    async renderInternStudentSkill() {
      console.log("Rendering Intern Student Skill");
      if (window.InternStudentSkillCreate) {
        const page = new window.InternStudentSkillCreate(this.templateEngine);
        await page.render();
      } else {
        console.error("InternStudentSkillCreate class not found");
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
                                <p class="text-red-800 text-sm">${
                                  error.message || error
                                }</p>
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
