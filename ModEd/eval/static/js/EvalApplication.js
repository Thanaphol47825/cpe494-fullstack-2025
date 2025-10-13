// EvalApplication - Main Application Class
class EvalApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine);
    
    // Initialize Eval-specific properties
    this.moduleName = 'eval';
    this.moduleVersion = '1.0.0';
    this.isInitialized = false;
    this.rootURL = window.__ROOT_URL__ || "";
    
    // Initialize feature modules
    this.assignmentCreate = null;
    this.assignmentManage = null;
    this.quizCreate = null;
    this.quizManage = null;
    this.quizSubmissionCreate = null;
    this.submissionCreate = null;
    this.submissionManage = null;
    
    // Make this instance globally accessible
    window.evalApp = this;
    
    // Initialize the application
    this.init();
  }

  async render() {
    // Render the main eval module page with cards like other modules
    this.templateEngine.mainContainer.innerHTML = this.renderMainPage();
  }

  renderMainPage() {
    return `
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <!-- Animated background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div class="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <!-- Header Section with unique design -->
          <div class="text-center mb-16">
            <div class="relative inline-block mb-8">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div class="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 rounded-full">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 tracking-tight">
              Evaluation
            </h1>
            <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Manage assignments, quizzes, submissions, and evaluations
            </p>
          </div>

          <!-- Main Menu with unique card design -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            <!-- Assignment Management Card -->
            <div class="group relative">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div class="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 transform group-hover:scale-105">
                <div class="flex items-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Assignment</h3>
                <p class="text-gray-400 mb-6 leading-relaxed">Design, distribute, and track assignments</p>
                <div class="space-y-3">
                  <a routerLink="eval/assignment/create" class="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create Assignment
                    </div>
                  </a>
                  <a routerLink="eval/assignment" class="block w-full bg-gray-700/50 text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600 hover:border-emerald-500/50">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      Manage Assignments
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Quiz Submission Card -->
            <div class="group relative">
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div class="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 transform group-hover:scale-105">
                <div class="flex items-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Quiz</h3>
                <p class="text-gray-400 mb-6 leading-relaxed">Quiz management with grading and feedback</p>
                <div class="space-y-3">
                  <a routerLink="eval/quiz/create" class="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create Quiz
                    </div>
                  </a>
                  <a routerLink="eval/quiz" class="block w-full bg-gray-700/50 text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600 hover:border-orange-500/50">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      Manage Quizzes
                    </div>
                  </a>
                  <a routerLink="eval/quiz/submission/create" class="block w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Submit Quiz
                    </div>
                  </a>
                  <a routerLink="eval/quiz/submission" class="block w-full bg-gray-700/50 text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600 hover:border-orange-500/50">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      Manage Quiz Submissions
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- General Submissions Card -->
            <div class="group relative">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div class="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 transform group-hover:scale-105">
                <div class="flex items-center mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Submission</h3>
                <p class="text-gray-400 mb-6 leading-relaxed">Submission management</p>
                <div class="space-y-3">
                  <a routerLink="eval/submission/create" class="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create Submission
                    </div>
                  </a>
                  <a routerLink="eval/submission" class="block w-full bg-gray-700/50 text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-600/50 transition-all duration-300 border border-gray-600 hover:border-purple-500/50">
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      Manage Submissions
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Back Button -->
          <div class="text-center">
            <a routerLink="/" class="px-6 py-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium cursor-pointer">
              ← Back
            </a>
          </div>
        </div>
      </div>
    `;
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
      this.addRoute('quiz/submission/create', () => this.renderQuizSubmissionCreate());
      this.addRoute('quiz/submission', () => this.renderQuizSubmissionList());
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



  async renderAssignmentCreate() {
    if (!this.assignmentCreate) this.assignmentCreate = new AssignmentCreate(this);
    await this.assignmentCreate.initialize();
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

  async renderAssignmentList() {
    if (!this.assignmentManage) this.assignmentManage = new AssignmentManage(this);
    await this.assignmentManage.initialize();
  }

  async renderQuizSubmissionList() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gray-50 border-b border-gray-200">
              <h2 class="text-2xl font-semibold text-gray-800">Quiz Submissions</h2>
            </div>
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-800">All Quiz Submissions</h3>
                <a routerLink="eval/quiz/submission/create" class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Submit Quiz
                </a>
              </div>
              <div id="quiz-submission-demo"></div>
              <div class="text-center mt-8">
                <a routerLink="eval" class="px-6 py-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium cursor-pointer">← Back</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (!this.quizSubmissionCreate) this.quizSubmissionCreate = new QuizSubmissionCreate();
    await this.quizSubmissionCreate.initialize();
  }

  async renderSubmissionList() {
    if (!this.submissionManage) this.submissionManage = new SubmissionManage(this);
    await this.submissionManage.initialize();
  }
}
