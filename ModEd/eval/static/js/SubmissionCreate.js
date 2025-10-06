// SubmissionCreate - General submission creation feature
class SubmissionCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
  }

  async initialize() {
    const container = document.getElementById('submission-demo');
    if (!container) return;

    container.innerHTML = `
      <div class="demo-section">
        <h2>General Submission Management</h2>
        <form id="submissionForm">
          <label>Submission Type:</label>
          <select name="type" required>
            <option value="">Select Type</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="homework">Homework</option>
          </select>
          <label>Title:</label>
          <input type="text" name="title" required placeholder="Enter submission title" />
          <label>Student ID:</label>
          <input type="number" name="studentId" required placeholder="Enter student ID" min="1" />
          <label>Student Name:</label>
          <input type="text" name="studentName" required placeholder="Enter student name" />
          <label>Submitted At:</label>
          <input type="datetime-local" name="submittedAt" required />
          <label>Max Score:</label>
          <input type="number" name="maxScore" required placeholder="100" min="1" max="1000" />
          <label>Score (optional):</label>
          <input type="number" name="score" placeholder="Leave empty if not graded" min="0" />
          <label>Status:</label>
          <select name="status">
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="pending">Pending</option>
            <option value="late">Late</option>
          </select>
          <label>
            <input type="checkbox" name="isLate" />
            Is Late Submission
          </label>
          <label>Feedback:</label>
          <textarea name="feedback" placeholder="Enter feedback (optional)" rows="3"></textarea>
          <input type="submit" value="Create Submission" />
        </form>

        <button id="loadAllSubmissionsBtn">Load All Submissions</button>

        <h3>Latest Submission Result:</h3>
        <div id="submissionResult"></div>
        <h3>All Submissions:</h3>
        <div id="allSubmissions"></div>
      </div>
    `;

    // Attach event listeners
    document.getElementById("submissionForm")
      .addEventListener("submit", (e) => this.handleSubmit(e));
    document.getElementById("loadAllSubmissionsBtn")
      .addEventListener("click", () => this.loadAllSubmissions());

    // Load initial data
    await this.loadAllSubmissions();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add checkbox value
    data.isLate = form.isLate.checked;

    // Validate data
    const validation = this.validator.validateSubmission(data);
    if (!this.validator.showErrors(validation.errors)) {
      return;
    }

    // Submit data
    const result = await this.apiService.createSubmission(data);
    
    document.getElementById('submissionResult').textContent = JSON.stringify(result, null, 2);
    await this.loadAllSubmissions();
    document.getElementById('submissionForm').reset();
  }

  async loadAllSubmissions() {
    const data = await this.apiService.getAllSubmissions();
    this.ui.displayData('allSubmissions', data, (submission) => {
      const type = submission.type || submission.Type;
      const title = submission.title || submission.Title;
      const studentName = submission.studentName || submission.StudentName;
      const score = submission.score || submission.Score || 'Not graded';
      const status = submission.status || submission.Status;
      const maxScore = submission.maxScore || submission.MaxScore;
      return `${type.toUpperCase()}: ${title} | Student: ${studentName} | Score: ${score}/${maxScore} | Status: ${status}`;
    });
  }
}

// Make it globally available
window.SubmissionCreate = SubmissionCreate;
