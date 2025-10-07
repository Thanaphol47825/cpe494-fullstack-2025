// EvalValidator - Validation utilities for Eval module
class EvalValidator {
  constructor() {}

  validateAssignment(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Assignment name is required');
    }

    if (data.maxScore && (isNaN(data.maxScore) || data.maxScore < 1 || data.maxScore > 1000)) {
      errors.push('Max score must be between 1 and 1000');
    }

    if (data.startDate && data.dueDate && new Date(data.startDate) >= new Date(data.dueDate)) {
      errors.push('Start date must be before due date');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateQuizSubmission(data) {
    const errors = [];

    if (!data.quizId || isNaN(data.quizId) || data.quizId < 1) {
      errors.push('Valid Quiz ID is required');
    }

    if (!data.studentId || isNaN(data.studentId) || data.studentId < 1) {
      errors.push('Valid Student ID is required');
    }

    if (!data.startedAt) {
      errors.push('Started At is required');
    }

    if (!data.submittedAt) {
      errors.push('Submitted At is required');
    }

    if (data.startedAt && data.submittedAt && new Date(data.startedAt) >= new Date(data.submittedAt)) {
      errors.push('Started time must be before submitted time');
    }

    if (data.score && (isNaN(data.score) || data.score < 0 || data.score > 100)) {
      errors.push('Score must be between 0 and 100');
    }

    if (data.timeSpent && (isNaN(data.timeSpent) || data.timeSpent < 0)) {
      errors.push('Time spent must be a positive number');
    }

    // Validate JSON answers
    if (data.answers && data.answers.trim()) {
      try {
        JSON.parse(data.answers);
      } catch (e) {
        errors.push('Answers must be valid JSON format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateSubmission(data) {
    const errors = [];

    if (!data.type) {
      errors.push('Submission type is required');
    }

    if (!data.title || !data.title.trim()) {
      errors.push('Title is required');
    }

    if (!data.studentId || isNaN(data.studentId) || data.studentId < 1) {
      errors.push('Valid Student ID is required');
    }

    if (!data.studentName || !data.studentName.trim()) {
      errors.push('Student name is required');
    }

    if (!data.submittedAt) {
      errors.push('Submitted At is required');
    }

    if (!data.maxScore || isNaN(data.maxScore) || data.maxScore < 1 || data.maxScore > 1000) {
      errors.push('Valid Max Score is required (1-1000)');
    }

    if (data.score && (isNaN(data.score) || data.score < 0 || data.score > data.maxScore)) {
      errors.push(`Score must be between 0 and ${data.maxScore}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateQuiz(quizData) {
    const errors = [];

    if (!quizData.title || quizData.title.trim() === '') {
      errors.push('Quiz title is required');
    }

    if (!quizData.instructorId || isNaN(quizData.instructorId)) {
      errors.push('Valid instructor ID is required');
    }

    if (!quizData.courseId || isNaN(quizData.courseId)) {
      errors.push('Valid course ID is required');
    }

    if (!quizData.startDate) {
      errors.push('Start date is required');
    }

    if (!quizData.dueDate) {
      errors.push('Due date is required');
    }

    if (quizData.startDate && quizData.dueDate) {
      const startDate = new Date(quizData.startDate);
      const dueDate = new Date(quizData.dueDate);
      if (dueDate <= startDate) {
        errors.push('Due date must be after start date');
      }
    }

    if (quizData.timeLimit && (isNaN(quizData.timeLimit) || quizData.timeLimit <= 0)) {
      errors.push('Time limit must be a positive number');
    }

    if (quizData.maxScore && (isNaN(quizData.maxScore) || quizData.maxScore <= 0)) {
      errors.push('Max score must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  showErrors(errors) {
    if (errors.length > 0) {
      alert('Validation Errors:\n' + errors.join('\n'));
      return false;
    }
    return true;
  }
}

// Make it globally available
window.EvalValidator = EvalValidator;
