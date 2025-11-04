// EvalApplication - Main Application Class using core templates
class EvalApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine);
    
    // Initialize Eval-specific properties
    this.moduleName = 'eval';
    this.moduleVersion = '1.0.0';
    this.isInitialized = false;
    this.rootURL = RootURL || "";
    
    // Initialize feature modules
    this.assignmentCreate = null;
    this.assignmentManage = null;
    this.quizCreate = null;
    this.quizManage = null;
    this.quizSubmissionCreate = null;
    this.submissionCreate = null;
    this.submissionManage = null;
    
    // Define models for the home template
    this.models = [
      { label: "Assignment", route: "/assignment" },
      { label: "Quiz", route: "/quiz" },
      { label: "Submission", route: "/submission" }
    ];
    
    // Make this instance globally accessible
    window.evalApp = this;
    
    // Initialize the application
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Register routes
      this.addRoute('', () => this.render());
      this.addRoute('assignment/create', () => this.renderAssignmentCreate());
      this.addRoute('assignment', () => this.renderAssignmentList());
      this.addRoute('quiz/create', () => this.renderQuizCreate());
      this.addRoute('quiz', () => this.renderQuizList());
      this.addRoute('quizsubmission/create', () => this.renderQuizSubmissionCreate());
      this.addRoute('submission/create', () => this.renderSubmissionCreate());
      this.addRoute('submission', () => this.renderSubmissionList());
      
      // Set default route
      this.setDefaultRoute('');
      
      this.isInitialized = true;
      console.log('EvalApplication initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EvalApplication:', error);
    }
  }

  async render() {
    // Clear main container
    this.templateEngine.mainContainer.innerHTML = "";

    // Check and load EvalHomeTemplate if not already loaded
    if (!window.EvalHomeTemplate && !window.FormTemplate) {
      console.log('Loading EvalHomeTemplate...');
      await this.loadTemplates();
    }

    // Use EvalHomeTemplate instead of embedded HTML (must use await)
    console.log('Rendering main page with models:', this.models);
    const homeElement = await EvalHomeTemplate.getTemplate(this.models, this.templateEngine);
    this.templateEngine.mainContainer.appendChild(homeElement);
  }

  async renderAssignmentCreate() {
    if (!this.assignmentCreate) this.assignmentCreate = new AssignmentCreate(this);
    await this.assignmentCreate.initialize();
  }

  async renderAssignmentList() {
    if (!this.assignmentManage) this.assignmentManage = new AssignmentManage(this);
    await this.assignmentManage.initialize();
  }

  async renderQuizCreate() {
    if (!this.quizCreate) this.quizCreate = new QuizCreate(this);
    await this.quizCreate.initialize();
  }

  async renderQuizList() {
    if (!this.quizManage) this.quizManage = new QuizManage(this);
    await this.quizManage.initialize();
  }

  async renderQuizSubmissionCreate() {
    if (!this.quizSubmissionCreate) this.quizSubmissionCreate = new QuizSubmissionCreate(this);
    await this.quizSubmissionCreate.initialize();
  }

  async renderSubmissionCreate() {
    if (!this.submissionCreate) this.submissionCreate = new SubmissionCreate(this);
    await this.submissionCreate.initialize();
  }

  async renderSubmissionList() {
    if (!this.submissionManage) this.submissionManage = new SubmissionManage(this);
    await this.submissionManage.initialize();
  }
}
