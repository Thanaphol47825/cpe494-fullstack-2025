if (typeof window !== "undefined" && !window.InternshipPageTemplate) {
  class InternshipPageTemplate {
    /**
     * Loads the core ModelDisplay.tpl template if it's not already available.
     * @param {object} templateEngine - The application's template engine instance.
     */
    static async loadModelDisplayTemplate(templateEngine) {
      if (templateEngine.template && templateEngine.template.ModelDisplay) {
        console.log("ModelDisplay.tpl is already loaded.");
        return;
      }

      console.log(
        "Attempting to load core templates including ModelDisplay.tpl..."
      );
      try {
        // The template engine's fetch method should load all core templates.
        await templateEngine.fetchTemplate();
        if (templateEngine.template && templateEngine.template.ModelDisplay) {
          console.log(
            "ModelDisplay.tpl loaded successfully via templateEngine."
          );
        } else {
          throw new Error(
            "ModelDisplay.tpl not found after fetching templates."
          );
        }
      } catch (error) {
        console.error("Failed to load ModelDisplay.tpl:", error);
        throw error; // Re-throw to be caught by the render method.
      }
    }

    /**
     * Renders the full page using ModelDisplay.tpl as the base.
     * @param {object} pageConfig - Configuration for the page (title, description, etc.).
     * @param {string} contentHTML - The main HTML content (the form) to embed.
     * @param {object} templateEngine - The application's template engine.
     * @returns {HTMLElement} The rendered page element.
     */
    static async render(pageConfig, contentHTML, templateEngine) {
      try {
        // Ensure the core template is loaded.
        await this.loadModelDisplayTemplate(templateEngine);

        // Prepare template data for ModelDisplay.tpl
        const templateData = {
          page_title: pageConfig.title || "Internship Management",
          page_description: pageConfig.description || "",
          ShowBackButton: pageConfig.showBackButton || false,
          BackButtonText: pageConfig.backButtonText || "Back",
          BackButtonRoute: pageConfig.backButtonRoute || "",

          // Content sections
          HeaderContent: this.createHeaderContent(pageConfig),
          MainContent: contentHTML || "",
          FooterContent: pageConfig.footerContent || "",

          // CSS classes
          PageClass: pageConfig.pageClass || "",
          HeaderClass: pageConfig.headerClass || "",
          ContentClass: pageConfig.contentClass || "",
        };

        // Render using ModelDisplay template
        const pageHTML = Mustache.render(
          templateEngine.template.ModelDisplay,
          templateData
        );
        return templateEngine.create(pageHTML);
      } catch (error) {
        console.error(
          "Could not render with ModelDisplay.tpl, using fallback.",
          error
        );
        // If template loading or rendering fails, use a safe fallback.
        const fallbackHTML = this.createFallbackHTML(pageConfig, contentHTML);
        return templateEngine.create(fallbackHTML);
      }
    }

    /**
     * Creates a fallback HTML structure if the main template fails.
     */
    static createFallbackHTML(pageConfig, contentHTML) {
      return `
        <div class="bg-gray-100 min-h-screen py-8 ${
          pageConfig.pageClass || ""
        }">
          <div class="max-w-4xl mx-auto px-4">
            <header class="mb-6 ${pageConfig.headerClass || ""}">
              ${
                pageConfig.showBackButton
                  ? `<button data-back-button data-route="${
                      pageConfig.backButtonRoute
                    }" class="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                      ${pageConfig.backButtonText || "Back"}
                    </button>`
                  : ""
              }
              <h1 class="text-3xl font-bold text-gray-900">${
                pageConfig.title || "Page"
              }</h1>
              ${
                pageConfig.description
                  ? `<p class="mt-2 text-sm text-gray-600">${pageConfig.description}</p>`
                  : ""
              }
            </header>
            <main class="bg-white rounded-lg shadow p-6 ${
              pageConfig.contentClass || ""
            }">
              ${contentHTML || "<p>Content could not be loaded.</p>"}
            </main>
          </div>
        </div>
      `;
    }

    static createHeaderContent(pageConfig) {
      const iconHTML = pageConfig.headerIcon
        ? `<div class="header-icon ${
            pageConfig.headerIcon.class || ""
          }">${this.getIcon(pageConfig.headerIcon.type)}</div>`
        : "";

      // This now only contains the header content, title/description are in the main template
      return `
        <div class="internship-page-header">
          ${iconHTML}
          <div class="header-text">
            ${
              pageConfig.subtitle
                ? `<p class="text-lg text-gray-600 mt-1">${pageConfig.subtitle}</p>`
                : ""
            }
          </div>
        </div>
      `;
    }

    static getIcon(iconType) {
      // Simplified icon retrieval for demonstration
      switch (iconType) {
        case "plus":
          return `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>`;
        case "edit":
          return `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5l4 4l-1.5 1.5l-4 -4z" />
                    <path d="M4 20l4 -4l1.5 1.5l-4 4z" />
                  </svg>`;
        // Add more icons as needed
        default:
          return "";
      }
    }

    // --- UI Utility Methods ---
    static showLoading(formElement, message = "Loading...") {
      const submitButton = formElement.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ${message}
        `;
      }
    }

    static hideLoading(formElement, originalText = "Create Intern Student") {
      const submitButton = formElement.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }

    static showError(message, container) {
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4";
      errorDiv.textContent = message;
      container.prepend(errorDiv);
    }

    static showSuccess(message, container) {
      const successDiv = document.createElement("div");
      successDiv.className =
        "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4";
      successDiv.textContent = message;
      container.prepend(successDiv);
    }
  }

  window.InternshipPageTemplate = InternshipPageTemplate;
}
