// QuizCreate - Using AdvanceFormRender from core
class QuizCreate {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.form = null;
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
        <div class="max-w-4xl mx-auto px-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Quiz</h1>
            <p class="text-lg text-gray-600">Fill in the form below to create a new quiz</p>
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

          <!-- Form Container -->
          <div id="quiz-form-container"></div>

          <!-- Quizzes List -->
          <div class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Recent Quizzes</h2>
            <div id="quiz-table-container" class="bg-white rounded-lg shadow-md p-6"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize AdvanceFormRender
    // Note: AdvanceFormRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.form = new AdvanceFormRender(this.application.templateEngine, {
      modelPath: "eval/quiz",
      targetSelector: "#quiz-form-container",
      submitHandler: async (formData) => await this.handleSubmit(formData),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.form.render();
      await this.loadQuizzes();
    } catch (error) {
      console.error('Error rendering form:', error);
      this.showError('Failed to load form: ' + error.message);
    }
  }

  async handleSubmit(formData) {
    try {
      // Convert dates to RFC3339 format if needed
      if (formData.startDate) {
        formData.startDate = this.apiService.formatToRFC3339(new Date(formData.startDate));
      }
      if (formData.dueDate) {
        formData.dueDate = this.apiService.formatToRFC3339(new Date(formData.dueDate));
      }

      // Ensure numeric fields
      if (formData.timeLimit) formData.timeLimit = Number(formData.timeLimit);
      if (formData.maxScore) formData.maxScore = Number(formData.maxScore);
      if (formData.instructorId) formData.instructorId = Number(formData.instructorId);
      if (formData.courseId) formData.courseId = Number(formData.courseId);

      // Convert checkbox values
      formData.isReleased = formData.isReleased === 'on' || formData.isReleased === true;
      formData.isActive = formData.isActive === 'on' || formData.isActive === true;

      const result = await this.apiService.createQuiz(formData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz created successfully!');
        this.form.reset();
        await this.loadQuizzes();
      } else {
        throw new Error(result?.message || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to create quiz: ' + error.message);
      throw error;
    }
  }

  async loadQuizzes() {
    const container = document.getElementById('quiz-table-container');
    if (!container) return;

    try {
      const response = await this.apiService.getAllQuizzes();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const quizzes = response.result;
        
        if (quizzes.length === 0) {
          container.innerHTML = '<p class="text-gray-500 text-center py-8">No quizzes created yet</p>';
          return;
        }

        const tableHTML = `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Limit</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${quizzes.slice(0, 5).map(q => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${q.title || q.Title || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${q.dueDate || q.DueDate ? new Date(q.dueDate || q.DueDate).toLocaleDateString() : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${q.timeLimit || q.TimeLimit || '-'} min
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${q.maxScore || q.MaxScore || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(q.isActive || q.IsActive) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${(q.isActive || q.IsActive) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        
        container.innerHTML = tableHTML;
      } else {
        container.innerHTML = '<p class="text-red-500 text-center py-4">Error loading quizzes</p>';
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      container.innerHTML = `<p class="text-red-500 text-center py-4">Error: ${error.message}</p>`;
    }
  }

  showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-green-100 text-green-800 border border-green-200 transition-opacity duration-300';
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }

  showError(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-red-100 text-red-800 border border-red-200';
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 5000);
  }
}

// Expose globally
window.QuizCreate = QuizCreate;