if (typeof window !== "undefined" && !window.CommonHomeTemplate) {
  class CommonHomeTemplate {
    // Icon paths for SVG icons
    static ICON_PATHS = {
      "Add Student": "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025",
      "List Students": "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      "Add Instructor": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      "List Instructors": "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025",
      "Add Department": "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      "List Departments": "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      "Add Faculty": "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
      "List Faculty": "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    };

    // Gradient colors for each card
    static GRADIENTS = {
      "Add Student": "from-green-500 to-emerald-600",
      "List Students": "from-teal-500 to-cyan-600",
      "Add Instructor": "from-blue-500 to-indigo-600",
      "List Instructors": "from-purple-500 to-violet-600",
      "Add Department": "from-orange-500 to-red-600",
      "List Departments": "from-rose-500 to-pink-600",
      "Add Faculty": "from-amber-500 to-yellow-600",
      "List Faculty": "from-lime-500 to-green-600"
    };

    // Box colors for background decoration
    static BOX_COLORS = {
      "Add Student": "from-green-500 to-emerald-500",
      "List Students": "from-teal-500 to-cyan-500",
      "Add Instructor": "from-blue-500 to-indigo-500",
      "List Instructors": "from-purple-500 to-violet-500",
      "Add Department": "from-orange-500 to-red-500",
      "List Departments": "from-rose-500 to-pink-500",
      "Add Faculty": "from-amber-500 to-yellow-500",
      "List Faculty": "from-lime-500 to-green-500"
    };

    // Descriptions for each feature
    static DESCRIPTIONS = {
      "Add Student": "Add new student to the system",
      "List Students": "View and manage student records",
      "Add Instructor": "Add new instructor to the system",
      "List Instructors": "View and manage instructor records",
      "Add Department": "Create new department",
      "List Departments": "View and manage departments",
      "Add Faculty": "Create new faculty",
      "List Faculty": "View and manage faculties"
    };

    /**
     * Define which roles can see which features
     * Student: Can only view lists (read-only)
     * Instructor: Can view and manage students
     * Admin: Full access to everything
     */
    static ROLE_PERMISSIONS = {
      'Student': [
        'student/list',
        'instructor/list',
        'department/list',
        'faculty/list'
      ],
      'Instructor': [
        'student/create',
        'student/list',
        'instructor/list',
        'department/list',
        'faculty/list'
      ],
      'Admin': [
        'student/create',
        'student/list',
        'instructor/create',
        'instructor/list',
        'department/create',
        'department/list',
        'faculty/create',
        'faculty/list'
      ]
    };

    /**
     * Check if current role can access a feature
     * @param {string} featureId - Feature ID (e.g., 'student/create')
     * @returns {boolean}
     */
    static canAccessFeature(featureId) {
      const currentRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'Admin';
      const permissions = this.ROLE_PERMISSIONS[currentRole] || [];
      return permissions.includes(featureId);
    }

    /**
     * Add role switcher UI to menu element
     * @param {HTMLElement} menuElement - Menu element to add role switcher to
     */
    static addRoleSwitcher(menuElement) {
      const container = menuElement.querySelector('.relative.z-10.max-w-7xl');
      if (!container) return;

      // Create role switcher HTML
      const roleSwitcherHTML = `
        <div class="flex justify-end mb-6">
          <div class="bg-white rounded-xl shadow-lg p-3 border border-slate-200">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-600">Role:</span>
              <div class="flex gap-1">
                <button onclick="setCommonRole('Student')" id="role-student" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-blue-500 hover:text-white">
                  Student
                </button>
                <button onclick="setCommonRole('Instructor')" id="role-instructor" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white">
                  Instructor
                </button>
                <button onclick="setCommonRole('Admin')" id="role-admin" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-purple-500 hover:text-white">
                  Admin
                </button>
              </div>
              <span id="current-role-display" class="ml-2 text-xs font-semibold text-emerald-600"></span>
            </div>
          </div>
        </div>
      `;

      // Insert role switcher before the header section
      const headerSection = container.querySelector('.text-center.mb-16');
      if (headerSection) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = roleSwitcherHTML.trim();
        container.insertBefore(tempDiv.firstChild, headerSection);
      }
    }

    /**
     * Generate template using core Menu and MenuCard templates
     * @param {Object} features - Features object from CommonApplication
     * @param {Object} templateEngine - Template engine with templates loaded
     * @returns {HTMLElement} - Rendered menu element
     */
    static async getTemplate(features, templateEngine) {
      try {
        // Ensure templates are loaded
        if (!templateEngine.template || !templateEngine.template.Menu || !templateEngine.template.MenuCard) {
          await templateEngine.fetchTemplate();
        }

        // Get current role to filter features
        const currentRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'Admin';

        // Prepare MenuCard data for each feature, filtering by role permissions
        const menuCardsData = Object.entries(features)
          .filter(([id, feature]) => this.canAccessFeature(id))
          .map(([id, feature]) => ({
            card_title: feature.title,
            card_description: this.DESCRIPTIONS[feature.title] || "Manage common module data",
            icon_path: this.ICON_PATHS[feature.title] || this.ICON_PATHS["List Students"],
            button_link: `common/${id}`,
            icon_color: this.GRADIENTS[feature.title] || "from-blue-500 to-indigo-600",
            box_color: this.BOX_COLORS[feature.title] || "from-blue-500 to-blue-500",
            button_text: "Manage"
          }));

        // Render individual cards using MenuCard template
        const cardsHTML = menuCardsData
          .map((cardData) => Mustache.render(templateEngine.template.MenuCard, cardData))
          .join("");

        // Prepare data for Menu template
        const menuData = {
          module_name: "Common Module",
          module_description: "Manage Faculty, Department, Instructor, and Student information for the entire system",
          cards_html: cardsHTML
        };

        // Render Menu template
        const renderedHTML = Mustache.render(templateEngine.template.Menu, menuData);

        // Create DOM element from HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = renderedHTML.trim();
        const menuElement = tempDiv.firstChild;

        // Add role switcher to the menu
        this.addRoleSwitcher(menuElement);

        return menuElement;
      } catch (error) {
        console.error("Error loading common home template:", error);

        // Fallback: create simple template
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "menu-container";
        fallbackDiv.innerHTML = `
          <div class="form-container">
            <h1 class="menu-title">Common Module</h1>
            <a href='#' class="btn-home">🏠 Back to ModEd</a>
            <p>Manage Faculty, Department, Instructor, and Student information.</p>
            <div class="module-list">
              ${Object.entries(features)
                .map(([id, feature]) => `
                  <a href="#common/${id}" class="module-button" routerLink="common/${id}">
                    ${feature.icon} ${feature.title}
                  </a>
                `)
                .join("")}
            </div>
          </div>
        `;

        return fallbackDiv;
      }
    }
  }

  // Make available globally
  window.CommonHomeTemplate = CommonHomeTemplate;
}
