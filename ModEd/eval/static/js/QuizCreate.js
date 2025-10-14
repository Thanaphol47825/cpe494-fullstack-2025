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
        </div>
      </div>
    `;

    // Initialize EvalFormRenderer (filters out system fields like 'model')
    // Note: AdvanceFormRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.form = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/quiz",
      targetSelector: "#quiz-form-container",
      submitHandler: async (formData) => await this.handleSubmit(formData),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.form.render();
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
        // Reset the form by clearing input values
        const form = document.getElementById('quiz-form-container');
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
        throw new Error(result?.message || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to create quiz: ' + error.message);
      throw error;
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