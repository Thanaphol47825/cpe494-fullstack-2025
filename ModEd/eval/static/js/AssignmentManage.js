// AssignmentManage - Simple Assignment Management Module
class AssignmentManage {
  constructor() {
    this.apiService = new EvalApiService();
    this.assignments = [];
  }

  async initialize() {
    const container = document.getElementById('assignment-demo') || document.getElementById('MainContainer') || document.body;
    
    try {
      // Load template
      const response = await fetch('/eval/static/view/AssignmentManage.tpl');
      const template = await response.text();
      container.innerHTML = template;
      
      // Load assignments
      await this.loadAssignments();
      
      console.log('AssignmentManage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AssignmentManage:', error);
      container.innerHTML = '<div class="error">Failed to load assignment management</div>';
    }
  }

  async loadAssignments() {
    try {
      const response = await this.apiService.getAllAssignments();
      if (response.isSuccess && Array.isArray(response.result)) {
        this.assignments = response.result;
      } else {
        this.assignments = [];
        console.error('Invalid response format:', response);
      }
      this.renderAssignmentsList();
    } catch (error) {
      console.error('Failed to load assignments:', error);
      this.assignments = [];
      const listDiv = document.getElementById('assignmentsList');
      if (listDiv) {
        listDiv.innerHTML = `<div class="error">Error loading assignments: ${error.message}</div>`;
      }
    }
  }

  renderAssignmentsList() {
    const listDiv = document.getElementById('assignmentsList');
    if (!listDiv) return;

    if (!this.assignments || this.assignments.length === 0) {
      listDiv.innerHTML = '<div class="text-center py-8 text-gray-500">No assignments found</div>';
      return;
    }

    const assignmentsHTML = this.assignments.map(assignment => `
      <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${assignment.title || 'Untitled Assignment'}</h3>
            <p class="text-sm text-gray-600 mb-2">${assignment.description || 'No description'}</p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              ${assignment.startDate ? `<span><strong>Start:</strong> ${new Date(assignment.startDate).toLocaleDateString()}</span>` : ''}
              ${assignment.dueDate ? `<span><strong>Due:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</span>` : ''}
              ${assignment.maxScore ? `<span><strong>Max Score:</strong> ${assignment.maxScore}</span>` : ''}
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button 
              onclick="assignmentManage.editAssignment(${assignment.id})" 
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
            >
              Edit
            </button>
            <button 
              onclick="assignmentManage.deleteAssignment(${assignment.id})" 
              class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');

    listDiv.innerHTML = assignmentsHTML;
  }

  async editAssignment(assignmentId) {
    // Find the assignment
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      alert('Assignment not found');
      return;
    }

    // For now, just show an alert with assignment details
    // In a full implementation, you would open an edit form
    alert(`Edit Assignment: ${assignment.title}\n\nThis would open an edit form in a full implementation.`);
  }

  async deleteAssignment(assignmentId) {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      await this.apiService.deleteAssignment(assignmentId);
      
      // Remove from local array
      this.assignments = this.assignments.filter(a => a.id !== assignmentId);
      
      // Refresh the list
      this.renderAssignmentsList();
      
      // Show success message
      this.showMessage('Assignment deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      this.showMessage(`Failed to delete assignment: ${error.message}`, 'error');
    }
  }

  showMessage(message, type = 'info') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }
}

// Make it globally accessible
window.assignmentManage = new AssignmentManage();