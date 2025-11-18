// TeacherTrackAssignmentSubmission - For teachers to track assignment submissions
// Course -> Assignment dropdowns with submission table
class TeacherTrackAssignmentSubmission {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
    this.courses = [];
    this.assignments = [];
    this.selectedCourseId = null;
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

    // Load courses and assignments
    await this.loadCourses();

    // Setup table
    this.table = new EvalTableRenderer(this.application.templateEngine, {
      modelPath: "eval/assignmentsubmission",
      data: [],
      targetSelector: "#submission-table-container",
      customColumns: [
        {
          name: "submittedAt",
          label: "Submitted At",
          template: `<span>{submittedAtFormatted}</span>`
        },
        {
          name: "attachmentPath",
          label: "Attachment",
          template: `<span>{attachmentPathFormatted}</span>`
        },
        {
          name: "files",
          label: "Files",
          template: `<button onclick="trackAssignmentManager.viewFiles({ID})" class="text-blue-600 hover:underline">View Files</button>`
        },
        {
          name: "actions",
          label: "Actions",
          template: `
            <div style="white-space:nowrap;">
              <button onclick="trackAssignmentManager.deleteSubmission({ID})" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          `
        }
      ]
    });

    // Expose globally
    window.trackAssignmentManager = this;

    try {
      await this.table.loadSchema();
      await this.renderPage();
      // Don't load submissions until assignment is selected
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load submissions: ' + error.message);
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

  async onCourseChange(courseId) {
    this.selectedCourseId = courseId;
    this.selectedAssignmentId = null;
    
    // Reset assignment dropdown
    const assignmentSelect = document.getElementById('assignment-filter');
    if (assignmentSelect) {
      assignmentSelect.innerHTML = '<option value="">-- Select an assignment --</option>';
    }

    // Clear table
    this.table.setData([]);
    const container = document.getElementById('submission-table-container');
    if (container) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Please select a course and assignment to view submissions</p>';
    }

    if (!courseId || courseId === '') {
      return;
    }

    // Load assignments for selected course
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

        // Update assignment dropdown
        const assignmentSelect = document.getElementById('assignment-filter');
        if (assignmentSelect) {
          assignmentSelect.innerHTML = '<option value="">-- Select an assignment --</option>';
          this.assignments.forEach(a => {
            const option = document.createElement('option');
            option.value = a.ID || a.id || a.Id;
            option.textContent = a.title || 'Untitled Assignment';
            assignmentSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      this.showError('Failed to load assignments');
    }
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

    // Show loading message
    const container = document.getElementById('submission-table-container');
    if (container) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Loading submissions...</p>';
    }

    await this.loadSubmissions(assignmentId);
  }

  async loadSubmissions(assignmentId) {
    try {
      console.log('Loading submissions for assignment ID:', assignmentId);
      const response = await this.apiService.getSubmissionsByAssignment(assignmentId);
      console.log('Submissions response:', response);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const submissions = response.result.map(s => {
          // Extract original filename from attachmentPath
          // Format: {submissionID}_{timestamp}_{originalFilename}
          let attachmentPathFormatted = s.attachmentPath || s.AttachmentPath || '';
          if (attachmentPathFormatted) {
            // Handle comma-separated file paths (multiple files)
            const filePaths = attachmentPathFormatted.split(',').map(path => {
              const trimmed = path.trim();
              if (!trimmed) return '';
              // Split by underscore, take the last part (original filename)
              const parts = trimmed.split('_');
              if (parts.length >= 3) {
                // Rejoin everything after the second underscore (in case filename contains underscores)
                return parts.slice(2).join('_');
              }
              return trimmed; // Fallback if format is unexpected
            }).filter(p => p); // Remove empty strings
            
            attachmentPathFormatted = filePaths.join(', ');
          }
          
          return {
            ...s,
            ID: s.ID || s.id || s.Id,
            submittedAtFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(s.submittedAt || s.SubmittedAt) : (s.submittedAt || s.SubmittedAt || ''),
            createdAtFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(s.createdAt || s.CreatedAt) : (s.createdAt || s.CreatedAt || ''),
            attachmentPathFormatted: attachmentPathFormatted
          };
        });
        
        console.log('Processed submissions:', submissions);
        
        if (submissions.length === 0) {
          const container = document.getElementById('submission-table-container');
          if (container) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No submissions found for this assignment</p>';
          }
        } else {
          // Clear container first
          const container = document.getElementById('submission-table-container');
          if (container) {
            container.innerHTML = ''; // Clear loading message
          }
          // Set data and re-render table
          this.table.setData(submissions);
          await this.table.render();
        }
      } else {
        console.error('Invalid response:', response);
        throw new Error(response?.result || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      this.showError('Error loading submissions: ' + error.message);
      const container = document.getElementById('submission-table-container');
      if (container) {
        container.innerHTML = `<p class="text-red-500 text-center py-8">Error: ${error.message}</p>`;
      }
    }
  }

  async renderPage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Render page structure
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Track Assignment Submissions</h1>
            <p class="text-lg text-gray-600">View and manage student assignment submissions</p>
          </div>
          
          <div class="mb-6">
            <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </a>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select 
                id="course-filter" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                onchange="trackAssignmentManager.onCourseChange(this.value)"
              >
                <option value="">-- Select a course --</option>
                ${this.courses.map(c => 
                  `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
                ).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Assignment
              </label>
              <select 
                id="assignment-filter" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                onchange="trackAssignmentManager.onAssignmentChange(this.value)"
                disabled
              >
                <option value="">-- Select a course first --</option>
              </select>
            </div>
          </div>

          <!-- Table Container -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div id="submission-table-container">
              <p class="text-gray-500 text-center py-8">Please select a course and assignment to view submissions</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Enable assignment dropdown when course is selected
    const courseSelect = document.getElementById('course-filter');
    const assignmentSelect = document.getElementById('assignment-filter');
    if (courseSelect && assignmentSelect) {
      courseSelect.addEventListener('change', () => {
        if (courseSelect.value) {
          assignmentSelect.disabled = false;
        } else {
          assignmentSelect.disabled = true;
        }
      });
    }

    await this.table.render();
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
window.TeacherTrackAssignmentSubmission = TeacherTrackAssignmentSubmission;

