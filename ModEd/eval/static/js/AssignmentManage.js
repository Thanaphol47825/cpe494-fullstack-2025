// AssignmentManage - Using AdvanceTableRender from core
class AssignmentManage {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container and add wrapper
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Assignments</h1>
            <p class="text-lg text-gray-600">View and manage all assignments</p>
          </div>
          
          <!-- Back Button -->
          <div class="mb-6">
            <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="assignment-table-container"></div>
          </div>
        </div>
      </div>
    `;

    // Setup table with AdvanceTableRender
    // Note: AdvanceTableRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.table = new AdvanceTableRender(this.application.templateEngine, {
      modelPath: "eval/assignment",
      data: [],
      targetSelector: "#assignment-table-container",
      customColumns: [
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="assignmentManager.editAssignment({ID})" class="text-blue-600 hover:underline mr-4">
                Edit
              </button>
              <button onclick="assignmentManager.deleteAssignment({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally for template onclick handlers
    window.assignmentManager = this;

    try {
      await this.table.loadSchema();
      await this.table.render();
      await this.loadAssignments();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load assignments: ' + error.message);
    }
  }

  async loadAssignments() {
    try {
      const response = await this.apiService.getAllAssignments();
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const assignments = response.result.map(a => ({
          ...a,
          ID: a.ID || a.id || a.Id
        }));
        
        this.table.setData(assignments);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      this.showError('Error loading assignments: ' + error.message);
    }
  }

  async editAssignment(id) {
    // TODO: Implement edit functionality
    console.log('Edit assignment:', id);
    this.showInfo(`Edit functionality for assignment ${id} coming soon!`);
  }

  async deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const result = await this.apiService.deleteAssignment(id);
      
      if (result && result.isSuccess) {
        this.showSuccess('Assignment deleted successfully!');
        await this.loadAssignments();
      } else {
        throw new Error(result?.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      this.showError('Failed to delete assignment: ' + error.message);
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
window.AssignmentManage = AssignmentManage;
