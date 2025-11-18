// StudentQuizTaking - Interface for students to take quizzes
class StudentQuizTaking {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.quiz = null;
    this.questions = [];
    this.answers = {};
    this.startTime = null;
    this.timeLimit = 0; // in minutes
    this.timeRemaining = 0; // in seconds
    this.timerInterval = null;
    this.quizId = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Get quiz ID from URL hash
    const hash = window.location.hash;
    const match = hash.match(/\/take\/(\d+)/);
    if (!match) {
      this.showError('Invalid quiz ID');
      return;
    }

    this.quizId = parseInt(match[1]);

    // Expose globally
    window.quizTaker = this;

    await this.loadQuiz();
    await this.renderPage();
    this.startTimer();
  }

  async loadQuiz() {
    try {
      const response = await this.apiService.getQuizById(this.quizId);
      
      if (response && response.isSuccess && response.result) {
        this.quiz = response.result;
        this.questions = this.quiz.questions || [];
        this.timeLimit = (this.quiz.timeLimit || this.quiz.TimeLimit || 60) * 60; // Convert to seconds
        this.timeRemaining = this.timeLimit;
        this.startTime = new Date();
      } else {
        throw new Error('Failed to load quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      this.showError('Failed to load quiz: ' + error.message);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      timerEl.textContent = timeString;
      
      // Change color when time is running low
      if (this.timeRemaining < 300) { // Less than 5 minutes
        timerEl.className = 'text-red-600 font-bold text-2xl';
      } else if (this.timeRemaining < 600) { // Less than 10 minutes
        timerEl.className = 'text-orange-600 font-bold text-2xl';
      } else {
        timerEl.className = 'text-gray-700 font-bold text-2xl';
      }
    }
  }

  handleTimeUp() {
    clearInterval(this.timerInterval);
    this.showError('Time is up! Submitting your quiz automatically...');
    setTimeout(() => {
      this.submitQuiz(true);
    }, 2000);
  }

  updateAnswer(questionIndex, answer) {
    this.answers[questionIndex] = answer;
  }

  async submitQuiz(isTimeUp = false) {
    if (!isTimeUp && !confirm('Are you sure you want to submit your quiz? You cannot change your answers after submission.')) {
      return;
    }

    clearInterval(this.timerInterval);

    const endTime = new Date();
    const timeSpent = Math.floor((endTime - this.startTime) / 1000 / 60); // in minutes
    const dueDate = new Date(this.quiz.dueDate || this.quiz.DueDate);
    const isLate = endTime > dueDate;

    // Prepare submission data
    // Note: studentId will be set by backend from context when auth is implemented
    const submissionData = {
      quizId: this.quizId,
      studentId: null, // Will be set by backend from context
      startedAt: this.startTime.toISOString(),
      submittedAt: endTime.toISOString(),
      answers: JSON.stringify(this.answers),
      timeSpent: timeSpent,
      isLate: isLate,
      status: 'submitted'
    };

    try {
      const result = await this.apiService.createQuizSubmission(submissionData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Quiz submitted successfully!');
        setTimeout(() => {
          window.location.hash = '#/eval/student/quizzes';
        }, 2000);
      } else {
        throw new Error(result?.result || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      this.showError('Failed to submit quiz: ' + error.message);
    }
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    if (!this.quiz) {
      container.innerHTML = '<p class="text-center py-8">Loading quiz...</p>';
      return;
    }

    const startDate = new Date(this.quiz.startDate || this.quiz.StartDate);
    const dueDate = new Date(this.quiz.dueDate || this.quiz.DueDate);
    const now = new Date();

    if (now < startDate) {
      container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Quiz Not Available Yet</h2>
              <p class="text-gray-600 mb-4">This quiz will be available on ${startDate.toLocaleString()}</p>
              <a routerLink="eval/student/quizzes" class="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Back to Quizzes</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (now > dueDate) {
      container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Quiz Deadline Passed</h2>
              <p class="text-gray-600 mb-4">This quiz was due on ${dueDate.toLocaleString()}</p>
              <a routerLink="eval/student/quizzes" class="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Back to Quizzes</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Render quiz taking interface
    const questionsHTML = this.questions.map((q, index) => `
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Question ${index + 1}
          </h3>
          <p class="text-gray-700 mb-4">${q.question || ''}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
          <textarea 
            id="answer-${index}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="4"
            placeholder="Enter your answer here..."
            onchange="quizTaker.updateAnswer(${index}, this.value)"
          >${this.answers[index] || ''}</textarea>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <!-- Header -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">${this.quiz.title || 'Untitled Quiz'}</h1>
                ${this.quiz.description ? `<p class="text-gray-600">${this.quiz.description}</p>` : ''}
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 mb-1">Time Remaining</div>
                <div id="quiz-timer" class="text-gray-700 font-bold text-2xl">00:00</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Time Limit:</span>
                <span class="ml-2 text-gray-900">${Math.floor(this.timeLimit / 60)} minutes</span>
              </div>
              <div>
                <span class="text-gray-500">Max Score:</span>
                <span class="ml-2 text-gray-900">${this.quiz.maxScore || this.quiz.MaxScore || 100}</span>
              </div>
              <div>
                <span class="text-gray-500">Questions:</span>
                <span class="ml-2 text-gray-900">${this.questions.length}</span>
              </div>
            </div>
          </div>

          <!-- Questions -->
          <form id="quiz-form" onsubmit="event.preventDefault(); quizTaker.submitQuiz();">
            ${questionsHTML}
            
            <!-- Submit Button -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  Please review your answers before submitting
                </div>
                <button 
                  type="submit"
                  class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    // Initialize timer display
    this.updateTimerDisplay();
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
window.StudentQuizTaking = StudentQuizTaking;

