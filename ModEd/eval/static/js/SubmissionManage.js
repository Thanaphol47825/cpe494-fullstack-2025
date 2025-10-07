// SubmissionManage - Submission Management Module with Evaluation Integration
class SubmissionManage {
  constructor() {
    this.apiService = new EvalApiService();
    this.submissions = [];
    this.evaluations = [];
  }

  async initialize() {
    const container = document.getElementById('submission-demo') || document.getElementById('MainContainer') || document.body;
    
    try {
      // Load template
      const response = await fetch('/eval/static/view/SubmissionManage.tpl');
      const template = await response.text();
      container.innerHTML = template;
      
      // Load data and display
      await this.loadSubmissions();
      await this.loadEvaluations();
      
      console.log('SubmissionManage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SubmissionManage:', error);
      container.innerHTML = '<div class="error">Failed to load submission management</div>';
    }
  }

  async loadSubmissions() {
    try {
      this.submissions = await this.apiService.getAllSubmissions();
      this.renderSubmissionsList();
    } catch (error) {
      console.error('Failed to load submissions:', error);
      const listDiv = document.getElementById('submissionsList');
      if (listDiv) {
        listDiv.innerHTML = `<div class="error">Error loading submissions: ${error.message}</div>`;
      }
    }
  }

  async loadEvaluations() {
    try {
      this.evaluations = await this.apiService.getAllEvaluations();
      this.renderEvaluationAnalytics();
    } catch (error) {
      console.error('Failed to load evaluations:', error);
      // Set default values if API fails
      this.renderEvaluationAnalytics([]);
    }
  }

  renderEvaluationAnalytics(evaluations = this.evaluations) {
    const totalEvaluations = evaluations.length;
    const pendingEvaluations = evaluations.filter(e => e.status === 'draft').length;
    const completedEvaluations = evaluations.filter(e => e.status === 'final').length;
    
    let totalScore = 0;
    let scoredCount = 0;
    evaluations.forEach(eval => {
      if (eval.score && eval.maxScore) {
        totalScore += (eval.score / eval.maxScore) * 100;
        scoredCount++;
      }
    });
    
    const averageScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0;

    // Update analytics display
    document.getElementById('totalEvaluations').textContent = totalEvaluations;
    document.getElementById('pendingEvaluations').textContent = pendingEvaluations;
    document.getElementById('completedEvaluations').textContent = completedEvaluations;
    document.getElementById('averageEvaluationScore').textContent = averageScore;
  }

  renderSubmissionsList() {
    const listDiv = document.getElementById('submissionsList');
    if (!listDiv) return;

    if (this.submissions.length === 0) {
      listDiv.innerHTML = '<div class="text-gray-500">No submissions found</div>';
      return;
    }

    const submissionsHTML = this.submissions.map(submission => {
      const evaluation = this.evaluations.find(e => e.submissionId === submission.id);
      const hasEvaluation = evaluation ? true : false;
      
      return `
        <div class="submission-item bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900 mb-2">${submission.title}</h4>
              <p class="text-gray-600 mb-2">Type: ${submission.type}</p>
              <p class="text-gray-600 mb-2">Student: ${submission.studentName} (ID: ${submission.studentId})</p>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}</div>
                <div>Status: ${submission.status}</div>
                <div>Max Score: ${submission.maxScore}</div>
                <div>Score: ${submission.score || 'Not graded'}</div>
              </div>
              <div class="flex gap-2 mt-3">
                ${submission.isLate ? '<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Late</span>' : ''}
                ${hasEvaluation ? '<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Evaluated</span>' : '<span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>'}
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button onclick="submissionManage.viewSubmission(${submission.id})" class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                View
              </button>
              ${hasEvaluation ? 
                `<button onclick="submissionManage.editEvaluation(${evaluation.id})" class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">Edit Grade</button>` :
                `<button onclick="submissionManage.createEvaluation(${submission.id})" class="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">Grade</button>`
              }
              <button onclick="submissionManage.deleteSubmission(${submission.id})" class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listDiv.innerHTML = submissionsHTML;
  }

  async viewSubmission(submissionId) {
    try {
      const submission = await this.apiService.getSubmissionById(submissionId);
      this.showSubmissionDetails(submission);
    } catch (error) {
      console.error('Failed to load submission details:', error);
    }
  }

  showSubmissionDetails(submission) {
    const editorDiv = document.getElementById('evaluationEditor');
    if (!editorDiv) return;

    editorDiv.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4">Submission Details</h4>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Title</label>
            <div class="text-gray-900">${submission.title}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <div class="text-gray-900">${submission.type}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Student</label>
            <div class="text-gray-900">${submission.studentName} (ID: ${submission.studentId})</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Submitted At</label>
            <div class="text-gray-900">${new Date(submission.submittedAt).toLocaleString()}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <div class="text-gray-900">${submission.status}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Score</label>
            <div class="text-gray-900">${submission.score || 'Not graded'} / ${submission.maxScore}</div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Content</label>
          <div class="bg-white p-3 rounded border text-gray-900 max-h-40 overflow-y-auto">${submission.content || 'No content'}</div>
        </div>
        ${submission.feedback ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Feedback</label>
            <div class="bg-white p-3 rounded border text-gray-900">${submission.feedback}</div>
          </div>
        ` : ''}
        <div class="flex gap-2">
          <button onclick="document.getElementById('evaluationEditor').innerHTML = ''" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Close</button>
        </div>
      </div>
    `;
  }

  async createEvaluation(submissionId) {
    const submission = this.submissions.find(s => s.id === submissionId);
    if (!submission) return;

    this.showEvaluationForm(submission);
  }

  showEvaluationForm(submission) {
    const editorDiv = document.getElementById('evaluationEditor');
    if (!editorDiv) return;

    editorDiv.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4">Grade Submission</h4>
        <form id="createEvaluationForm">
          <input type="hidden" name="submissionId" value="${submission.id}">
          <input type="hidden" name="submissionType" value="${submission.type}">
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Score</label>
              <input type="number" name="score" min="0" max="${submission.maxScore}" required class="w-full rounded border px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Max Score</label>
              <input type="number" name="maxScore" value="${submission.maxScore}" required class="w-full rounded border px-3 py-2">
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea name="feedback" rows="4" class="w-full rounded border px-3 py-2" placeholder="Provide feedback for the student..."></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Criteria</label>
            <textarea name="criteria" rows="2" class="w-full rounded border px-3 py-2" placeholder="Evaluation criteria used..."></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" class="w-full rounded border px-3 py-2">
              <option value="draft">Draft</option>
              <option value="final">Final</option>
            </select>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Evaluation</button>
            <button type="button" onclick="document.getElementById('evaluationEditor').innerHTML = ''" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      </div>
    `;

    // Setup form handler
    const form = document.getElementById('createEvaluationForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const evaluationData = {
        submissionId: parseInt(formData.get('submissionId')),
        submissionType: formData.get('submissionType'),
        instructorId: 1, // TODO: Get from session
        score: parseInt(formData.get('score')),
        maxScore: parseInt(formData.get('maxScore')),
        feedback: formData.get('feedback'),
        criteria: formData.get('criteria'),
        status: formData.get('status')
      };

      try {
        await this.apiService.createEvaluation(evaluationData);
        await this.loadEvaluations();
        await this.loadSubmissions(); // Refresh to show evaluation status
        editorDiv.innerHTML = '';
        console.log('Evaluation created successfully');
      } catch (error) {
        console.error('Failed to create evaluation:', error);
      }
    });
  }

  async editEvaluation(evaluationId) {
    try {
      const evaluation = await this.apiService.getEvaluationById(evaluationId);
      const submission = this.submissions.find(s => s.id === evaluation.submissionId);
      this.showEvaluationEditForm(evaluation, submission);
    } catch (error) {
      console.error('Failed to load evaluation for editing:', error);
    }
  }

  showEvaluationEditForm(evaluation, submission) {
    const editorDiv = document.getElementById('evaluationEditor');
    if (!editorDiv) return;

    editorDiv.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4">Edit Evaluation</h4>
        <form id="editEvaluationForm">
          <input type="hidden" name="id" value="${evaluation.id}">
          <input type="hidden" name="submissionId" value="${evaluation.submissionId}">
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Score</label>
              <input type="number" name="score" value="${evaluation.score}" min="0" max="${evaluation.maxScore}" required class="w-full rounded border px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Max Score</label>
              <input type="number" name="maxScore" value="${evaluation.maxScore}" required class="w-full rounded border px-3 py-2">
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea name="feedback" rows="4" class="w-full rounded border px-3 py-2">${evaluation.feedback || ''}</textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Criteria</label>
            <textarea name="criteria" rows="2" class="w-full rounded border px-3 py-2">${evaluation.criteria || ''}</textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" class="w-full rounded border px-3 py-2">
              <option value="draft" ${evaluation.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="final" ${evaluation.status === 'final' ? 'selected' : ''}>Final</option>
            </select>
          </div>
          
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
            <button type="button" onclick="document.getElementById('evaluationEditor').innerHTML = ''" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
            <button type="button" onclick="submissionManage.deleteEvaluation(${evaluation.id})" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </div>
        </form>
      </div>
    `;

    // Setup form handler
    const form = document.getElementById('editEvaluationForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const evaluationData = {
        id: parseInt(formData.get('id')),
        submissionId: parseInt(formData.get('submissionId')),
        submissionType: evaluation.submissionType,
        instructorId: evaluation.instructorId,
        score: parseInt(formData.get('score')),
        maxScore: parseInt(formData.get('maxScore')),
        feedback: formData.get('feedback'),
        criteria: formData.get('criteria'),
        status: formData.get('status')
      };

      try {
        await this.apiService.updateEvaluation(evaluationData);
        await this.loadEvaluations();
        await this.loadSubmissions(); // Refresh to show updated status
        editorDiv.innerHTML = '';
        console.log('Evaluation updated successfully');
      } catch (error) {
        console.error('Failed to update evaluation:', error);
      }
    });
  }

  async deleteSubmission(submissionId) {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await this.apiService.deleteSubmission(submissionId);
      await this.loadSubmissions(); // Refresh the list
      console.log('Submission deleted successfully');
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  }

  async deleteEvaluation(evaluationId) {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;

    try {
      await this.apiService.deleteEvaluation(evaluationId);
      await this.loadEvaluations();
      await this.loadSubmissions(); // Refresh to show updated status
      document.getElementById('evaluationEditor').innerHTML = '';
      console.log('Evaluation deleted successfully');
    } catch (error) {
      console.error('Failed to delete evaluation:', error);
    }
  }
}

// Make SubmissionManage globally accessible
window.submissionManage = new SubmissionManage();