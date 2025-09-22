class RecruitApplication {
  constructor(application) {
    this.application = application;

    this.subModules = [
      {
        label: "Create Applicant",
        className: "ApplicantCreate",
        script: "/recruit/static/js/ApplicantCreate.js",
      },

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
