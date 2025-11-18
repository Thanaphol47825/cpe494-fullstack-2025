// StudentViewQuizzes - For students to view quizzes and start them
// Course dropdown, show quizzes with Start Quiz button
class StudentViewQuizzes {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.courses = [];
    this.quizzes = [];
    this.selectedCourseId = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Load courses
    await this.loadCourses();

    // Expose globally
    window.studentQuizViewer = this;

    await this.renderPage();
  }

  async loadCourses() {
    try {
      const response = await this.apiService.getAllCourses();
      if (response && response.isSuccess && Array.isArray(response.result)) {
        this.courses = response.result;
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      this.showError('Failed to load courses');
    }
  }

  async onCourseChange(courseId) {
    this.selectedCourseId = courseId;
    
    if (!courseId || courseId === '') {
      this.quizzes = [];
      this.renderQuizzesList();
      return;
    }

    await this.loadQuizzesForCourse(courseId);
  }

  async loadQuizzesForCourse(courseId) {
    try {
      const url = `${RootURL}/eval/quiz/getAll?courseId=${courseId}`;
      const response = await fetch(url).then(r => r.json());
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        this.quizzes = response.result;
        this.renderQuizzesList();
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      this.showError('Failed to load quizzes');
    }
  }

  renderQuizzesList() {
    const container = document.getElementById('quizzes-list');
    if (!container) return;

    if (this.quizzes.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No quizzes found for this course</p>';
      return;
    }

    const now = new Date();
    const quizzesHTML = this.quizzes.map(quiz => {
      const startDate = new Date(quiz.startDate || quiz.StartDate);
      const dueDate = new Date(quiz.dueDate || quiz.DueDate);
      const isActive = now >= startDate && now <= dueDate;
      const isPastDue = now > dueDate;
      const isNotStarted = now < startDate;

      let statusBadge = '';
      if (isPastDue) {
        statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Past Due</span>';
      } else if (isNotStarted) {
        statusBadge = '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Not Started</span>';
      } else {
        statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>';
      }

      return `
        <div class="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 ${isActive ? 'border-orange-500' : isPastDue ? 'border-red-500' : 'border-gray-300'}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">${quiz.title || 'Untitled Quiz'}</h3>
              ${quiz.description ? `<p class="text-gray-600 mb-2">${quiz.description}</p>` : ''}
            </div>
            ${statusBadge}
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span class="text-gray-500">Start Date:</span>
              <span class="ml-2 text-gray-900">${startDate.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-gray-500">Due Date:</span>
              <span class="ml-2 text-gray-900">${dueDate.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-gray-500">Time Limit:</span>
              <span class="ml-2 text-gray-900">${quiz.timeLimit || quiz.TimeLimit || 60} minutes</span>
            </div>
            <div>
              <span class="text-gray-500">Max Score:</span>
              <span class="ml-2 text-gray-900">${quiz.maxScore || quiz.MaxScore || 100}</span>
            </div>
          </div>

          <div class="flex gap-2">
            ${isActive ? `
              <button 
                onclick="studentQuizViewer.startQuiz(${quiz.ID || quiz.id || quiz.Id})"
                class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Start Quiz
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = quizzesHTML;
  }

  startQuiz(quizId) {
    // Navigate to quiz taking page
    window.location.hash = `#/eval/student/quiz/take/${quizId}`;
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-5xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">View Quizzes</h1>
            <p class="text-lg text-gray-600">Select a course to view available quizzes</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval/student" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Course Filter -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select 
              id="course-select" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              onchange="studentQuizViewer.onCourseChange(this.value)"
            >
              <option value="">-- Select a course --</option>
              ${this.courses.map(c => 
                `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Quizzes List -->
          <div id="quizzes-list" class="space-y-4">
            <p class="text-gray-500 text-center py-8">Please select a course to view quizzes</p>
          </div>
        </div>
      </div>
    `;
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
window.StudentViewQuizzes = StudentViewQuizzes;

