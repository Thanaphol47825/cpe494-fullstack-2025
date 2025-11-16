if (typeof window !== 'undefined' && !window.CurriculumApplication) {
  class CurriculumApplication extends BaseModuleApplication {

    models = [
      { label: "Curriculum", route: "curriculum/curriculum" },
      { label: "Course", route: "curriculum/course" },
      { label: "Class", route: "curriculum/class" },
      { label: "Class Material", route: "curriculum/classmaterial" },
      { label: "Course Plan", route: "curriculum/courseplan" },
      { label: "Skill", route: "curriculum/skill" },
      { label: "Course Skill", route: "curriculum/courseskill" },
    ];


    constructor(templateEngine) {
      super(templateEngine)
      this.setSubModuleBasePath('/curriculum/static/js')
      this.setupRoutes()
    }

    async loadTemplates() {
      if (!window.RoleManager) {
        await this.loadSubModule('util/RoleManager.js')
      }

      if (!window.CurriculumErrorTemplate) {
        await this.loadSubModule('template/CurriculumErrorTemplate.js')
      }

      if (!window.CurriculumHomeTemplate) {
        await this.loadSubModule('template/CurriculumHomeTemplate.js')
      }

      if (!window.FormTemplate) {
        await this.loadSubModule('template/CurriculumFormTemplate.js')
      }

      if (!window.ListTemplate) {
        await this.loadSubModule('template/CurriculumListTemplate.js')
      }

      if (!window.EditModalTemplate) {
        await this.loadSubModule('template/CurriculumEditModalTemplate.js');
      }

      if (!window.CourseExtension) {
        await this.loadSubModule('feature/CourseExtension.js');
      }

      if (!window.CourseSkillList) {
        await this.loadSubModule('feature/CourseSkillList.js');
      }

    }

    setupRoutes() {
      this.addRoute('', this.renderMainPage.bind(this))

      this.addRouteWithSubModule('/curriculum', this.renderCurriculum.bind(this), 'feature/CurriculumList.js')
      this.addRouteWithSubModule('/curriculum/create', this.renderCreateCurriculum.bind(this), 'feature/CurriculumCreate.js')

      this.addRouteWithSubModule('/course', this.renderCourse.bind(this), 'feature/CourseList.js')
      this.addRouteWithSubModule('/course/create', this.renderCreateCourse.bind(this), 'feature/CourseCreate.js')

      this.addRouteWithSubModule('/class', this.renderClass.bind(this), 'feature/ClassList.js')
      this.addRouteWithSubModule('/class/create', this.renderCreateClass.bind(this), 'feature/ClassCreate.js')

      this.addRouteWithSubModule('/classmaterial', this.renderClassMaterial.bind(this), 'feature/ClassMaterialList.js')
      this.addRouteWithSubModule('/classmaterial/create', this.renderCreateClassMaterial.bind(this), 'feature/ClassMaterialCreate.js')

      this.addRouteWithSubModule('/courseplan', this.renderCoursePlan.bind(this), 'feature/CoursePlanList.js')
      this.addRouteWithSubModule('/courseplan/create', this.renderCreateCoursePlan.bind(this), 'feature/CoursePlanCreate.js')

      this.addRouteWithSubModule('/skill', this.renderSkill.bind(this), 'feature/SkillList.js')
      this.addRouteWithSubModule('/skill/create', this.renderCreateSkill.bind(this), 'feature/SkillCreate.js')

      this.addRouteWithSubModule('/courseskill', this.renderCourseSkill.bind(this), 'feature/CourseSkillList.js')
      this.addRouteWithSubModule('/courseskill/create', this.renderCreateCourseSkill.bind(this), 'feature/CourseSkillCreate.js')
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
        const curriculumList = new window.CurriculumList(this);
        await curriculumList.render();
      } else {
        console.error('CurriculumList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer, 
          'CurriculumList',
          '/curriculum'
        );
      }
    }

    async renderCreateCurriculum() {
      await this.loadTemplates();

      if (window.CurriculumCreate) {
        const curriculumCreate = new window.CurriculumCreate(this);
        await curriculumCreate.render();
      } else {
        console.error('CurriculumCreate not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CurriculumCreate',
          '/curriculum/curriculum'
        );
      }
    }

    async renderCourse() {
      await this.loadTemplates();

      if (window.CourseList) {
        const courseList = new window.CourseList(this);
        if (window.CourseSkillList) {
          const courseSkillList = new window.CourseSkillList(this)
          courseList.appendExtension(courseSkillList)
        } else {
          console.error("CourseListSkill not available after loading")
        }
        await courseList.render();
      } else {
        console.error('CourseList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CourseList',
          '/curriculum'
        );
      }
    }

    async renderCreateCourse() {
      await this.loadTemplates();

      if (window.CourseCreate) {
        const feature = new window.CourseCreate(this);
        await feature.render();
      } else {
        console.error('CourseCreate not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CourseCreate',
          '/curriculum/course'
        );
      }
    }

    async renderClass() {
      await this.loadTemplates();

      if (window.ClassList) {
        const classList = new window.ClassList(this);
        await classList.render();
      } else {
        console.error('ClassList class not found');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'ClassList',
          '/curriculum'
        );
      }
    }

    async renderCreateClass() {
      await this.loadTemplates();

      if (window.ClassCreate) {
        const classCreate = new window.ClassCreate(this);
        await classCreate.render();
      } else {
        console.error('ClassCreate class not found');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'ClassCreate',
          '/curriculum/class'
        );
      }
    }

    async renderClassMaterial() {
      await this.loadTemplates();

      if (window.ClassMaterialList) {
        const classMaterialList = new window.ClassMaterialList(this);
        await classMaterialList.render();
      } else {
        console.error('ClassMaterialList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'ClassMaterialList',
          '/curriculum'
        );
      }
    }
    async renderCreateClassMaterial() {
      await this.loadTemplates();

      if (window.ClassMaterialCreate) {
        const formFeature = new window.ClassMaterialCreate(this);
        await formFeature.render();
      } else {
        console.error('ClassMaterialCreate not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'ClassMaterialCreate',
          '/curriculum/classmaterial'
        );
      }
    }

    async renderCoursePlan() {
      await this.loadTemplates();

      if (window.CoursePlanList) {
        const CoursePlanList = new window.CoursePlanList(this);
        await CoursePlanList.render();
      } else {
        console.error('CoursePlanList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CoursePlanList',
          '/curriculum'
        );
      }
    }
    async renderCreateCoursePlan() {
      await this.loadTemplates();

      if (window.CoursePlanCreate) {
        const coursePlanCreate = new window.CoursePlanCreate(this);
        await coursePlanCreate.render();
      } else {
        console.error('CoursePlanCreate coursePlan not found');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CoursePlanCreate',
          '/curriculum/courseplan'
        );
      }
    }

    async renderSkill() {
      await this.loadTemplates();

      if (window.SkillList) {
        const skillList = new window.SkillList(this);
        await skillList.render();
      } else {
        console.error('SkillList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'SkillList',
          '/curriculum'
        );
      }
    }

    async renderCreateSkill() {
      await this.loadTemplates();

      if (window.SkillCreate) {
        const skillCreate = new window.SkillCreate(this);
        await skillCreate.render();
      } else {
        console.error('SkillCreate not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'SkillCreate',
          '/curriculum/skill'
        );
      }
    }

    async renderCourseSkill() {
      await this.loadTemplates();

      if (window.CourseSkillList) {
        const courseSkillList = new window.CourseSkillList(this);
        await courseSkillList.render();
      } else {
        console.error('CourseSkillList not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CourseSkillList',
          '/curriculum'
        );
      }
    }

    async renderCreateCourseSkill() {
      await this.loadTemplates();

      if (window.CourseSkillCreate) {
        const courseSkillCreate = new window.CourseSkillCreate(this);
        await courseSkillCreate.render();
      } else {
        console.error('CourseSkillCreate not available after loading');
        await CurriculumErrorTemplate.displayModuleNotLoaded(
          this.templateEngine.mainContainer,
          'CourseSkillCreate',
          '/curriculum/courseskill'
        );
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

