// QuizCreate - Quiz Creation Module
class QuizCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
    this.templatePath = '/eval/static/view/QuizForm.tpl';
  }

  async initialize() {
    const container = document.getElementById('quiz-demo') || document.getElementById('MainContainer') || document.body;
    
    try {
      // Load template
      const response = await fetch(this.templatePath);
      const template = await response.text();
      
      // Render template with title
      container.innerHTML = template.replace('{{title}}', 'Create New Quiz');
      
      // Setup form handler
      this.setupFormHandler();
      this.setupLoadAllHandler();
      
      console.log('QuizCreate initialized successfully');
    } catch (error) {
      console.error('Failed to initialize QuizCreate:', error);
      container.innerHTML = '<div class="error">Failed to load quiz creation form</div>';
    }
  }

  setupFormHandler() {
    const form = document.getElementById('quizForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const quizData = {
        title: formData.get('title'),
        description: formData.get('description'),
        startDate: formData.get('startDate') ? new Date(formData.get('startDate')).toISOString() : new Date().toISOString(),
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')).toISOString() : new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        timeLimit: parseInt(formData.get('timeLimit')) || 60,
        maxScore: parseInt(formData.get('maxScore')) || 100,
        instructorId: parseInt(formData.get('instructorId')),
        courseId: parseInt(formData.get('courseId')),
        isReleased: formData.get('isReleased') === 'on',
        isActive: formData.get('isActive') === 'on'
      };

      // Validate data
      const validation = this.validator.validateQuiz(quizData);
      if (!validation.isValid) {
        this.showResult(validation.errors.join(', '), 'error');
        return;
      }

      try {
        const result = await this.apiService.createQuiz(quizData);
        this.showResult(JSON.stringify(result, null, 2), 'success');
        form.reset();
      } catch (error) {
        this.showResult(`Error: ${error.message}`, 'error');
      }
    });
  }

  setupLoadAllHandler() {
    const loadBtn = document.getElementById('loadAllBtn');
    if (!loadBtn) return;

    loadBtn.addEventListener('click', async () => {
      try {
        const quizzes = await this.apiService.getAllQuizzes();
        this.showAllQuizzes(JSON.stringify(quizzes, null, 2));
      } catch (error) {
        this.showAllQuizzes(`Error loading quizzes: ${error.message}`);
      }
    });
  }

  showResult(message, type = 'info') {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      resultDiv.textContent = message;
      resultDiv.className = type === 'error' ? 'error' : 'success';
    }
  }

  showAllQuizzes(content) {
    const allQuizzesDiv = document.getElementById('allQuizzes');
    if (allQuizzesDiv) {
      allQuizzesDiv.textContent = content;
    }
  }
}
