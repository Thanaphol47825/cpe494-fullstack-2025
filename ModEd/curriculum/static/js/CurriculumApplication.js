if (typeof window !== 'undefined' && !window.CurriculumApplication) {
  class CurriculumApplication extends BaseModuleApplication {

    models = [
      { label: "Curriculum", route: "curriculum/curriculum" },
      { label: "Course", route: "curriculum/course" },
      { label: "Class", route: "curriculum/class" },
      { label: "Class Material", route: "curriculum/classmaterial" },
      { label: "Course Plan", route: "curriculum/courseplan" },
    ];


    constructor(templateEngine) {
      super(templateEngine)
      this.setSubModuleBasePath('/curriculum/static/js')
      this.setupRoutes()
    }

    setupRoutes() {
      this.addRoute('', this.renderMainPage.bind(this))

      this.addRouteWithSubModule('/curriculum', this.renderCurriculum.bind(this), 'feature/CurriculumList.js')
      this.addRouteWithSubModule('/curriculum/:id', this.renderEditCurriculum.bind(this), 'feature/CurriculumEdit.js')
      this.addRouteWithSubModule('/curriculum/create', this.renderCreateCurriculum.bind(this), 'feature/CurriculumCreate.js')

      this.addRouteWithSubModule('/course', this.renderCourse.bind(this))
      this.addRouteWithSubModule('/course/create', this.renderCreateCourse.bind(this), 'feature/CourseCreate.js')

      this.addRouteWithSubModule('/class', this.renderClass.bind(this), 'feature/ClassList.js')
      this.addRouteWithSubModule('/class/create', this.renderCreateClass.bind(this), 'feature/ClassCreate.js')

      this.addRouteWithSubModule('/classmaterial', this.renderClassMaterial.bind(this), 'feature/ClassMaterialList.js')
      this.addRouteWithSubModule('/classmaterial/create', this.renderCreateClassMaterial.bind(this), 'feature/ClassMaterialCreate.js')

      this.addRouteWithSubModule('/courseplan', this.renderCoursePlan.bind(this))
      this.addRouteWithSubModule('/courseplan/create', this.renderCreateCoursePlan.bind(this), 'CoursePlanCreate.js')
    }

    async renderMainPage() {
      // Define unique icons for each model
      const modelIcons = {
        "Curriculum": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>`,
        "Course": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>`,
        "Class": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>`,
        "Class Material": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
        "Course Plan": `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`
      };

      const modelColors = {
        "Curriculum": "from-emerald-500 to-teal-600",
        "Course": "from-amber-500 to-orange-600",
        "Class": "from-purple-500 to-indigo-600",
        "Class Material": "from-rose-500 to-pink-600",
        "Course Plan": "from-cyan-500 to-blue-600"
      };

      let cardsHTML = '';
      this.models.forEach((model, index) => {
        const icon = modelIcons[model.label] || modelIcons["Course"];
        const color = modelColors[model.label] || "from-gray-500 to-gray-600";

        cardsHTML += `
        <div class="curriculum-card bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-${model.label === 'Curriculum' ? 'emerald' : model.label === 'Course' ? 'amber' : model.label === 'Class' ? 'purple' : model.label === 'Class Material' ? 'rose' : 'cyan'}-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          
          <!-- Icon Container -->
          <div class="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br ${color} rounded-2xl mb-5 shadow-lg group-hover:rotate-6 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${icon}
            </svg>
          </div>
          
          <!-- Content -->
          <div class="relative z-10">
            <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">${model.label}</h3>
            <p class="text-slate-600 mb-6 text-sm leading-relaxed">Educational ${model.label.toLowerCase()} management and administration tools</p>
            
            <!-- Action Buttons -->
            <div class="space-y-3">
              <button routerLink="${model.route}" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                Browse ${model.label}
              </button>
              <button routerLink="${model.route}/create" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${color} text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Create New
              </button>
            </div>
          </div>
        </div>`
      })

      this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <!-- Background Academic Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 animate-pulse"></div>
          <div class="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
        </div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <!-- Academic Header -->
          <div class="text-center mb-16">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl mb-6 shadow-2xl">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
            <h1 class="text-5xl font-extrabold text-slate-800 mb-4">
              <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Curriculum</span>
            </h1>
            <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 rounded-full"></div>
            <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Curriculum Module for organizing curriculum, courses, classes, class materials, and course plans
            </p>
          </div>

          <!-- Academic Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            ${cardsHTML}
          </div>

          <!-- Academic Footer -->
          <div class="text-center">
            <a routerLink="/" class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Return to ModEd Home
            </a>
          </div>
        </div>
      </div>
    `
    }

    async renderCurriculum() {
      if (window.CurriculumList) {
        const curriculumList = new window.CurriculumList(this.templateEngine);
        await curriculumList.render();
      } else {
        console.error('CurriculumList not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="red-text-600">
          Eror loading.
        </div>
      `;
      }
    }

    async renderEditCurriculum() {
      if (window.CurriculumEdit) {
        const curriculumEdit = new window.CurriculumEdit(this.templateEngine);
        await curriculumEdit.render();
      } else {
        console.error('CurriculumEdit not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="red-text-600">
          Eror loading.
        </div>
      `;
      }
    }

    async renderCreateCurriculum() {
      if (window.CurriculumCreate) {
        const curriculumCreate = new window.CurriculumCreate(this.templateEngine);
        await curriculumCreate.render();
      } else {
        console.error('CurriculumCreate not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="red-text-600">
          Eror loading.
        </div>
      `;
      }
    }

    async renderCourse() {
      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-courses">
        <h2>Course Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="curriculum/course/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Course</a>
        </div>
        
        <div class="course-list">
          <!-- course list will be rendered here -->
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
        </div>
      </div>
    `
    }
    async renderCreateCourse() {
      if (window.CourseCreate) {
        const feature = new window.CourseCreate(this);
        await feature.render();
      } else {
        console.error('CourseCreate not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
          <div class="text-red-600">Error loading.</div>
        `;
      }
    }

    async renderClass() {
      if (window.ClassList) {
        const classList = new window.ClassList(this);
        await classList.render();
      } else {
        console.error('ClassList class not found');
        this.templateEngine.mainContainer.innerHTML = '<div>Error: ClassList module not loaded</div>';
      }
    }

    async renderCreateClass() {
      if (window.ClassCreate) {
        const classCreate = new window.ClassCreate(this);
        await classCreate.render();
      } else {
        console.error('ClassCreate class not found');
        this.templateEngine.mainContainer.innerHTML = '<div>Error: ClassCreate module not loaded</div>';
      }
    }

    async renderClassMaterial() {
      if (window.ClassMaterialList) {
        const classMaterialList = new window.ClassMaterialList(this);
        await classMaterialList.render();
      } else {
        console.error('ClassMaterialList not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="red-text-600">
          Eror loading.
        </div>
      `;
      }
    }
    async renderCreateClassMaterial() {
      if (window.ClassMaterialCreate) {
        const formFeature = new window.ClassMaterialCreate(this);
        await formFeature.render();
      } else {
        console.error('ClassMaterialCreate not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="text-red-600">
          Error loading.
        </div>
      `;
      }
    }

    async renderCoursePlan() {
      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-courseplans">
        <h2>Course Plan Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="curriculum/courseplan/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Course Plan</a>
        </div>
        
        <div class="courseplan-list">
          <!-- course plan list will be rendered here -->
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
        </div>
      </div>
    `
    }
    async renderCreateCoursePlan() { }

    async render() {
      return await this.handleRoute(this.templateEngine.getCurrentPath())
    }
  }

  if (typeof window !== 'undefined') {
    window.CurriculumApplication = CurriculumApplication;
  }
}

