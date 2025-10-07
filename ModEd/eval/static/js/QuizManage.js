// QuizManage - Quiz Management Module
class QuizManage {
  constructor() {
    this.apiService = new EvalApiService();
    this.quizzes = [];
  }

  async initialize() {
    const container = document.getElementById('quiz-demo') || document.getElementById('MainContainer') || document.body;
    
    try {
      // Load template
      const response = await fetch('/eval/static/view/QuizManage.tpl');
      const template = await response.text();
      container.innerHTML = template;
      
      // Load and display quizzes
      await this.loadQuizzes();
      
      console.log('QuizManage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize QuizManage:', error);
      container.innerHTML = '<div class="error">Failed to load quiz management</div>';
    }
  }

  async loadQuizzes() {
    try {
      this.quizzes = await this.apiService.getAllQuizzes();
      this.renderQuizzesList();
      this.renderQuizAnalytics();
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      const listDiv = document.getElementById('quizzesList');
      if (listDiv) {
        listDiv.innerHTML = `<div class="error">Error loading quizzes: ${error.message}</div>`;
      }
    }
  }

  renderQuizzesList() {
    const listDiv = document.getElementById('quizzesList');
    if (!listDiv) return;

    if (this.quizzes.length === 0) {
      listDiv.innerHTML = '<div class="text-gray-500">No quizzes found</div>';
      return;
    }

    const quizzesHTML = this.quizzes.map(quiz => `
      <div class="quiz-item bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h4>
            <p class="text-gray-600 mb-2">${quiz.description || 'No description'}</p>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>Start: ${new Date(quiz.startDate).toLocaleDateString()}</div>
              <div>Due: ${new Date(quiz.dueDate).toLocaleDateString()}</div>
              <div>Time Limit: ${quiz.timeLimit} minutes</div>
              <div>Max Score: ${quiz.maxScore}</div>
            </div>
            <div class="flex gap-2 mt-3">
              <span class="px-2 py-1 text-xs rounded ${quiz.isReleased ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                ${quiz.isReleased ? 'Released' : 'Draft'}
              </span>
              <span class="px-2 py-1 text-xs rounded ${quiz.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}">
                ${quiz.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button onclick="quizManage.editQuiz(${quiz.id})" class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              Edit
            </button>
            <button onclick="quizManage.deleteQuiz(${quiz.id})" class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    listDiv.innerHTML = quizzesHTML;
  }

  renderQuizAnalytics() {
    const analyticsDiv = document.getElementById('quizAnalytics');
    if (!analyticsDiv) return;

    const totalQuizzes = this.quizzes.length;
    const activeQuizzes = this.quizzes.filter(q => q.isActive).length;
    const releasedQuizzes = this.quizzes.filter(q => q.isReleased).length;

    analyticsDiv.innerHTML = `
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">${totalQuizzes}</div>
          <div class="text-sm text-blue-800">Total Quizzes</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">${activeQuizzes}</div>
          <div class="text-sm text-green-800">Active Quizzes</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">${releasedQuizzes}</div>
          <div class="text-sm text-purple-800">Released Quizzes</div>
        </div>
      </div>
    `;
  }

  async editQuiz(quizId) {
    try {
      const quiz = await this.apiService.getQuizById(quizId);
      this.showEditForm(quiz);
    } catch (error) {
      console.error('Failed to load quiz for editing:', error);
    }
  }

  showEditForm(quiz) {
    const editorDiv = document.getElementById('quizEditor');
    if (!editorDiv) return;

    editorDiv.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4">Edit Quiz</h4>
        <form id="editQuizForm">
          <input type="hidden" name="id" value="${quiz.id}">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input type="text" name="title" value="${quiz.title}" placeholder="Quiz Title" class="rounded border px-3 py-2">
            <input type="text" name="description" value="${quiz.description}" placeholder="Description" class="rounded border px-3 py-2">
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input type="datetime-local" name="startDate" value="${new Date(quiz.startDate).toISOString().slice(0, 16)}" class="rounded border px-3 py-2">
            <input type="datetime-local" name="dueDate" value="${new Date(quiz.dueDate).toISOString().slice(0, 16)}" class="rounded border px-3 py-2">
          </div>
          <div class="flex gap-4 mb-4">
            <input type="number" name="timeLimit" value="${quiz.timeLimit}" placeholder="Time Limit" class="rounded border px-3 py-2">
            <input type="number" name="maxScore" value="${quiz.maxScore}" placeholder="Max Score" class="rounded border px-3 py-2">
          </div>
          <div class="flex gap-4 mb-4">
            <label><input type="checkbox" name="isReleased" ${quiz.isReleased ? 'checked' : ''}> Released</label>
            <label><input type="checkbox" name="isActive" ${quiz.isActive ? 'checked' : ''}> Active</label>
          </div>
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
            <button type="button" onclick="this.closest('.bg-gray-50').remove()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    `;

    // Setup edit form handler
    const editForm = document.getElementById('editQuizForm');
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);
      const quizData = {
        id: parseInt(formData.get('id')),
        title: formData.get('title'),
        description: formData.get('description'),
        startDate: new Date(formData.get('startDate')).toISOString(),
        dueDate: new Date(formData.get('dueDate')).toISOString(),
        timeLimit: parseInt(formData.get('timeLimit')),
        maxScore: parseInt(formData.get('maxScore')),
        instructorId: quiz.instructorId,
        courseId: quiz.courseId,
        isReleased: formData.get('isReleased') === 'on',
        isActive: formData.get('isActive') === 'on'
      };

      try {
        await this.apiService.updateQuiz(quizData);
        await this.loadQuizzes(); // Refresh the list
        editorDiv.innerHTML = '';
        console.log('Quiz updated successfully');
      } catch (error) {
        console.error('Failed to update quiz:', error);
      }
    });
  }

  async deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await this.apiService.deleteQuiz(quizId);
      await this.loadQuizzes(); // Refresh the list
      console.log('Quiz deleted successfully');
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  }
}

// Make QuizManage globally accessible
window.quizManage = new QuizManage();
