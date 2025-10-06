class RecruitApplication {
  constructor(engine) {
    this.engine = engine;

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
        label: "Manage Applicant",
        className: "ApplicantList",
        script: "/recruit/static/js/ApplicantList.js",
      },
      {
        label: "Manage Application Report",
        className: "ApplicationReportList",
        script: "/recruit/static/js/ApplicationReportList.js",
      },
      {
        label: "Manage Application Round",
        className: "ApplicationRoundList",
        script: "/recruit/static/js/ApplicationRoundList.js",
      },
      {
        label: "Create Interview Criteria",
        className: "InterviewCriteriaCreate",
        script: "/recruit/static/js/InterviewCriteriaCreate.js",
      },
      {
        label: "Create Interview",
        className: "InterviewCreate",
        script: "/recruit/static/js/InterviewCreate.js",
      },
    ];

    this.moduleIcons = {
      "Create Admin": "👤",
      "Create Applicant": "🧑‍💼",
      "Manage Applicant": "🗂️",
      "Manage Application Report": "📊",
      "Manage Application Round": "📅",
      "Create Interview Criteria": "📝",
      "Create Interview": "💬",
    };
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
    await this.ensureTailwind();

    this.engine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <header class="bg-indigo-600 shadow">
          <div class="max-w-5xl mx-auto px-6 py-8 text-white">
            <h1 class="text-4xl font-bold mb-1">Recruit Module</h1>
            <p class="text-indigo-100 text-sm">Manage recruitment system easily.</p>
          </div>
        </header>


        <main class="max-w-5xl mx-auto px-6 py-10">
          <h2 class="text-lg font-semibold text-gray-700 mb-6">
            Select an Action
          </h2>
          <div id="RecruitButtons"
               class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          </div>
        </main>
      </div>
    `;

    const buttonContainer = this.engine.mainContainer.querySelector("#RecruitButtons");

    for (const mod of this.subModules) {
      await this.engine.fetchModule(mod.script);

      const icon = this.moduleIcons[mod.label] || "📦"; 

      const button = this.engine.create(`
        <button
          class="flex flex-col justify-center items-center text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm
                 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-1 transform transition-all duration-200 ease-in-out">
          <div class="w-12 h-12 flex items-center justify-center text-2xl mb-3">
            ${icon}
          </div>
          <span class="text-gray-700 font-medium">${mod.label}</span>
        </button>
      `);

      const moduleInstance = eval(`new ${mod.className}(this.engine)`);

      button.onclick = async (e) => {
        e.preventDefault();
        this.engine.mainContainer.innerHTML = "";
        await moduleInstance.render();
      };

      buttonContainer.appendChild(button);
    }
  }
}