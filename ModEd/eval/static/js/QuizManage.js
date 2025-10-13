// QuizManage - Using AdvanceTableRender from core
class QuizManage {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
  }

  async initialize() {
    const container = this.application.templateEngine.mainContainer;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container and add wrapper
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Quizzes</h1>
            <p class="text-lg text-gray-600">View, edit, and delete quizzes</p>
          </div>
          
          <!-- Back Button -->
          <div class="mb-6">
            <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Analytics Section -->
          <div class="mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Quiz Analytics</h2>
              <div id="quiz-analytics-container" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Analytics will be loaded here -->
              </div>
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="quiz-table-container"></div>
          </div>
        </div>
      </div>
    `;

    // Setup table with AdvanceTableRender
    // Note: AdvanceTableRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.table = new AdvanceTableRender(this.application.templateEngine, {
      modelPath: "eval/quiz",
      data: [],
      targetSelector: "#quiz-table-container",
      customColumns: [
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="quizManager.editQuiz({ID})" class="text-blue-600 hover:underline mr-4">
                Edit
              </button>
              <button onclick="quizManager.deleteQuiz({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally for template onclick handlers
    window.quizManager = this;

    try {
      await this.table.loadSchema();
      await this.table.render();
      await this.loadQuizzes();
      await this.loadAnalytics();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load quizzes: ' + error.message);
    }
  }

  async loadQuizzes() {
    try {
      const response = await this.apiService.getAllQuizzes();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const quizzes = response.result.map(q => ({
          ...q,
          ID: q.ID || q.id || q.Id
        }));
        
        this.table.setData(quizzes);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      this.showError('Error loading quizzes: ' + error.message);
    }
  }

  async loadAnalytics() {
    try {
      const response = await this.apiService.getAllQuizzes();
      const container = document.getElementById('quiz-analytics-container');
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const quizzes = response.result;
        const totalQuizzes = quizzes.length;
        const activeQuizzes = quizzes.filter(q => q.isActive || q.IsActive).length;
        const releasedQuizzes = quizzes.filter(q => q.isReleased || q.IsReleased).length;
        
        container.innerHTML = `
          <div class="bg-blue-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-blue-600">${totalQuizzes}</div>
            <div class="text-sm text-blue-800">Total Quizzes</div>
          </div>
          <div class="bg-green-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-green-600">${activeQuizzes}</div>
            <div class="text-sm text-green-800">Active Quizzes</div>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-purple-600">${releasedQuizzes}</div>
            <div class="text-sm text-purple-800">Released Quizzes</div>
          </div>
        `;
      } else {
        container.innerHTML = '<p class="text-red-500">Error loading analytics</p>';
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      const container = document.getElementById('quiz-analytics-container');
      if (container) {
        container.innerHTML = '<p class="text-red-500">Error loading analytics</p>';
      }
    }
  }

  async editQuiz(id) {
    // TODO: Implement edit functionality
    console.log('Edit quiz:', id);
    this.showInfo(`Edit functionality for quiz ${id} coming soon!`);
  }

  async deleteQuiz(id) {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteQuiz(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz deleted successfully!');
        await this.loadQuizzes();
        await this.loadAnalytics();
      } else {
        throw new Error(result?.message || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      this.showError('Failed to delete quiz: ' + error.message);
    }
  }

  showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-green-100 text-green-800 border border-green-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  showError(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-red-100 text-red-800 border border-red-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  showInfo(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-blue-100 text-blue-800 border border-blue-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}

// Expose globally
window.QuizManage = QuizManage;