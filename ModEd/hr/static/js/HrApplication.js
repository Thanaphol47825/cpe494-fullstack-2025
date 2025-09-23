class HrApplication {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.rootURL = window.__ROOT_URL__ || RootURL || "";

    this.features = {
      'instructor/create': {
        title: 'Add Instructor',
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
      'resignation-student-request/create': {
        title: 'Add Resignation Request for Student',
        load: async () => {
          if (!window.HrResignationStudentFormFeature) {
            await this.templateEngine.fetchModule('/hr/static/js/features/ResignationStudentForm.js');
          }
          return () => new window.HrResignationStudentFormFeature(this.templateEngine, this.rootURL);
        }
      },
      'student-leave-create': {
        title: 'Create Student Leave Request',
        load: async () => {
          if (!window.HrStudentLeaveCreateFeature) {
            await this.templateEngine.fetchModule('/hr/static/js/features/StudentLeaveCreate.js');
          }
          return () => new window.HrStudentLeaveCreateFeature(this.templateEngine, this.rootURL);
        }
      },
      'resignation-instructor-request/create': {
        title: 'Instructor Resignation Request',
        load: async () => {
        if (!window.HrInstructorResignationFormFeature) {
          await this.templateEngine.fetchModule('/hr/static/js/features/InstructorResignationForm.js');
          }
          return () => new window.HrInstructorResignationFormFeature(this.templateEngine, this.rootURL);
        }
      }
    };

    console.log('HrApplication initialized with Core Template Engine');
  }

  async render() {
    console.log("Loading HR Module (orchestrator)");
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    return await this.#route();
  }

  async #route() {
    const raw = (location.hash || "").replace(/^#\/?/, "");
    const route = raw.startsWith('hr/') ? raw.slice(3) : raw;

    if (route && this.features[route]) {
      return await this.navigateTo(route);
    }
    this.renderMenu();
    return true;
  }

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

    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-action');
        location.hash = `#hr/${id}`;
        await this.navigateTo(id);
      });
    });
  }

  async navigateTo(id) {
    const featureMeta = this.features[id];
    if (!featureMeta) {
      console.error(`Unknown HR feature: ${id}`);
      return false;
    }

    try {
      const getInstance = await featureMeta.load();
      const feature = getInstance();
      return await feature.render();
    } catch (err) {
      console.error(`Failed to load/render HR feature '${id}'`, err);
      return false;
    }
  }
}

if (typeof window !== 'undefined') {
  window.HrApplication = HrApplication;
}