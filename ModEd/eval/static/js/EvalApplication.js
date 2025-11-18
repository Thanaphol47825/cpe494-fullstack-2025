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
    // Instructor track modules
    this.teacherTrackAssignmentSubmission = null;
    this.teacherTrackQuizSubmission = null;
    // Student view modules
    this.studentViewAssignments = null;
    this.studentViewQuizzes = null;
    this.studentQuizTaking = null;
    
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
      // Use separate routes for student/instructor views instead of query parameters
      this.addRoute('', () => this.render('instructor')); // Default to instructor
      this.addRoute('student', () => this.render('student'));
      this.addRoute('instructor', () => this.render('instructor'));
      // Instructor routes
      this.addRoute('assignment/create', () => this.renderAssignmentCreate());
      this.addRoute('assignment', () => this.renderAssignmentList());
      this.addRoute('quiz/create', () => this.renderQuizCreate());
      this.addRoute('quiz', () => this.renderQuizList());
      this.addRoute('track/assignment', () => this.renderTeacherTrackAssignmentSubmission());
      this.addRoute('track/quiz', () => this.renderTeacherTrackQuizSubmission());
      // Student routes
      this.addRoute('student/assignments', () => this.renderStudentViewAssignments());
      this.addRoute('student/quizzes', () => this.renderStudentViewQuizzes());
      this.addRoute('student/quiz/take/:id', (params) => this.renderStudentQuizTaking(params.id));
      // Legacy routes (for backward compatibility)
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

  async render(viewType = 'instructor') {
    // Clear main container
    this.templateEngine.mainContainer.innerHTML = "";

    // Check and load EvalHomeTemplate if not already loaded
    if (!window.EvalHomeTemplate && !window.FormTemplate) {
      console.log('Loading EvalHomeTemplate...');
      await this.loadTemplates();
    }

    // Use EvalHomeTemplate instead of embedded HTML (must use await)
    // Pass viewType to determine which UI to show
    console.log('Rendering main page with models:', this.models, 'viewType:', viewType);
    const homeElement = await EvalHomeTemplate.getTemplate(this.models, this.templateEngine, viewType);
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

  async renderTeacherTrackAssignmentSubmission() {
    if (!this.teacherTrackAssignmentSubmission) this.teacherTrackAssignmentSubmission = new TeacherTrackAssignmentSubmission(this);
    await this.teacherTrackAssignmentSubmission.initialize();
  }

  async renderTeacherTrackQuizSubmission() {
    if (!this.teacherTrackQuizSubmission) this.teacherTrackQuizSubmission = new TeacherTrackQuizSubmission(this);
    await this.teacherTrackQuizSubmission.initialize();
  }

  async renderStudentViewAssignments() {
    if (!this.studentViewAssignments) this.studentViewAssignments = new StudentViewAssignments(this);
    await this.studentViewAssignments.initialize();
  }

  async renderStudentViewQuizzes() {
    if (!this.studentViewQuizzes) this.studentViewQuizzes = new StudentViewQuizzes(this);
    await this.studentViewQuizzes.initialize();
  }

  async renderStudentQuizTaking(quizId) {
    if (!this.studentQuizTaking) this.studentQuizTaking = new StudentQuizTaking(this);
    await this.studentQuizTaking.initialize();
  }

  // Override handleRoute to strip query parameters before route matching
  async handleRoute(fullPath) {
    const moduleBasePath = this.getModuleBasePath();
    let subPath = this.templateEngine.getSubPath(moduleBasePath, fullPath);

    // Strip query parameters from subPath for route matching
    // Query parameters will still be available in window.location.hash
    if (subPath && subPath.includes('?')) {
      subPath = subPath.split('?')[0];
    }

    console.log(`Eval routing - Full: ${fullPath}, Base: ${moduleBasePath}, Sub: ${subPath}`);

    // Try to find exact match first
    if (this.routes.has(subPath)) {
      const handler = this.routes.get(subPath);
      await handler();
      return true;
    }

    // Try pattern matching for dynamic routes
    for (const [pattern, handler] of this.routes.entries()) {
      if (this.matchRoute(pattern, subPath)) {
        await handler(this.extractParams(pattern, subPath));
        return true;
      }
    }

    console.log("No matching sub-route found.");

    // If no sub-route found and we have a default, use it
    if (this.routes.has(this.defaultRoute)) {
      const moduleBasePath = this.getModuleBasePath();
      // Reset to default route
      location.hash = `#${moduleBasePath}/${this.defaultRoute}`;
      const handler = this.routes.get(this.defaultRoute);
      await handler();
      return true;
    }

    return false;
  }
}
