// SubmissionCreate - For students to submit assignments
class SubmissionCreate {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.assignments = [];
    this.courses = [];
    this.selectedCourseId = null;
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Expose globally for form handlers
    window.submissionCreate = this;

    // Clear container
    container.innerHTML = '';

    // Load courses first
    await this.loadCourses();
    
    // Load assignments for dropdown
    await this.loadAssignments();

    // Render page
    await this.renderPage();
    
    // Check for assignmentId in URL hash parameters (hash-based routing)
    const hash = window.location.hash;
    const hashMatch = hash.match(/[?&]assignmentId=([^&]+)/);
    const assignmentId = hashMatch ? hashMatch[1] : null;
    
    if (assignmentId) {
      // Wait a bit for the dropdown to be rendered, then select the assignment
      setTimeout(() => {
        const assignment = this.assignments.find(a => (a.ID || a.id || a.Id) == assignmentId);
        if (assignment) {
          // First, filter by course if the assignment has a courseId
          if (assignment.courseId || assignment.CourseId) {
            const courseSelect = document.getElementById('course-select');
            if (courseSelect) {
              courseSelect.value = assignment.courseId || assignment.CourseId;
              this.onCourseChange(courseSelect.value);
              // Wait for dropdown to update, then select assignment
              setTimeout(() => {
                const assignmentSelect = document.getElementById('assignment-select');
                if (assignmentSelect) {
                  assignmentSelect.value = assignmentId;
                }
              }, 50);
            }
          } else {
            // No course filter, just select the assignment
            const assignmentSelect = document.getElementById('assignment-select');
            if (assignmentSelect) {
              assignmentSelect.value = assignmentId;
            }
          }
        }
      }, 100);
    }
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

  onCourseChange(courseId) {
    this.selectedCourseId = courseId;
    this.updateAssignmentDropdown();
  }

  updateAssignmentDropdown() {
    const assignmentSelect = document.getElementById('assignment-select');
    if (!assignmentSelect) return;

    // Get current selected value
    const currentValue = assignmentSelect.value;

    // Clear existing options except the first one
    assignmentSelect.innerHTML = '<option value="">-- Select an assignment --</option>';

    // Filter assignments by course if a course is selected
    let filteredAssignments = this.assignments;
    if (this.selectedCourseId) {
      filteredAssignments = this.assignments.filter(a => 
        (a.courseId || a.CourseId) == this.selectedCourseId
      );
    }

    // Add filtered assignments to dropdown
    filteredAssignments.forEach(a => {
      const option = document.createElement('option');
      option.value = a.ID || a.id || a.Id;
      option.textContent = a.title || 'Untitled Assignment';
      assignmentSelect.appendChild(option);
    });

    // Restore previous selection if it's still valid
    if (currentValue) {
      const optionExists = Array.from(assignmentSelect.options).some(opt => opt.value === currentValue);
      if (optionExists) {
        assignmentSelect.value = currentValue;
      }
    }
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    
    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
            <p class="text-lg text-gray-600">Select an assignment and submit your work</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval/student" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <form id="submission-form" onsubmit="event.preventDefault(); submissionCreate.handleSubmit(event);">
              <!-- Course Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select 
                  id="course-select" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onchange="submissionCreate.onCourseChange(this.value)"
                >
                  <option value="">-- All courses --</option>
                  ${this.courses.map(c => 
                    `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
                  ).join('')}
                </select>
              </div>

              <!-- Assignment Selection -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Assignment <span class="text-red-500">*</span>
                </label>
                <select 
                  id="assignment-select" 
                  name="assignmentId" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select an assignment --</option>
                  ${this.assignments.map(a => 
                    `<option value="${a.ID || a.id || a.Id}">${a.title || 'Untitled Assignment'}</option>`
                  ).join('')}
                </select>
              </div>

              <!-- File Upload -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Attach Files <span class="text-red-500">*</span>
                </label>
                <div class="file-field" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;display:flex;align-items:center;gap:10px;min-height:44px">
                  <input 
                    type="file" 
                    id="files-input" 
                    name="files" 
                    multiple 
                    required
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    style="display:none"
                  />
                  <button 
                    type="button" 
                    class="file-button" 
                    style="background:transparent;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;color:#111"
                    onclick="document.getElementById('files-input').click()"
                  >
                    Choose files
                  </button>
                  <div 
                    id="file-names" 
                    class="file-names" 
                    style="flex:1;font-size:0.95rem;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                  >
                    No files selected
                  </div>
                </div>
                <p class="mt-2 text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR</p>
              </div>

              <!-- Comments -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea 
                  id="comments-input"
                  name="content" 
                  rows="4"
                  placeholder="Enter any additional comments or notes about your submission..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end gap-4">
                <button 
                  type="button" 
                  routerLink="eval/student"
                  class="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Setup file input handler
    const fileInput = document.getElementById('files-input');
    const fileNames = document.getElementById('file-names');
    if (fileInput && fileNames) {
      fileInput.addEventListener('change', () => {
        const names = fileInput.files.length 
          ? Array.from(fileInput.files).map(f => f.name).join(', ') 
          : 'No files selected';
        fileNames.textContent = names;
      });
    }
  }

  async handleSubmit(event) {
    try {
      const form = document.getElementById('submission-form');
      const formData = new FormData();

      // Get assignment ID
      const assignmentSelect = document.getElementById('assignment-select');
      const assignmentId = assignmentSelect.value;
      if (!assignmentId) {
        this.showError('Please select an assignment');
        return;
      }

      // Get comments
      const commentsInput = document.getElementById('comments-input');
      const content = commentsInput ? commentsInput.value : '';

      // Get files
      const fileInput = document.getElementById('files-input');
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        this.showError('Please attach at least one file');
        return;
      }

      // Prepare submission data
      const submissionData = {
        assignmentId: Number(assignmentId),
        studentId: 1, // TODO: Get from session/context
        content: content,
        status: "submitted"
      };

      // Add JSON data to form
      formData.append('data', JSON.stringify(submissionData));

      // Add files
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
      }

      // Submit
      const result = await this.apiService.createAssignmentSubmission(formData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Assignment submitted successfully!');
        // Reset form
        form.reset();
        document.getElementById('file-names').textContent = 'No files selected';
      } else {
        throw new Error(result?.result || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to submit assignment: ' + error.message);
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
}

// Expose globally
window.SubmissionCreate = SubmissionCreate;
window.submissionCreate = null;
