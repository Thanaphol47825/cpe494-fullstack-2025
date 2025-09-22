// 📍 ไฟล์: /hr/static/js/HrApplication.js
// 🎯 Orchestrator for HR feature modules (menu + routing to feature modules)

class HrApplication {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.rootURL = window.__ROOT_URL__ || RootURL || "";

    // Feature registry: add new HR features here
    // key: action id; value: loader + renderer
    this.features = {
      'instructor/create': {
        title: 'Add Instructor',
        // Lazy loader for the feature script
        load: async () => {
          if (!window.HrInstructorFormFeature) {
            await this.templateEngine.fetchModule('/hr/static/js/features/InstructorForm.js');
          }
          return () => new window.HrInstructorFormFeature(this.templateEngine, this.rootURL);
        }
      },
      'student/create': {
        title: 'Add Student',
        load: async () => {
          if (!window.HrStudentFormFeature) {
            await this.templateEngine.fetchModule('/hr/static/js/features/StudentForm.js');
          }
          return () => new window.HrStudentFormFeature(this.templateEngine, this.rootURL);
        }
      },
      'resignation-student-request': {
        title: 'Add Resignation Request for Student',
        load: async () => {
          if (!window.HrResignationStudentFormFeature) {
            await this.templateEngine.fetchModule('/hr/static/js/features/ResignationStudentForm.js');
          }
          return () => new window.HrResignationStudentFormFeature(this.templateEngine, this.rootURL);
        }
      }
      // In the future: add more features like 'student/create', 'instructor/resign', etc.
    };

    // Optional: handle hash routing within HR module
    window.addEventListener('hashchange', () => this.#route());

    console.log('✅ HrApplication initialized with Core Template Engine');
  }

  // 🚀 Main render method - เรียกจาก Core TemplateEngine
  async render() {
    console.log("🎯 Loading HR Module (orchestrator)");
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("❌ Template engine or main container not found");
      return false;
    }

    // Default: show HR menu; if hash matches a feature, route to it
    return await this.#route();
  }

  async #route() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    // Accept both 'hr/xxx' and 'xxx' (when coming from outside or direct click)
    const route = raw.startsWith('hr/') ? raw.slice(3) : raw;

    if (route && this.features[route]) {
      return await this.navigateTo(route);
    }
    // Otherwise render the HR features menu
    this.renderMenu();
    return true;
  }

  // 📋 Render HR menu with available actions
  renderMenu() {
    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const items = Object.entries(this.features).map(([id, f]) => {
      return `<li>
        <button data-action="${id}" class="text-blue-700 underline hover:text-blue-900">${f.title}</button>
      </li>`;
    }).join('');

    const html = `
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">HR Module</h2>
        <p class="text-gray-700">Select an action:</p>
        <ul class="list-disc pl-6 space-y-2">${items}</ul>
      </div>
    `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);

    // Wire up menu actions
    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-action');
        // update hash to enable back/forward navigation
        location.hash = `#hr/${id}`;
        await this.navigateTo(id);
      });
    });
  }

  // 🚦 Navigate to a registered HR feature by id
  async navigateTo(id) {
    const featureMeta = this.features[id];
    if (!featureMeta) {
      console.error(`❌ Unknown HR feature: ${id}`);
      return false;
    }

    try {
      const getInstance = await featureMeta.load();
      const feature = getInstance();
      return await feature.render();
    } catch (err) {
      console.error(`❌ Failed to load/render HR feature '${id}'`, err);
      return false;
    }
  }
}

// 🌐 Export to global scope
if (typeof window !== 'undefined') {
  window.HrApplication = HrApplication;
}

console.log("📦 HrApplication loaded - Ready for Core Template Engine integration");