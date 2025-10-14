// QuizSubmissionCreate - Using AdvanceFormRender from core
class QuizSubmissionCreate {
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
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Submit Quiz</h1>
            <p class="text-lg text-gray-600">Fill in the form below to submit a quiz</p>
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
          <div id="quiz-submission-form-container"></div>

          <!-- Quiz Submissions List -->
          <div class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Recent Quiz Submissions</h2>
            <div id="quiz-submission-table-container" class="bg-white rounded-lg shadow-md p-6"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize EvalFormRenderer (filters out system fields like 'model')
    // Note: AdvanceFormRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.form = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/quizsubmission",
      targetSelector: "#quiz-submission-form-container",
      submitHandler: async (formData) => await this.handleSubmit(formData),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.form.render();
      await this.loadQuizSubmissions();
    } catch (error) {
      console.error('Error rendering form:', error);
      this.showError('Failed to load form: ' + error.message);
    }
  }

  async handleSubmit(formData) {
    try {
      // Convert dates to RFC3339 format if needed
      if (formData.startedAt) {
        formData.startedAt = this.apiService.formatToRFC3339(new Date(formData.startedAt));
      }
      if (formData.submittedAt) {
        formData.submittedAt = this.apiService.formatToRFC3339(new Date(formData.submittedAt));
      }

      // Ensure numeric fields
      if (formData.quizId) formData.quizId = Number(formData.quizId);
      if (formData.studentId) formData.studentId = Number(formData.studentId);
      if (formData.timeSpent) formData.timeSpent = Number(formData.timeSpent);
      if (formData.score) formData.score = Number(formData.score);

      // Convert checkbox values
      formData.isLate = formData.isLate === 'on' || formData.isLate === true;

      const result = await this.apiService.createQuizSubmission(formData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz submission created successfully!');
        // Reset the form by clearing input values
        const form = document.getElementById('quiz-submission-form-container');
        if (form) {
          form.querySelectorAll('input, textarea, select').forEach(element => {
            if (element.type === 'checkbox') {
              element.checked = false;
            } else {
              element.value = '';
            }
          });
        }
      } else {
        throw new Error(result?.message || 'Failed to create quiz submission');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to create quiz submission: ' + error.message);
      throw error;
    }
  }

  async loadQuizSubmissions() {
    const container = document.getElementById('quiz-submission-table-container');
    if (!container) return;

    try {
      const response = await this.apiService.getAllQuizSubmissions();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const submissions = response.result;
        
        if (submissions.length === 0) {
          container.innerHTML = '<p class="text-gray-500 text-center py-8">No quiz submissions created yet</p>';
          return;
        }

        const tableHTML = `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${submissions.slice(0, 5).map(s => `
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${s.quizId || s.QuizID || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${s.studentId || s.StudentID || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${s.submittedAt || s.SubmittedAt ? new Date(s.submittedAt || s.SubmittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${s.score || s.Score || 'Not graded'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.isLate || s.IsLate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${s.isLate || s.IsLate ? 'Late' : 'On Time'}
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
        container.innerHTML = '<p class="text-red-500 text-center py-4">Error loading quiz submissions</p>';
      }
    } catch (error) {
      console.error('Error loading quiz submissions:', error);
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
window.QuizSubmissionCreate = QuizSubmissionCreate;