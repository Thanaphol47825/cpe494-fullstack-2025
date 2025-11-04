// SubmissionManage - For teachers to manage submitted assignments
class SubmissionManage {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
    this.assignments = [];
    this.selectedAssignmentId = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Load assignments for dropdown
    await this.loadAssignments();

    // Setup table
    this.table = new EvalTableRenderer(this.application.templateEngine, {
      modelPath: "eval/assignmentsubmission",
      data: [],
      targetSelector: "#submission-table-container",
      customColumns: [
        {
          name: "files",
          label: "Files",
          template: `<button onclick="submissionManager.viewFiles({ID})" class="text-blue-600 hover:underline">View Files</button>`
        },
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="submissionManager.deleteSubmission({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally
    window.submissionManager = this;

    try {
      await this.table.loadSchema();
      await this.renderManagePage();
      // Don't load submissions until assignment is selected
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load submissions: ' + error.message);
    }
  }

  async loadAssignments() {
    try {
      const response = await this.apiService.getAllAssignments();
      if (response && response.isSuccess && Array.isArray(response.result)) {
        this.assignments = response.result;
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      this.showError('Failed to load assignments');
    }
  }

  async renderManagePage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Submitted Assignments</h1>
            <p class="text-lg text-gray-600">View and manage student submissions</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Assignment Filter -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Assignment
            </label>
            <select 
              id="assignment-filter" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onchange="submissionManager.onAssignmentChange(this.value)"
            >
              <option value="">-- Select an assignment to view submissions --</option>
              ${this.assignments.map(a => 
                `<option value="${a.ID || a.id || a.Id}">${a.title || 'Untitled Assignment'}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="submission-table-container">
              <p class="text-gray-500 text-center py-8">Please select an assignment to view submissions</p>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.table.render();
  }

  async onAssignmentChange(assignmentId) {
    this.selectedAssignmentId = assignmentId;
    
    if (!assignmentId || assignmentId === '') {
      // Clear table
      this.table.setData([]);
      const container = document.getElementById('submission-table-container');
      if (container) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Please select an assignment to view submissions</p>';
      }
      return;
    }

    await this.loadSubmissions(assignmentId);
  }

  async loadSubmissions(assignmentId) {
    try {
      const response = await this.apiService.getSubmissionsByAssignment(assignmentId);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const submissions = response.result.map(s => ({
          ...s,
          ID: s.ID || s.id || s.Id
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

  async viewFiles(id) {
    try {
      const response = await this.apiService.getSubmissionFiles(id);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const files = response.result;
        
        if (files.length === 0) {
          this.showInfo('No files attached to this submission');
          return;
        }

        // Create modal to show files
        let filesHTML = '<div class="bg-white rounded-lg shadow-lg p-6 max-w-md">';
        filesHTML += '<h3 class="text-lg font-semibold mb-4">Submission Files</h3>';
        filesHTML += '<ul class="space-y-2">';
        
        files.forEach(file => {
          filesHTML += `<li class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <span class="text-sm text-gray-700">${file.original}</span>
            <a href="${RootURL}${file.url}" target="_blank" class="text-blue-600 hover:underline text-sm">Download</a>
          </li>`;
        });
        
        filesHTML += '</ul>';
        filesHTML += '<button onclick="this.closest(\'.bg-white\').remove()" class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>';
        filesHTML += '</div>';

        // Show as modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = filesHTML;
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
      } else {
        this.showError('No files found for this submission');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      this.showError('Failed to load files: ' + error.message);
    }
  }

  async deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteAssignmentSubmission(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Submission deleted successfully!');
        if (this.selectedAssignmentId) {
          await this.loadSubmissions(this.selectedAssignmentId);
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

  showInfo(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-blue-100 text-blue-800 border border-blue-200';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}

// Expose globally
window.SubmissionManage = SubmissionManage;
