// SubmissionManage - Using AdvanceTableRender from core with Evaluation Integration
class SubmissionManage {
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
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Submissions</h1>
            <p class="text-lg text-gray-600">View, evaluate, and manage all submissions</p>
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
              <h2 class="text-xl font-semibold text-gray-800 mb-4">Evaluation Analytics</h2>
              <div id="evaluation-analytics-container" class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <!-- Analytics will be loaded here -->
              </div>
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="submission-table-container"></div>
          </div>

          <!-- Evaluation Editor Container -->
          <div id="evaluation-editor-container" class="mt-8"></div>
        </div>
      </div>
    `;

    // Setup table with AdvanceTableRender
    // Note: AdvanceTableRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.table = new AdvanceTableRender(this.application.templateEngine, {
      modelPath: "eval/submission",
      data: [],
      targetSelector: "#submission-table-container",
      customColumns: [
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="submissionManager.viewSubmission({ID})" class="text-blue-600 hover:underline mr-2">
                View
              </button>
              <button onclick="submissionManager.gradeSubmission({ID})" class="text-green-600 hover:underline mr-2">
                Grade
              </button>
              <button onclick="submissionManager.deleteSubmission({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally for template onclick handlers
    window.submissionManager = this;

    try {
      await this.table.loadSchema();
      await this.table.render();
      await this.loadSubmissions();
      await this.loadEvaluationAnalytics();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load submissions: ' + error.message);
    }
  }

  async loadSubmissions() {
    try {
      const response = await this.apiService.getAllSubmissions();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const submissions = response.result.map(s => ({
          ...s,
          ID: s.ID || s.id || s.Id
        }));
        
        this.table.setData(submissions);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.showError('Error loading submissions: ' + error.message);
    }
  }

  async loadEvaluationAnalytics() {
    try {
      const response = await this.apiService.getAllEvaluations();
      const container = document.getElementById('evaluation-analytics-container');
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const evaluations = response.result;
        const totalEvaluations = evaluations.length;
        const pendingEvaluations = evaluations.filter(e => e.status === 'draft').length;
        const completedEvaluations = evaluations.filter(e => e.status === 'final').length;
        
        let totalScore = 0;
        let scoredCount = 0;
        evaluations.forEach(evaluation => {
          if (evaluation.score && evaluation.maxScore) {
            totalScore += (evaluation.score / evaluation.maxScore) * 100;
            scoredCount++;
          }
        });
        
        const averageScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0;
        
        container.innerHTML = `
          <div class="bg-blue-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-blue-600">${totalEvaluations}</div>
            <div class="text-sm text-blue-800">Total Evaluations</div>
          </div>
          <div class="bg-yellow-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-yellow-600">${pendingEvaluations}</div>
            <div class="text-sm text-yellow-800">Pending</div>
          </div>
          <div class="bg-green-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-green-600">${completedEvaluations}</div>
            <div class="text-sm text-green-800">Completed</div>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg">
            <div class="text-3xl font-bold text-purple-600">${averageScore}%</div>
            <div class="text-sm text-purple-800">Average Score</div>
          </div>
        `;
      } else {
        container.innerHTML = '<p class="text-red-500">Error loading evaluation analytics</p>';
      }
    } catch (error) {
      console.error('Error loading evaluation analytics:', error);
      const container = document.getElementById('evaluation-analytics-container');
      if (container) {
        container.innerHTML = '<p class="text-red-500">Error loading analytics</p>';
      }
    }
  }

  async viewSubmission(id) {
    // TODO: Implement view functionality
    console.log('View submission:', id);
    this.showInfo(`View functionality for submission ${id} coming soon!`);
  }

  async gradeSubmission(id) {
    // TODO: Implement grading functionality
    console.log('Grade submission:', id);
    this.showInfo(`Grading functionality for submission ${id} coming soon!`);
  }

  async deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteSubmission(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Submission deleted successfully!');
        await this.loadSubmissions();
      } else {
        throw new Error(result?.message || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      this.showError('Failed to delete submission: ' + error.message);
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
window.SubmissionManage = SubmissionManage;