// EvalApiService - API service for Eval module
class EvalApiService {
  constructor() {
    this.rootURL = RootURL || "";
    this.baseUrl = `${this.rootURL}/eval`;
  }

  async fetchJSON(url, options = {}) {
    try {
      // Ensure URL is absolute (add protocol if missing)
      let fullUrl = url;
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        // Check if URL already contains the base (e.g., "localhost:8080/eval/...")
        const baseUrl = this.rootURL || RootURL || '';
        if (baseUrl && url.includes(baseUrl)) {
          // URL already has base, just add protocol
          fullUrl = `http://${url}`;
        } else if (baseUrl) {
          // URL is relative, prepend base with protocol
          if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
            fullUrl = `http://${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          } else {
            fullUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          }
        } else {
          // Fallback: use current origin
          fullUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
        }
      }
      
      const res = await fetch(fullUrl, options);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch error:', err);
      return { isSuccess: false, result: err.message };
    }
  }

  async uploadFormData(url, formData) {
    try {
      // Ensure URL is absolute - always use window.location.origin for reliability
      let fullUrl = url;
      
      // If URL is already absolute, use it as-is
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        fullUrl = url;
      } else if (url) {
        // If URL contains host:port pattern but no protocol, add http://
        if (url.match(/^[a-zA-Z0-9.-]+:\d+/)) {
          fullUrl = `http://${url}`;
        } else {
          // URL is relative, prepend origin
          fullUrl = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
        }
      }
      
      console.log('Uploading to:', fullUrl);
      console.log('Original URL:', url, 'Origin:', window.location.origin);
      console.log('FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? v.name : v]));
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        credentials: 'same-origin' // Include cookies if any
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server response error:', res.status, res.statusText, errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorText}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return { isSuccess: false, result: err.message };
    }
  }

  formatToRFC3339(dtLocal) {
    if (!dtLocal) return null;
    // If already in ISO Zulu format, return as-is
    if (typeof dtLocal === 'string' && /Z$/.test(dtLocal)) return dtLocal;
    // If it looks like a datetime-local (YYYY-MM-DDTHH:MM) append seconds and Z
    if (typeof dtLocal === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dtLocal)) return dtLocal + ":00Z";
    // Try to parse and toISOString
    try {
      const d = new Date(dtLocal);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch (e) {}
    return null;
  }

  // Format date for display in tables: "DD/MM/YYYY HH:MM"
  formatDateForDisplay(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  }

  // Assignment API calls
  async createAssignment(assignmentData) {
    // Prepare base payload with all required fields
    const payload = {
      courseId: Number(assignmentData.courseId),
      title: assignmentData.name || assignmentData.title,
      description: assignmentData.description || '',
      dueDate: this.formatToRFC3339(assignmentData.dueDate),
      startDate: this.formatToRFC3339(assignmentData.startDate),
      maxScore: Number(assignmentData.maxScore),
    };

    if (assignmentData.files && assignmentData.files.length > 0) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Add assignment data as JSON string
      formData.append('data', JSON.stringify(payload));
      
      // Append all files
      for (const file of assignmentData.files) {
        formData.append('files', file);
      }

      // Use helper to upload multipart FormData
      return await this.uploadFormData(`${this.baseUrl}/assignment/create`, formData);
    } else {
      // Handle regular assignment creation without files
      return await this.fetchJSON(`${this.baseUrl}/assignment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  }

  async getAllAssignments() {
    return await this.fetchJSON(`${this.baseUrl}/assignment/getAll`);
  }

  async deleteAssignment(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/delete/${id}`, {
      method: 'POST'
    });
  }

  async getAssignmentById(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/get/${id}`);
  }

  async updateAssignment(assignmentData) {
    if (assignmentData.files) {
      // Handle file upload with FormData
      const formData = new FormData();
      
      // Add assignment data
      const payload = {
        ID: Number(assignmentData.ID),
        title: assignmentData.name || assignmentData.title,
        description: assignmentData.description,
        dueDate: this.formatToRFC3339(assignmentData.dueDate),
        startDate: this.formatToRFC3339(assignmentData.startDate),
        maxScore: Number(assignmentData.maxScore),
      };
      
      formData.append('data', JSON.stringify(payload));
      
      // Append all files
      for (const file of assignmentData.files) {
        formData.append('files', file);
      }

      // Use helper to upload multipart FormData
      return await this.uploadFormData(`${this.baseUrl}/assignment/update`, formData);
    } else {
      // Handle regular assignment update without files
      const payload = {
        ID: Number(assignmentData.ID),
        title: assignmentData.name || assignmentData.title,
        description: assignmentData.description,
        dueDate: this.formatToRFC3339(assignmentData.dueDate),
        startDate: this.formatToRFC3339(assignmentData.startDate),
        maxScore: Number(assignmentData.maxScore),
      };

      return await this.fetchJSON(`${this.baseUrl}/assignment/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  }

  async getAssignmentFiles(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/files/${id}`);
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

  async getQuizSubmissionById(id) {
    return await this.fetchJSON(`${this.baseUrl}/quiz/submission/get/${id}`);
  }

  async deleteQuizSubmission(id) {
    return await this.fetchJSON(`${this.baseUrl}/quiz/submission/delete/${id}`);
  }

  // General Submission API calls
  async createSubmission(submissionData) {
    const payload = {
      type: submissionData.type,
      title: submissionData.title,
      studentId: Number(submissionData.studentId),
      studentName: submissionData.studentName,
      submittedAt: this.formatToRFC3339(submissionData.submittedAt) || new Date().toISOString(),
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
      body: JSON.stringify(Object.assign(payload, { lastModified: new Date().toISOString() }))
    });
  }

  async getAllSubmissions() {
    return await this.fetchJSON(`${this.baseUrl}/submission/getAll`);
  }

  // Quiz API calls
  async createQuiz(requestData) {
    const payload = {
      quiz: {
        courseId: Number(requestData.quiz.courseId),
        title: requestData.quiz.title,
        description: requestData.quiz.description || '',
        startDate: this.formatToRFC3339(new Date(requestData.quiz.startDate)),
        dueDate: this.formatToRFC3339(new Date(requestData.quiz.dueDate)),
        timeLimit: Number(requestData.quiz.timeLimit),
        maxScore: Number(requestData.quiz.maxScore)
      },
      questions: requestData.questions || []
    };

    return await this.fetchJSON(`${this.baseUrl}/quiz/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async getAllQuizzes() {
    return await this.fetchJSON(`${this.baseUrl}/quiz/getAll`);
  }

  async getQuizById(id) {
    return await this.fetchJSON(`${this.baseUrl}/quiz/get/${id}`);
  }

  async updateQuiz(requestData) {
    const payload = {
      quiz: {
        ID: Number(requestData.quiz.ID),
        courseId: Number(requestData.quiz.courseId),
        title: requestData.quiz.title,
        description: requestData.quiz.description || '',
        startDate: this.formatToRFC3339(new Date(requestData.quiz.startDate)),
        dueDate: this.formatToRFC3339(new Date(requestData.quiz.dueDate)),
        timeLimit: Number(requestData.quiz.timeLimit),
        maxScore: Number(requestData.quiz.maxScore)
      },
      questions: requestData.questions || []
    };

    return await this.fetchJSON(`${this.baseUrl}/quiz/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async deleteQuiz(id) {
    return await this.fetchJSON(`${this.baseUrl}/quiz/delete/${id}`, {
      method: "POST"
    });
  }

  // Assignment Progress API calls
  async createAssignmentProgress(progressData) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/progress/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progressData)
    });
  }

  async getAllAssignmentProgresses() {
    return await this.fetchJSON(`${this.baseUrl}/assignment/progress/getAll`);
  }

  async getAssignmentProgressById(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/progress/get/${id}`);
  }

  async updateAssignmentProgress(progressData) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/progress/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progressData)
    });
  }

  async deleteAssignmentProgress(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/progress/delete/${id}`);
  }

  // Evaluation API calls
  async createEvaluation(evaluationData) {
    return await this.fetchJSON(`${this.baseUrl}/evaluation/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evaluationData)
    });
  }

  async getAllEvaluations() {
    return await this.fetchJSON(`${this.baseUrl}/evaluation/getAll`);
  }

  async getEvaluationById(id) {
    return await this.fetchJSON(`${this.baseUrl}/evaluation/get/${id}`);
  }

  async updateEvaluation(evaluationData) {
    return await this.fetchJSON(`${this.baseUrl}/evaluation/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evaluationData)
    });
  }

  async deleteEvaluation(id) {
    return await this.fetchJSON(`${this.baseUrl}/evaluation/delete/${id}`);
  }

  // Assignment Submission API calls
  async createAssignmentSubmission(formData) {
    return await this.uploadFormData(`${this.baseUrl}/assignment/submission/create`, formData);
  }

  async getAllAssignmentSubmissions() {
    return await this.fetchJSON(`${this.baseUrl}/assignment/submission/getAll`);
  }

  async getSubmissionsByAssignment(assignmentId) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/submission/getByAssignment/${assignmentId}`);
  }

  async getAssignmentSubmissionById(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/submission/get/${id}`);
  }

  async getSubmissionFiles(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/submission/files/${id}`);
  }

  async deleteAssignmentSubmission(id) {
    return await this.fetchJSON(`${this.baseUrl}/assignment/submission/delete/${id}`, {
      method: 'POST'
    });
  }

  // Curriculum module API calls (for course data)
  async getAllCourses() {
    return await this.fetchJSON(`${this.rootURL}/curriculum/Course/getCourses`);
  }

  async getCurrentUserRole() {
    return await this.fetchJSON(`${this.baseUrl}/user/role`);
  }
}

// Make it globally available
window.EvalApiService = EvalApiService;
