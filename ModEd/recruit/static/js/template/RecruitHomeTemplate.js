if (typeof window !== "undefined" && !window.RecruitHomeTemplate) {
  class RecruitHomeTemplate {
    // Card colors for each feature
    static BOX_COLORS = {
      "Create Admin": "from-gray-500 to-slate-600",
      "Create Applicant": "from-blue-500 to-indigo-500",
      "Manage Applicant": "from-cyan-500 to-blue-500",
      "Create Application Report": "from-teal-500 to-emerald-500",
      "Manage Application Report": "from-emerald-500 to-green-500",
      "Create Application Round": "from-yellow-500 to-amber-500",
      "Manage Application Round": "from-amber-500 to-orange-500",
      "Create Interview": "from-purple-500 to-violet-500",
      "Manage Interview": "from-indigo-500 to-purple-500",
      "Manage Interview Criteria": "from-pink-500 to-rose-500",
      "Create Interview Criteria": "from-fuchsia-500 to-pink-500",
    };

    static ICON_PATHS = {
      "Create Admin":
        "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      "Create Applicant":
        "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
      "Manage Applicant":
        "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      "Create Application Report":
        "M12 4v16m8-8H4",
      "Manage Application Report":
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      "Create Application Round":
        "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
      "Manage Application Round":
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      "Create Interview":
        "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      "Manage Interview":
        "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
      "Manage Interview Criteria":
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      "Create Interview Criteria":
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    };

    static DESCRIPTIONS = {
      "Create Admin": "Create and manage administrator accounts",
      "Create Applicant": "Add new student applicants to the system",
      "Manage Applicant": "View and manage all applicant records",
      "Create Application Report": "Create new application reports for applicants",
      "Manage Application Report": "Review and process application reports",
      "Create Application Round": "Create new recruitment rounds",
      "Manage Application Round": "Configure recruitment rounds and schedules",
      "Create Interview": "Schedule new interviews with applicants",
      "Manage Interview": "View and manage all interview records",
      "Manage Interview Criteria": "Define evaluation criteria for interviews",
      "Create Interview Criteria": "Add new interview evaluation criteria",
    };

    static GRADIENTS = {
      "Create Admin": "from-gray-500 to-slate-600",
      "Create Applicant": "from-blue-500 to-indigo-600",
      "Manage Applicant": "from-cyan-500 to-blue-600",
      "Create Application Report": "from-teal-500 to-emerald-600",
      "Manage Application Report": "from-emerald-500 to-green-600",
      "Create Application Round": "from-yellow-500 to-amber-600",
      "Manage Application Round": "from-amber-500 to-orange-600",
      "Create Interview": "from-purple-500 to-violet-600",
      "Manage Interview": "from-indigo-500 to-purple-600",
      "Manage Interview Criteria": "from-pink-500 to-rose-600",
      "Create Interview Criteria": "from-fuchsia-500 to-pink-600",
    };

    static async getTemplate(features, templateEngine) {
      try {
        // Convert features object to array format
        const modelsArray = Object.entries(features).map(([route, feature]) => ({
          label: feature.title,
          route: `/${route}`,
          icon: feature.icon
        }));

        // Prepare MenuCard data for each feature
        const menuCardsData = modelsArray.map((model) => ({
          card_title: model.label,
          card_description:
            this.DESCRIPTIONS[model.label] || "Manage recruitment related tasks",
          icon_path:
            this.ICON_PATHS[model.label] || this.ICON_PATHS["Create Applicant"],
          button_link: `recruit${model.route}`,
          icon_color:
            this.GRADIENTS[model.label] || "from-gray-500 to-gray-600",
          box_color:
            this.BOX_COLORS[model.label] || "from-gray-500 to-gray-500",
          button_text: "Open",
        }));

        // Render individual cards using MenuCard template from templateEngine
        const cardsHTML = menuCardsData
          .map((cardData) =>
            Mustache.render(templateEngine.template.MenuCard, cardData)
          )
          .join("");

        // Prepare data for Menu template
        const menuData = {
          module_name: "Student Recruitment",
          module_description:
            "End-to-end recruitment management system for handling applications, interviews, and candidate evaluation",
          cards_html: cardsHTML,
        };

        // Render Menu template using templateEngine
        const renderedHTML = Mustache.render(
          templateEngine.template.Menu,
          menuData
        );

        // Create DOM element from HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = renderedHTML.trim();

        const menuElement = tempDiv.firstChild;
        
        // Helper function to create logout button
        const createLogoutButton = () => {
          const logoutButton = document.createElement("button");
          logoutButton.className = "fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium";
          logoutButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
          `;
          logoutButton.addEventListener("click", async () => {
            try {
              const response = await fetch(`${RootURL}/recruit/auth/logout`, {
                method: 'POST',
                credentials: 'include'
              });
              const result = await response.json();
              if (result.isSuccess) {
                localStorage.removeItem('role');
                window.location.href = `${RootURL}/recruit/login`;
              }
            } catch (error) {
              console.error('Logout error:', error);
              localStorage.removeItem('role');
              window.location.href = `${RootURL}/recruit/login`;
            }
          });
          return logoutButton;
        };
        
        // Add logout button to top right corner
        if (menuElement) {
          const logoutButton = createLogoutButton();
          menuElement.appendChild(logoutButton);
        }

        return menuElement;
      } catch (error) {
        console.error("Error loading recruit home template:", error);

        // Fallback: create simple template
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "p-8 bg-white rounded-lg shadow-md";
        fallbackDiv.innerHTML = `
          <h1 class="text-3xl font-bold mb-6 text-center">Student Recruitment</h1>
          <p class="text-gray-600 text-center mb-8">Manage recruitment process — applicants, rounds, and interviews.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${Object.entries(features)
              .map(
                ([route, feature]) => `
              <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition">
                <h3 class="text-lg font-semibold mb-2 text-indigo-900">${feature.icon} ${feature.title}</h3>
                <p class="text-sm text-gray-600 mb-4">Manage ${feature.title.toLowerCase()}</p>
                <a href="#recruit/${route}" class="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-center hover:bg-indigo-700">
                  Open
                </a>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="mt-6 text-center">
            <a routerLink="/" class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Return to ModEd Home
            </a>
          </div>
          <button id="logoutBtn" class="fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
          </button>
        `;
        
        // Add logout functionality
        const logoutBtn = fallbackDiv.querySelector('#logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async () => {
            try {
              const response = await fetch(`${RootURL}/recruit/auth/logout`, {
                method: 'POST',
                credentials: 'include'
              });
              const result = await response.json();
              if (result.isSuccess) {
                localStorage.removeItem('role');
                window.location.href = `${RootURL}/recruit/login`;
              }
            } catch (error) {
              console.error('Logout error:', error);
              localStorage.removeItem('role');
              window.location.href = `${RootURL}/recruit/login`;
            }
          });
        }

        return fallbackDiv;
      }
    }
  }

  // Make available globally
  window.RecruitHomeTemplate = RecruitHomeTemplate;
}

