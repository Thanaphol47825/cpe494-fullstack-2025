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

    async loadTemplates() {
      if (!window.CurriculumHomeTemplate) {
        await this.loadSubModule('template/CurriculumHomeTemplate.js')
      }

      if (!window.FormTemplate) {
        await this.loadSubModule('template/CurriculumFormTemplate.js')
      }

      if (!window.ListTemplate) {
        await this.loadSubModule('template/CurriculumListTemplate.js')
      }
    }

    setupRoutes() {
      this.addRoute('', this.renderMainPage.bind(this))

      this.addRouteWithSubModule('/curriculum', this.renderCurriculum.bind(this), 'feature/CurriculumList.js')
      this.addRouteWithSubModule('/curriculum/:id', this.renderEditCurriculum.bind(this), 'feature/CurriculumEdit.js')
      this.addRouteWithSubModule('/curriculum/create', this.renderCreateCurriculum.bind(this), 'feature/CurriculumCreate.js')

      this.addRouteWithSubModule('/course', this.renderCourse.bind(this), 'feature/CourseList.js')
      this.addRouteWithSubModule('/course/create', this.renderCreateCourse.bind(this), 'feature/CourseCreate.js')

      this.addRouteWithSubModule('/class', this.renderClass.bind(this), 'feature/ClassList.js')
      this.addRouteWithSubModule('/class/create', this.renderCreateClass.bind(this), 'feature/ClassCreate.js')

      this.addRouteWithSubModule('/classmaterial', this.renderClassMaterial.bind(this), 'feature/ClassMaterialList.js')
      this.addRouteWithSubModule('/classmaterial/create', this.renderCreateClassMaterial.bind(this), 'feature/ClassMaterialCreate.js')

      this.addRouteWithSubModule('/courseplan', this.renderCoursePlan.bind(this), 'feature/CoursePlanList.js')
      this.addRouteWithSubModule('/courseplan/create', this.renderCreateCoursePlan.bind(this), 'feature/CoursePlanCreate.js')
    }

    async renderMainPage() {
      // clear main container
      this.templateEngine.mainContainer.innerHTML = "";

      // ตรวจสอบและโหลด CurriculumHomeTemplate ถ้ายังไม่ได้โหลด
      if (!window.CurriculumHomeTemplate && !window.FormTemplate) {
        console.log('Loading CurriculumHomeTemplate...');
        await this.loadTemplates();
      }

      // ใช้ CurriculumHomeTemplate แทน embedded HTML (ต้องใช้ await)
      console.log('Rendering main page with models:', this.models);
      const homeElement = await CurriculumHomeTemplate.getTemplate(this.models);
      this.templateEngine.mainContainer.appendChild(homeElement);
    }

    async renderCurriculum() {
      await this.loadTemplates();
      
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
      await this.loadTemplates();
      
      if (window.CurriculumCreate) {
        const curriculumCreate = new window.CurriculumCreate(this);
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
      await this.loadTemplates();
      
      if (window.CourseList) {
        const courseList = new window.CourseList(this);
        await courseList.render();
      } else {
        console.error('CourseList not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
          <div class="text-red-600">Error loading CourseList.</div>`;
      }
    }
    async renderCreateCourse() {
      await this.loadTemplates();
      
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
      await this.loadTemplates();
      
      if (window.ClassList) {
        const classList = new window.ClassList(this);
        await classList.render();
      } else {
        console.error('ClassList class not found');
        this.templateEngine.mainContainer.innerHTML = '<div>Error: ClassList module not loaded</div>';
      }
    }

    async renderCreateClass() {
      await this.loadTemplates();
      
      if (window.ClassCreate) {
        const classCreate = new window.ClassCreate(this);
        await classCreate.render();
      } else {
        console.error('ClassCreate class not found');
        this.templateEngine.mainContainer.innerHTML = '<div>Error: ClassCreate module not loaded</div>';
      }
    }

    async renderClassMaterial() {
      await this.loadTemplates();
      
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
      await this.loadTemplates();
      
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
      await this.loadTemplates();
      
      if (window.CoursePlanList) {
        const CoursePlanList = new window.CoursePlanList(this);
        await CoursePlanList.render();
      } else {
        console.error('CoursePlanList not available after loading');
        this.templateEngine.mainContainer.innerHTML = `
        <div class="red-text-600">
          Eror loading.
        </div>
      `;
      }
    }
    async renderCreateCoursePlan() {
      await this.loadTemplates();
      
      if (window.CoursePlanCreate) {
        const coursePlanCreate = new window.CoursePlanCreate(this);
        await coursePlanCreate.render();
      } else {
        console.error('CoursePlanCreate coursePlan not found');
        this.templateEngine.mainContainer.innerHTML = '<div>Error: CoursePlanCreate module not loaded</div>';
      }
    }

    async render() {
      return await this.handleRoute(this.templateEngine.getCurrentPath())
    }
  }

  if (typeof window !== 'undefined') {
    window.CurriculumApplication = CurriculumApplication;
  }
}

