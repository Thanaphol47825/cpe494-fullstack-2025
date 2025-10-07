// QuizSubmissionCreate - Quiz submission creation feature
class QuizSubmissionCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
  }

  async initialize() {
    const container = document.getElementById('quiz-submission-demo');
    if (!container) return;

    container.innerHTML = `
      <div class="demo-section">
        <h2>Quiz Submission Management</h2>
        <form id="quizSubmissionForm">
          <label>Quiz ID:</label>
          <input type="number" name="quizId" required placeholder="Enter quiz ID" min="1" />
          <label>Student ID:</label>
          <input type="number" name="studentId" required placeholder="Enter student ID" min="1" />
          <label>Started At:</label>
          <input type="datetime-local" name="startedAt" required />
          <label>Submitted At:</label>
          <input type="datetime-local" name="submittedAt" required />
          <label>Answers (JSON):</label>
          <textarea name="answers" placeholder='{"q1": "A", "q2": "B", "q3": "C"}' rows="3"></textarea>
          <label>Time Spent (seconds):</label>
          <input type="number" name="timeSpent" placeholder="1800" min="0" />
          <label>Score (optional):</label>
          <input type="number" name="score" placeholder="Leave empty if not graded" min="0" max="100" />
          <label>
            <input type="checkbox" name="isLate" />
            Is Late Submission
          </label>
          <label>Status:</label>
          <select name="status">
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="pending">Pending</option>
          </select>
          <input type="submit" value="Create Quiz Submission" />
        </form>

        <button id="loadAllQuizSubmissionsBtn">Load All Quiz Submissions</button>

        <h3>Latest Quiz Result:</h3>
        <div id="quizSubmissionResult"></div>
        <h3>All Quiz Submissions:</h3>
        <div id="allQuizSubmissions"></div>
      </div>
    `;

    // Attach event listeners
    document.getElementById("quizSubmissionForm")
      .addEventListener("submit", (e) => this.handleSubmit(e));
    document.getElementById("loadAllQuizSubmissionsBtn")
      .addEventListener("click", () => this.loadAllQuizSubmissions());

    // Load initial data
    await this.loadAllQuizSubmissions();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add checkbox value
    data.isLate = form.isLate.checked;

    // Validate data
    const validation = this.validator.validateQuizSubmission(data);
    if (!this.validator.showErrors(validation.errors)) {
      return;
    }

    // Submit data
    const result = await this.apiService.createQuizSubmission(data);
    
    document.getElementById('quizSubmissionResult').textContent = JSON.stringify(result, null, 2);
    await this.loadAllQuizSubmissions();
    document.getElementById('quizSubmissionForm').reset();
  }

  async loadAllQuizSubmissions() {
    const data = await this.apiService.getAllQuizSubmissions();
    this.ui.displayData('allQuizSubmissions', data, (quizSubmission) => {
      const quizId = quizSubmission.quizId || quizSubmission.QuizID;
      const studentId = quizSubmission.studentId || quizSubmission.StudentID;
      const score = quizSubmission.score || quizSubmission.Score || 'Not graded';
      const status = quizSubmission.status || quizSubmission.Status;
      const timeSpent = quizSubmission.timeSpent || quizSubmission.TimeSpent;
      return `Quiz ID: ${quizId}, Student ID: ${studentId}, Score: ${score}, Status: ${status}, Time: ${timeSpent}s`;
    });
  }
}

// Make it globally available
window.QuizSubmissionCreate = QuizSubmissionCreate;
