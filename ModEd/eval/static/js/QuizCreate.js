// QuizCreate - Google Forms-like interface with dynamic questions
class QuizCreate {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.questions = [];
    this.questionCounter = 0;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Expose globally for onclick handlers
    window.quizCreate = this;

    // Add initial question
    this.addQuestion();

    // Render page structure
    await this.renderPage();
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    
    // Load template or use fallback
    try {
      const templateResponse = await fetch(`${RootURL}/eval/static/view/QuizCreate.tpl`);
      if (templateResponse.ok) {
        const templateContent = await templateResponse.text();
        const pageElement = new DOMObject(templateContent, {}, false);
        container.appendChild(pageElement.html);
      } else {
        throw new Error('Template not found');
      }
    } catch (error) {
      // Fallback structure
      container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Quiz</h1>
              <p class="text-lg text-gray-600">Fill in the form below to create a new quiz</p>
            </div>
            <div class="mb-6">
              <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </a>
            </div>
            <div id="quiz-form-container" class="bg-white rounded-lg shadow-md p-6"></div>
          </div>
        </div>
      `;
    }

    await this.renderQuizForm();
  }

  async renderQuizForm() {
    const container = document.getElementById('quiz-form-container');
    if (!container) return;

    // Render basic quiz info form using EvalFormRenderer
    this.form = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/quiz",
      targetSelector: "#quiz-form-container",
      submitHandler: async (formData) => await this.handleSubmit(formData),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.form.render();
      
      // Add questions section after the form
      const form = container.querySelector('form');
      if (form) {
        // Insert questions container before submit button
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        const questionsContainer = document.createElement('div');
        questionsContainer.id = 'questions-container';
        questionsContainer.className = 'mt-6 space-y-4';
        questionsContainer.innerHTML = '<h3 class="text-xl font-semibold mb-4">Questions</h3>';
        
        const questionsList = document.createElement('div');
        questionsList.id = 'questions-list';
        questionsList.className = 'space-y-6';
        questionsContainer.appendChild(questionsList);
        
        const addQuestionBtn = document.createElement('button');
        addQuestionBtn.type = 'button';
        addQuestionBtn.className = 'mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700';
        addQuestionBtn.textContent = '+ Add Question';
        addQuestionBtn.onclick = () => this.addQuestion();
        questionsContainer.appendChild(addQuestionBtn);
        
        if (submitBtn) {
          submitBtn.parentNode.insertBefore(questionsContainer, submitBtn);
        } else {
          form.appendChild(questionsContainer);
        }

        // Render existing questions
        this.questions.forEach((q, index) => {
          this.renderQuestion(q, index);
        });
      }
    } catch (error) {
      console.error('Error rendering form:', error);
      this.showError('Failed to load form: ' + error.message);
    }
  }

  addQuestion() {
    const question = {
      id: this.questionCounter++,
      question: '',
      answer: ''
    };
    this.questions.push(question);
    this.renderQuestion(question, this.questions.length - 1);
  }

  removeQuestion(index) {
    this.questions.splice(index, 1);
    this.renderAllQuestions();
  }

  renderAllQuestions() {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    this.questions.forEach((q, index) => {
      this.renderQuestion(q, index);
    });
  }

  renderQuestion(question, index) {
    const questionsList = document.getElementById('questions-list');
    if (!questionsList) return;

    // Create question card
    const questionCard = document.createElement('div');
    questionCard.className = 'border border-gray-300 rounded-lg p-4 bg-gray-50';
    questionCard.id = `question-${question.id}`;
    
    questionCard.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold">Question ${index + 1}</h4>
        ${this.questions.length > 1 ? `<button type="button" onclick="quizCreate.removeQuestion(${index})" class="text-red-600 hover:text-red-800">Remove</button>` : ''}
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <textarea 
            name="question_${question.id}" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="3"
            placeholder="Enter your question here..."
            onchange="quizCreate.updateQuestion(${index}, 'question', this.value)"
          >${question.question || ''}</textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Answer</label>
          <textarea 
            name="answer_${question.id}" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="2"
            placeholder="Enter the correct answer..."
            onchange="quizCreate.updateQuestion(${index}, 'answer', this.value)"
          >${question.answer || ''}</textarea>
        </div>
      </div>
    `;

    // Insert at the correct position
    const existingCard = document.getElementById(`question-${question.id}`);
    if (existingCard) {
      existingCard.replaceWith(questionCard);
    } else {
      questionsList.appendChild(questionCard);
    }
  }

  updateQuestion(index, field, value) {
    if (this.questions[index]) {
      this.questions[index][field] = value;
    }
  }

  async handleSubmit(formData) {
    try {
      // Validate questions
      if (this.questions.length === 0) {
        this.showError('Please add at least one question');
        throw new Error('No questions provided');
      }

      // Validate all questions have content
      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i];
        if (!q.question || !q.question.trim()) {
          this.showError(`Question ${i + 1} is required`);
          throw new Error(`Question ${i + 1} is required`);
        }
        if (!q.answer || !q.answer.trim()) {
          this.showError(`Answer for question ${i + 1} is required`);
          throw new Error(`Answer for question ${i + 1} is required`);
        }
      }

      // Convert dates
      if (formData.startDate) {
        formData.startDate = this.apiService.formatToRFC3339(new Date(formData.startDate));
      }
      if (formData.dueDate) {
        formData.dueDate = this.apiService.formatToRFC3339(new Date(formData.dueDate));
      }

      // Ensure numeric fields
      if (formData.timeLimit) formData.timeLimit = Number(formData.timeLimit);
      if (formData.maxScore) formData.maxScore = Number(formData.maxScore);

      // Prepare quiz data
      const quizData = {
        title: formData.title,
        description: formData.description || '',
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        timeLimit: formData.timeLimit,
        maxScore: formData.maxScore
      };

      // Prepare questions
      const questionsData = this.questions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }));

      const result = await this.apiService.createQuiz({
        quiz: quizData,
        questions: questionsData
      });
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz created successfully!');
        // Reset form
        this.questions = [];
        this.questionCounter = 0;
        this.addQuestion();
        const form = document.querySelector('#quiz-form-container form');
        if (form) form.reset();
        this.renderAllQuestions();
      } else {
        throw new Error(result?.result || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to create quiz: ' + error.message);
      throw error;
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
}

// Expose globally
window.QuizCreate = QuizCreate;
window.quizCreate = null;
