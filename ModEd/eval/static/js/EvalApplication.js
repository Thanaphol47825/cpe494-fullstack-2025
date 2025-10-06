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
    this.assignmentCreate = new AssignmentCreate();
    this.quizSubmissionCreate = new QuizSubmissionCreate();
    this.submissionCreate = new SubmissionCreate();
    
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
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Evaluation Management</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Manage assignments, quizzes, submissions, and evaluations with our comprehensive assessment system</p>
          </div>

          <!-- Main Menu Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            <!-- Assignment Management Card -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">Assignment Management</h3>
                </div>
                <p class="text-gray-600 mb-6">Create and manage assignments for courses</p>
                <div class="flex flex-col space-y-2">
                  <a routerLink="eval/assignment/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Assignment
                  </a>
                  <a routerLink="eval/assignment" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Manage Assignments
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Quiz Submission Card -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">Quiz Submissions</h3>
                </div>
                <p class="text-gray-600 mb-6">Manage quiz submissions and grading</p>
                <div class="flex flex-col space-y-2">
                  <a routerLink="eval/quiz/submission/create" class="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Submit Quiz
                  </a>
                  <a routerLink="eval/quiz/submission" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Manage Quiz Submissions
                  </a>
                </div>
              </div>
            </div>
            
            <!-- General Submissions Card -->
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">General Submissions</h3>
                </div>
                <p class="text-gray-600 mb-6">Manage all types of student submissions</p>
                <div class="flex flex-col space-y-2">
                  <a routerLink="eval/submission/create" class="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create Submission
                  </a>
                  <a routerLink="eval/submission" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Manage Submissions
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Back to Main Menu -->
          <div class="text-center">
            <a routerLink="" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Main Menu
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
      this.addRoute('quiz/submission/create', () => this.renderQuizSubmissionCreate());
      this.addRoute('submission/create', () => this.renderSubmissionCreate());
      this.addRoute('assignment', () => this.renderAssignmentList());
      this.addRoute('quiz/submission', () => this.renderQuizSubmissionList());
      this.addRoute('submission', () => this.renderSubmissionList());
      
      // Set default route
      this.setDefaultRoute('');
      
      // Initialize all feature modules (but don't render them yet)
      await this.assignmentCreate.initialize();
      await this.quizSubmissionCreate.initialize();
      await this.submissionCreate.initialize();
      
      this.isInitialized = true;
      console.log('EvalApplication initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EvalApplication:', error);
    }
  }



  async renderAssignmentCreate() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 class="text-2xl font-semibold text-white">Create New Assignment</h2>
            </div>
            <div class="p-8">
              <div id="assignment-demo"></div>
              <div class="text-center mt-8">
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.assignmentCreate.initialize();
  }

  async renderQuizSubmissionCreate() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600">
              <h2 class="text-2xl font-semibold text-white">Submit Quiz</h2>
            </div>
            <div class="p-8">
              <div id="quiz-submission-demo"></div>
              <div class="text-center mt-8">
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.quizSubmissionCreate.initialize();
  }

  async renderSubmissionCreate() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-purple-600 to-violet-600">
              <h2 class="text-2xl font-semibold text-white">Create New Submission</h2>
            </div>
            <div class="p-8">
              <div id="submission-demo"></div>
              <div class="text-center mt-8">
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.submissionCreate.initialize();
  }

  async renderAssignmentList() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 class="text-2xl font-semibold text-white">Assignment Management</h2>
            </div>
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-800">All Assignments</h3>
                <a routerLink="eval/assignment/create" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create Assignment
                </a>
              </div>
              <div id="assignment-demo"></div>
              <div class="text-center mt-8">
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.assignmentCreate.initialize();
  }

  async renderQuizSubmissionList() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600">
              <h2 class="text-2xl font-semibold text-white">Quiz Submissions</h2>
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
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.quizSubmissionCreate.initialize();
  }

  async renderSubmissionList() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-purple-600 to-violet-600">
              <h2 class="text-2xl font-semibold text-white">General Submissions</h2>
            </div>
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-800">All Submissions</h3>
                <a routerLink="eval/submission/create" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create Submission
                </a>
              </div>
              <div id="submission-demo"></div>
              <div class="text-center mt-8">
                <button onclick="evalApp.render()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">← Back to Eval Module</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    await this.submissionCreate.initialize();
  }
}
