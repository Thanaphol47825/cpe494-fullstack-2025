
if (typeof window !== 'undefined' && !window.InterviewEdit) {
  class InterviewEdit {
    constructor(applicationOrEngine, rootURL, interviewId) {
      this.app = applicationOrEngine;
      this.rootURL = rootURL;
      this.interviewId = interviewId;
    }

    async render() {
      const createForm = new InterviewCreate(this.app, this.rootURL, this.interviewId);
      return await createForm.render();
    }
  }

  window.InterviewEdit = InterviewEdit;
}

