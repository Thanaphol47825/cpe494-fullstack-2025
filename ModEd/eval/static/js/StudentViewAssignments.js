// StudentViewAssignments - For students to view assignments and submit them
// Course dropdown, show assignments with Submit button
class StudentViewAssignments {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.courses = [];
    this.assignments = [];
    this.selectedCourseId = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Load courses
    await this.loadCourses();

    // Expose globally
    window.studentAssignmentViewer = this;

    await this.renderPage();
  }

  async loadCourses() {
    try {
      const response = await this.apiService.getAllCourses();
      if (response && response.isSuccess && Array.isArray(response.result)) {
        this.courses = response.result;
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      this.showError('Failed to load courses');
    }
  }

  async onCourseChange(courseId) {
    this.selectedCourseId = courseId;
    
    if (!courseId || courseId === '') {
      this.assignments = [];
      this.renderAssignmentsList();
      return;
    }

    await this.loadAssignmentsForCourse(courseId);
  }

  async loadAssignmentsForCourse(courseId) {
    try {
      const response = await this.apiService.getAllAssignments();
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // Filter assignments by course
        this.assignments = response.result.filter(a => 
          (a.courseId || a.CourseId) == courseId
        );
        this.renderAssignmentsList();
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      this.showError('Failed to load assignments');
    }
  }

  renderAssignmentsList() {
    const container = document.getElementById('assignments-list');
    if (!container) return;

    if (this.assignments.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No assignments found for this course</p>';
      return;
    }

    const now = new Date();
    const assignmentsHTML = this.assignments.map(assignment => {
      const startDate = new Date(assignment.startDate || assignment.StartDate);
      const dueDate = new Date(assignment.dueDate || assignment.DueDate);
      const isActive = now >= startDate && now <= dueDate;
      const isPastDue = now > dueDate;
      const isNotStarted = now < startDate;

      let statusBadge = '';
      if (isPastDue) {
        statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Past Due</span>';
      } else if (isNotStarted) {
        statusBadge = '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Not Started</span>';
      } else {
        statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>';
      }

      return `
        <div class="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 ${isActive ? 'border-blue-500' : isPastDue ? 'border-red-500' : 'border-gray-300'}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">${assignment.title || 'Untitled Assignment'}</h3>
              ${assignment.description ? `<p class="text-gray-600 mb-2">${assignment.description}</p>` : ''}
            </div>
            ${statusBadge}
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span class="text-gray-500">Start Date:</span>
              <span class="ml-2 text-gray-900">${startDate.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-gray-500">Due Date:</span>
              <span class="ml-2 text-gray-900">${dueDate.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-gray-500">Max Score:</span>
              <span class="ml-2 text-gray-900">${assignment.maxScore || assignment.MaxScore || 100}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button 
              onclick="studentAssignmentViewer.submitAssignment(${assignment.ID || assignment.id || assignment.Id})"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Submit Assignment
            </button>
            <button 
              onclick="studentAssignmentViewer.viewAssignmentFiles(${assignment.ID || assignment.id || assignment.Id})"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              View Files
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = assignmentsHTML;
  }

  submitAssignment(assignmentId) {
    // Navigate to submission create page with assignment ID in hash
    window.location.hash = `#/eval/submission/create?assignmentId=${assignmentId}`;
  }

  async viewAssignmentFiles(assignmentId) {
    try {
      const response = await this.apiService.getAssignmentFiles(assignmentId);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const files = response.result;
        
        if (files.length === 0) {
          this.showInfo('No files attached to this assignment');
          return;
        }

        // Create modal to show files
        let filesHTML = '<div class="bg-white rounded-lg shadow-lg p-6 max-w-md">';
        filesHTML += '<h3 class="text-lg font-semibold mb-4">Assignment Files</h3>';
        filesHTML += '<ul class="space-y-2">';
        
        files.forEach(file => {
          filesHTML += `<li class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <span class="text-sm text-gray-700">${file.original}</span>
            <a href="${RootURL}${file.url}" target="_blank" class="text-blue-600 hover:underline text-sm">Download</a>
          </li>`;
        });
        
        filesHTML += '</ul>';
        filesHTML += '<button onclick="this.closest(\'.bg-white\').closest(\'.fixed\').remove()" class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>';
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
        this.showError('No files found for this assignment');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      this.showError('Failed to load files: ' + error.message);
    }
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div class="max-w-5xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">View Assignments</h1>
            <p class="text-lg text-gray-600">Select a course to view available assignments</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval/student" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Course Filter -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select 
              id="course-select" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onchange="studentAssignmentViewer.onCourseChange(this.value)"
            >
              <option value="">-- Select a course --</option>
              ${this.courses.map(c => 
                `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
              ).join('')}
            </select>
          </div>

          <!-- Assignments List -->
          <div id="assignments-list" class="space-y-4">
            <p class="text-gray-500 text-center py-8">Please select a course to view assignments</p>
          </div>
        </div>
      </div>
    `;
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
window.StudentViewAssignments = StudentViewAssignments;

