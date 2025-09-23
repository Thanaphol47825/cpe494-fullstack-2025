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

  async ensureTailwind() {
    if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.tailwindcss.com";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  async render() {
    console.log("RecruitApplication: render()");

    await this.ensureTailwind();

    this.application.mainContainer.innerHTML = `
      <div class="max-w-4xl mx-auto py-10 px-4">
        <header class="mb-6">
          <h1 class="text-3xl font-bold tracking-tight text-gray-800">
            Recruit Module
          </h1>
          <p class="text-sm text-gray-500">
            Choose an action below to manage recruitment.
          </p>
        </header>
        <div id="RecruitButtons" class="flex flex-wrap gap-3"></div>
      </div>
    `;

    const buttonContainer = this.application.mainContainer.querySelector("#RecruitButtons");

    for (const module of this.subModules) {
      await this.application.fetchModule(module.script);

      const button = this.application.create(`
        <button id="${module.label}" 
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white 
                 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                 focus:ring-indigo-400 transition">
          ${module.label}
        </button>
      `);

      const moduleEngine = eval(`new ${module.className}(this.application)`);

      button.onclick = (e) => {
        e.preventDefault();
        return moduleEngine.render();
      };

      buttonContainer.appendChild(button);
    }
  }
}
