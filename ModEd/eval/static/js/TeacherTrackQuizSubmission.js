// TeacherTrackQuizSubmission - For teachers to track quiz submissions
// Course -> Quiz dropdowns with submission table
class TeacherTrackQuizSubmission {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
    this.courses = [];
    this.quizzes = [];
    this.selectedCourseId = null;
    this.selectedQuizId = null;
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

    // Setup table
    this.table = new EvalTableRenderer(this.application.templateEngine, {
      modelPath: "eval/quizsubmission",
      data: [],
      targetSelector: "#submission-table-container",
      customColumns: [
        {
          name: "startedAt",
          label: "Started At",
          template: `<span>{startedAtFormatted}</span>`
        },
        {
          name: "submittedAt",
          label: "Submitted At",
          template: `<span>{submittedAtFormatted}</span>`
        },
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="trackQuizManager.viewSubmission({ID})" class="text-blue-600 hover:underline mr-4">
                View
              </button>
              <button onclick="trackQuizManager.deleteSubmission({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally
    window.trackQuizManager = this;

    try {
      await this.table.loadSchema();
      await this.renderPage();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load submissions: ' + error.message);
    }
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
    this.selectedQuizId = null;
    
    // Reset quiz dropdown
    const quizSelect = document.getElementById('quiz-filter');
    if (quizSelect) {
      quizSelect.innerHTML = '<option value="">-- Select a quiz --</option>';
    }

    // Clear table
    this.table.setData([]);
    const container = document.getElementById('submission-table-container');
    if (container) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Please select a course and quiz to view submissions</p>';
    }

    if (!courseId || courseId === '') {
      return;
    }

    // Load quizzes for selected course
    await this.loadQuizzesForCourse(courseId);
  }

  async loadQuizzesForCourse(courseId) {
    try {
      const url = `${RootURL}/eval/quiz/getAll?courseId=${courseId}`;
      const response = await fetch(url).then(r => r.json());
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        this.quizzes = response.result;

        // Update quiz dropdown
        const quizSelect = document.getElementById('quiz-filter');
        if (quizSelect) {
          quizSelect.innerHTML = '<option value="">-- Select a quiz --</option>';
          this.quizzes.forEach(q => {
            const option = document.createElement('option');
            option.value = q.ID || q.id || q.Id;
            option.textContent = q.title || 'Untitled Quiz';
            quizSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      this.showError('Failed to load quizzes');
    }
  }

  async onQuizChange(quizId) {
    this.selectedQuizId = quizId;
    
    if (!quizId || quizId === '') {
      // Clear table
      this.table.setData([]);
      const container = document.getElementById('submission-table-container');
      if (container) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Please select a quiz to view submissions</p>';
      }
      return;
    }

    await this.loadSubmissions(quizId);
  }

  async loadSubmissions(quizId) {
    try {
      // Use query parameter to filter by quizId
      const url = `${RootURL}/eval/quiz/submission/getAll?quizId=${quizId}`;
      const response = await fetch(url).then(r => r.json());
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const submissions = response.result.map(s => ({
          ...s,
          ID: s.ID || s.id || s.Id,
          startedAtFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(s.startedAt || s.StartedAt) : (s.startedAt || s.StartedAt || ''),
          submittedAtFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(s.submittedAt || s.SubmittedAt) : (s.submittedAt || s.SubmittedAt || '')
        }));
        
        this.table.setData(submissions);
      } else {
        throw new Error(response?.result || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.showError('Error loading submissions: ' + error.message);
    }
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Track Quiz Submissions</h1>
            <p class="text-lg text-gray-600">View and manage student quiz submissions</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select 
                id="course-filter" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onchange="trackQuizManager.onCourseChange(this.value)"
              >
                <option value="">-- Select a course --</option>
                ${this.courses.map(c => 
                  `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
                ).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Quiz
              </label>
              <select 
                id="quiz-filter" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onchange="trackQuizManager.onQuizChange(this.value)"
                disabled
              >
                <option value="">-- Select a course first --</option>
              </select>
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="submission-table-container">
              <p class="text-gray-500 text-center py-8">Please select a course and quiz to view submissions</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Enable quiz dropdown when course is selected
    const courseSelect = document.getElementById('course-filter');
    const quizSelect = document.getElementById('quiz-filter');
    if (courseSelect && quizSelect) {
      courseSelect.addEventListener('change', () => {
        if (courseSelect.value) {
          quizSelect.disabled = false;
        } else {
          quizSelect.disabled = true;
        }
      });
    }

    await this.table.render();
  }

  async viewSubmission(id) {
    try {
      const response = await this.apiService.getQuizSubmissionById(id);
      
      if (response && response.isSuccess && response.result) {
        const submission = response.result;
        
        // Create modal to show submission details
        let submissionHTML = '<div class="bg-white rounded-lg shadow-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">';
        submissionHTML += '<h3 class="text-lg font-semibold mb-4">Quiz Submission Details</h3>';
        submissionHTML += `<div class="space-y-3">`;
        const formatDate = this.apiService.formatDateForDisplay || ((d) => d ? new Date(d).toLocaleString() : '');
        submissionHTML += `<p><strong>Started At:</strong> ${formatDate(submission.startedAt || submission.StartedAt)}</p>`;
        submissionHTML += `<p><strong>Submitted At:</strong> ${formatDate(submission.submittedAt || submission.SubmittedAt)}</p>`;
        submissionHTML += `<p><strong>Time Spent:</strong> ${submission.timeSpent || submission.TimeSpent || 0} minutes</p>`;
        submissionHTML += `<p><strong>Score:</strong> ${submission.score !== undefined ? submission.score : (submission.Score !== undefined ? submission.Score : 'Not graded')}</p>`;
        submissionHTML += `<p><strong>Status:</strong> ${submission.status || submission.Status || 'submitted'}</p>`;
        submissionHTML += `<p><strong>Late:</strong> ${submission.isLate || submission.IsLate ? 'Yes' : 'No'}</p>`;
        
        if (submission.answers || submission.Answers) {
          try {
            const answers = JSON.parse(submission.answers || submission.Answers);
            submissionHTML += '<div class="mt-4"><strong>Answers:</strong><pre class="bg-gray-100 p-3 rounded mt-2 text-sm">' + JSON.stringify(answers, null, 2) + '</pre></div>';
          } catch (e) {
            submissionHTML += `<div class="mt-4"><strong>Answers:</strong><p class="mt-2">${submission.answers || submission.Answers}</p></div>`;
          }
        }
        
        submissionHTML += '</div>';
        submissionHTML += '<button onclick="this.closest(\'.bg-white\').closest(\'.fixed\').remove()" class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>';
        submissionHTML += '</div>';

        // Show as modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = submissionHTML;
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
      } else {
        this.showError('Submission not found');
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      this.showError('Failed to load submission: ' + error.message);
    }
  }

  async deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteQuizSubmission(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Submission deleted successfully!');
        if (this.selectedQuizId) {
          await this.loadSubmissions(this.selectedQuizId);
        }
      } else {
        throw new Error(result?.result || 'Failed to delete submission');
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
}

// Expose globally
window.TeacherTrackQuizSubmission = TeacherTrackQuizSubmission;

