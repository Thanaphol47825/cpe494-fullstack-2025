if (typeof window !== "undefined" && !window.InternshipHomeTemplate) {
  class InternshipHomeTemplate {
    // Template variables for Menu.tpl and MenuCard.tpl
    static BOX_COLORS = {
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
      "Internship Certificate Create": "from-yellow-500 to-yellow-500",
    };

    static ICON_PATHS = {
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
      "Internship Certificate Create":
        "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.839 6.479A12.083 12.083 0 0112 20.055a12.083 12.083 0 01-7-2.998 12.083 12.083 0 01.839-6.479L12 14z",
    };

    static DESCRIPTIONS = {
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
      "Internship Certificate Create": "Manage student internship certificates",
    };

    static GRADIENTS = {
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
      "Internship Certificate Create": "from-yellow-500 to-yellow-600",
    };

    static async getTemplate(models, templateEngine) {
      try {
        // Prepare MenuCard data for each model
        const menuCardsData = models.map((model) => ({
          card_title: model.label,
          card_description:
            this.DESCRIPTIONS[model.label] || "Manage internship related tasks",
          icon_path:
            this.ICON_PATHS[model.label] || this.ICON_PATHS["Intern Student"],
          button_link: `internship${model.route}`,
          icon_color:
            this.GRADIENTS[model.label] || "from-gray-500 to-gray-600",
          box_color:
            this.BOX_COLORS[model.label] || "from-gray-500 to-gray-500",
          button_text: "Manage",
        }));

        // Render individual cards using MenuCard template from templateEngine
        const cardsHTML = menuCardsData
          .map((cardData) =>
            Mustache.render(templateEngine.template.MenuCard, cardData)
          )
          .join("");

        // Prepare data for Menu template
        const menuData = {
          module_name: "Internship Management",
          module_description:
            "End-to-end internship management, company, mentor and evaluation system for comprehensive tracking and assessment",
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

        return tempDiv.firstChild;
      } catch (error) {
        console.error("Error loading internship home template:", error);

        // Fallback: create simple template
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "p-8 bg-white rounded-lg shadow-md";
        fallbackDiv.innerHTML = `
          <h1 class="text-3xl font-bold mb-6 text-center">Internship Management</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${models
              .map(
                (model) => `
              <div class="bg-gray-100 p-4 rounded-lg">
                <h3 class="text-lg font-semibold mb-2">${model.label}</h3>
                <div class="space-y-2">
                  <button routerLink="internship${model.route}" class="w-full bg-blue-600 text-white py-2 px-4 rounded">Manage</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;

        return fallbackDiv;
      }
    }
  }

  // Make available globally
  window.InternshipHomeTemplate = InternshipHomeTemplate;
}
