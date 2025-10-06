// EvalApiService - API service for Eval module
class EvalApiService {
  constructor() {
    this.rootURL = window.__ROOT_URL__ || "";
    this.baseUrl = `${this.rootURL}/eval`;
  }

  async fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch error:', err);
      return { isSuccess: false, result: err.message };
    }
  }

  formatToRFC3339(dtLocal) {
    if (!dtLocal) return null;
    return dtLocal + ":00Z";
  }

  // Assignment API calls
  async createAssignment(assignmentData) {
    const payload = {
      title: assignmentData.name,
      description: assignmentData.description,
      dueDate: this.formatToRFC3339(assignmentData.dueDate),
      startDate: this.formatToRFC3339(assignmentData.startDate),
      maxScore: Number(assignmentData.maxScore),
      instructorId: 1,
      courseId: 101,
      isReleased: true,
      isActive: true
    };

    return await this.fetchJSON(`${this.baseUrl}/assignment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async getAllAssignments() {
    return await this.fetchJSON(`${this.baseUrl}/assignment/getAll`);
  }

  // Quiz Submission API calls
  async createQuizSubmission(quizSubmissionData) {
    const payload = {
      quizId: Number(quizSubmissionData.quizId),
      studentId: Number(quizSubmissionData.studentId),
      startedAt: this.formatToRFC3339(quizSubmissionData.startedAt),
      submittedAt: this.formatToRFC3339(quizSubmissionData.submittedAt),
      answers: quizSubmissionData.answers || '{}',
      timeSpent: Number(quizSubmissionData.timeSpent) || 0,
      isLate: quizSubmissionData.isLate || false,
      status: quizSubmissionData.status || 'submitted'
    };

    if (quizSubmissionData.score) {
      payload.score = Number(quizSubmissionData.score);
    }

    return await this.fetchJSON(`${this.baseUrl}/quiz/submission/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async getAllQuizSubmissions() {
    return await this.fetchJSON(`${this.baseUrl}/quiz/submission/getAll`);
  }

  // General Submission API calls
  async createSubmission(submissionData) {
    const payload = {
      type: submissionData.type,
      title: submissionData.title,
      studentId: Number(submissionData.studentId),
      studentName: submissionData.studentName,
      submittedAt: this.formatToRFC3339(submissionData.submittedAt),
      maxScore: Number(submissionData.maxScore),
      isLate: submissionData.isLate || false,
      status: submissionData.status || 'submitted',
      feedback: submissionData.feedback || ''
    };

    if (submissionData.score) {
      payload.score = Number(submissionData.score);
    }

    return await this.fetchJSON(`${this.baseUrl}/submission/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async getAllSubmissions() {
    return await this.fetchJSON(`${this.baseUrl}/submission/getAll`);
  }
}

// Make it globally available
window.EvalApiService = EvalApiService;
