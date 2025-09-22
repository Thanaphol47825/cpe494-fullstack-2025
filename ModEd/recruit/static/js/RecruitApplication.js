class RecruitApplication {
  constructor(application) {
    this.application = application;

    this.subModules = [
      {
        label: "Create Admin",
        className: "AdminCreate",
        script: "/recruit/static/js/AdminCreate.js",
      },
      {
        label: "Create Applicant",
        className: "ApplicantCreate",
        script: "/recruit/static/js/ApplicantCreate.js",
      },
      {
        label: "Create Application Round",
        className: "ApplicationRoundCreate",
        script: "/recruit/static/js/ApplicationRoundCreate.js",
      },
      {
        label: "Create Interview Criteria",
        className: "InterviewCriteriaCreate",
        script: "/recruit/static/js/InterviewCriteriaCreate.js",
      }
    ];
  }

  async render() {
    console.log("Do something with RecruitApplication.");
    this.application.mainContainer.innerHTML = "<h2>Overwritten with RecruitApplication</h2>";

    for (const module of this.subModules) {

      await this.application.fetchModule(module.script);

      let button = this.application.create(`
        <a href="#" id="${module.label}">${module.label}</a>
      `);

      let moduleEngine = eval(`new ${module.className}(this.application)`);

      button.onclick = (e) => {
        e.preventDefault();
        return moduleEngine.render();
      };

      this.application.mainContainer.append(button);
    }
  }
}
