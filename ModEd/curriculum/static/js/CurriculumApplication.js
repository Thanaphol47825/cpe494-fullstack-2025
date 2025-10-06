if (typeof window !== 'undefined' && window.CurriculumApplication) {

} else {
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

      this.addRouteWithSubModule('/curriculum', this.renderCurriculum.bind(this))
      this.addRouteWithSubModule('/curriculum/create', this.renderCreateCurriculum.bind(this), 'CurriculumCreate.js')

      this.addRouteWithSubModule('/course', this.renderCourse.bind(this))
      this.addRouteWithSubModule('/course/create', this.renderCreateCourse.bind(this), 'CourseCreate.js')

      this.addRouteWithSubModule('/class', this.renderClass.bind(this))
      this.addRouteWithSubModule('/class/create', this.renderCreateClass.bind(this), 'ClassCreate.js')

      this.addRouteWithSubModule('/classmaterial', this.renderClassMaterial.bind(this))
      this.addRouteWithSubModule('/classmaterial/create', this.renderCreateClassMaterial.bind(this), 'ClassMaterialCreate.js')

      this.addRouteWithSubModule('/courseplan', this.renderCoursePlan.bind(this))
      this.addRouteWithSubModule('/courseplan/create', this.renderCreateCoursePlan.bind(this), 'CoursePlanCreate.js')
    }

    async renderMainPage() {
      let cardsHTML = '';
      this.models.forEach(model => {
        cardsHTML += `
        <div class="card" 
          style="border:1px solid #ddd; padding:16px; border-radius:10px;
          display:flex; flex-direction:column; gap:10px; width:100%; max-width:520px; box-sizing:border-box;">
          <h4 style="font-weight: bold; font-size: large;">${model.label}</h4>
          <p>Manage ${model.label}</p>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
            <div class="mx-auto flex flex-row gap-4">
              <button routerLink="${model.route}" class="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">View All</button>
              <button routerLink="${model.route}/create" class="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Add New</button>
            </div>
          </div>
        </div>`
      })

      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-main" style="display:flex; flex-direction:column; gap:16px;">
        <h2>Basic Curriculum Management</h2>
        <div class="curriculum-menu" 
          style="display:flex; flex-direction:column; gap:12px; margin: 12px 0 20px; align-items:center;">
          ${cardsHTML}
        </div>
        <div style="margin-top: 20px;">
          <a routerLink="/" style="color: #6c757d;">← Back to Main Menu</a>
        </div>
      </div>
    `
    }

    async renderCurriculum() {
      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-curriculums">
        <h2>Curriculum Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="curriculum/curriculum/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Curriculum</a>
        </div>
        
        <div class="curriculum-list">
          <!-- Curriculum list will be rendered here -->
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
        </div>
      </div>
    `
    }

    async renderCreateCurriculum() {
      if (window.CurriculumCreate) {
        const formFeature = new window.CurriculumCreate(this.templateEngine, this.rootURL);
        await formFeature.render();
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
    async renderCreateCourse() { }

    async renderClass() {
      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-classes">
        <h2>Class Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="curriculum/class/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Class</a>
        </div>
        
        <div class="class-list">
          <!-- class list will be rendered here -->
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
        </div>
      </div>
    `
    }
    async renderCreateClass() { }

    async renderClassMaterial() {
      this.templateEngine.mainContainer.innerHTML = `
      <div class="curriculum-classmaterials">
        <h2>Class Material Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="curriculum/classmaterial/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Class Material</a>
        </div>
        
        <div class="classmaterial-list">
          <!-- class material list will be rendered here -->
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
        </div>
      </div>
    `
    }
    async renderCreateClassMaterial() { 
      if (window.ClassMaterialCreate) {
        const formFeature = new window.ClassMaterialCreate(this.templateEngine, this.rootURL);
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

