// AssignmentManage - Using AdvanceTableRender from core
class AssignmentManage {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.table = null;
    this.editForm = null;
    this.isEditMode = false;
    this.courses = [];
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

    // Setup table with EvalTableRenderer (targetSelector will be set after page renders)
    this.table = new EvalTableRenderer(this.application.templateEngine, {
      modelPath: "eval/assignment",
      data: [],
      targetSelector: "#assignment-table-container",
      customColumns: [
        {
          name: "dueDate",
          label: "Due Date",
          template: `<span>{dueDateFormatted}</span>`
        },
        {
          name: "startDate",
          label: "Start Date",
          template: `<span>{startDateFormatted}</span>`
        },
        {
          name: "active",
          label: "Active",
          template: `<span class="px-2 py-1 rounded text-sm font-medium {activeClass}">{activeText}</span>`
        },
        {
          name: "files",
          label: "Files",
          template: `<button onclick="assignmentManager.viewFiles({ID})" class="text-blue-600 hover:underline">View Files</button>`
        },
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
      await this.loadCourses();
      await this.renderManagePage();
      await this.loadAssignments();
    } catch (error) {
      console.error('Error rendering table:', error);
      this.showError('Failed to load assignments: ' + error.message);
    }
  }

  async renderManagePage() {
    const container = document.getElementById('MainContainer');
    if (!container) return;

    // Load templates for manage page
    const manageTemplateResponse = await fetch(`${RootURL}/eval/static/view/AssignmentManage.tpl`);
    if (!manageTemplateResponse.ok) {
      // Fallback: use core templates or create basic structure
      container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
          <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Manage Assignments</h1>
              <p class="text-lg text-gray-600">View and manage all assignments</p>
            </div>
            <div class="mb-6">
              <a routerLink="eval" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </a>
            </div>
            <!-- Course Filter -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select 
                id="course-filter" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onchange="assignmentManager.onCourseChange(this.value)"
              >
                <option value="">-- All courses --</option>
                ${this.courses.map(c => 
                  `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
                ).join('')}
              </select>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <div id="assignment-table-container"></div>
            </div>
            <div id="edit-form-container" class="hidden mt-6"></div>
          </div>
        </div>
      `;
      this.table.targetSelector = "#assignment-table-container";
      await this.table.render();
    } else {
      const manageTemplateContent = await manageTemplateResponse.text();
      const manageElement = new DOMObject(manageTemplateContent, {}, false);
      container.appendChild(manageElement.html);
      
      // Add course filter dropdown if not in template
      const courseFilterContainer = container.querySelector('#course-filter-container');
      if (!courseFilterContainer) {
        const tableContainer = container.querySelector('#assignment-table-container');
        if (tableContainer && tableContainer.parentElement) {
          const courseFilter = document.createElement('div');
          courseFilter.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
          courseFilter.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>
            <select 
              id="course-filter" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onchange="assignmentManager.onCourseChange(this.value)"
            >
              <option value="">-- All courses --</option>
              ${this.courses.map(c => 
                `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
              ).join('')}
            </select>
          `;
          tableContainer.parentElement.insertBefore(courseFilter, tableContainer);
        }
      }
      
      this.table.targetSelector = "#assignment-table-container";
      await this.table.render();
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
    await this.loadAssignments();
  }

  async loadAssignments() {
    try {
      // Build URL with courseId filter if selected
      let url = `${this.apiService.baseUrl}/assignment/getAll`;
      if (this.selectedCourseId) {
        url += `?courseId=${this.selectedCourseId}`;
      }
      
      const response = await this.apiService.fetchJSON(url);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // Transform data to include Active as computed field and formatted dates
        const assignments = response.result.map(a => {
          const active = a.active !== undefined ? a.active : this.computeActive(a.startDate, a.dueDate);
          const assignment = {
            ...a,
            ID: a.ID || a.id || a.Id,
            active: active,
            activeClass: active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
            activeText: active ? 'Yes' : 'No',
            dueDateFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(a.dueDate || a.DueDate) : (a.dueDate || a.DueDate || ''),
            startDateFormatted: this.apiService.formatDateForDisplay ? this.apiService.formatDateForDisplay(a.startDate || a.StartDate) : (a.startDate || a.StartDate || '')
          };
          return assignment;
        });
        
        this.table.setData(assignments);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      this.showError('Error loading assignments: ' + error.message);
    }
  }

  async addCourseDropdownToEditForm(container) {
    // Create course dropdown for edit form
    const courseField = document.createElement('div');
    courseField.className = 'mb-6';
    courseField.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Course <span class="text-red-500">*</span>
      </label>
      <select 
        id="edit-course-select" 
        name="courseId" 
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Select a course --</option>
        ${this.courses.map(c => 
          `<option value="${c.ID || c.id || c.Id}">${c.Name || 'Untitled Course'}</option>`
        ).join('')}
      </select>
    `;

    // Insert at the beginning of container (before form renders)
    container.insertBefore(courseField, container.firstChild);
  }

  computeActive(startDate, dueDate) {
    if (!startDate || !dueDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(dueDate);
    return now >= start && now <= end;
  }

  async viewFiles(id) {
    try {
      const response = await this.apiService.getAssignmentFiles(id);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        const files = response.result;
        
        if (files.length === 0) {
          this.showInfo('No files attached to this assignment');
          return;
        }

        // Download all files directly
        files.forEach(file => {
          const downloadUrl = `${RootURL}${file.url}`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = file.original || file.filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        
        // Show success message if multiple files
        if (files.length > 1) {
          this.showSuccess(`Downloading ${files.length} files...`);
        }
      } else {
        this.showError('Failed to retrieve files');
      }
    } catch (error) {
      console.error('Error viewing files:', error);
      this.showError('Failed to download files: ' + error.message);
    }
  }

  async editAssignment(id) {
    try {
      // Get assignment data
      const response = await this.apiService.getAssignmentById(id);
      
      if (!response || !response.isSuccess) {
        throw new Error('Failed to load assignment data');
      }

      const assignment = response.result;
      
      // Hide table, show edit form
      this.isEditMode = true;
      const container = document.getElementById('MainContainer');
      const tableContainer = container.querySelector('#assignment-table-container');
      const editContainer = container.querySelector('#edit-form-container');
      
      if (!editContainer) {
        // Create edit container if it doesn't exist
        const newEditContainer = document.createElement('div');
        newEditContainer.id = 'edit-form-container';
        newEditContainer.className = 'mt-6';
        container.appendChild(newEditContainer);
        this.renderEditForm(assignment, newEditContainer);
      } else {
        editContainer.classList.remove('hidden');
        this.renderEditForm(assignment, editContainer);
      }

      if (tableContainer) {
        tableContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading assignment for edit:', error);
      this.showError('Failed to load assignment: ' + error.message);
    }
  }

  async renderEditForm(assignment, container) {
    container.innerHTML = '';

    // Create form using EvalFormRenderer
    this.editForm = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/assignment",
      targetSelector: "#edit-form-container",
      submitHandler: async (formData) => await this.handleUpdate(formData, assignment.ID),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      // Load courses and add course dropdown first
      await this.loadCourses();
      await this.addCourseDropdownToEditForm(container);
      
      await this.editForm.render();
      
      // Pre-fill form with assignment data
      const form = container.querySelector('form');
      if (form) {
        // Set courseId first (before other fields)
        if (assignment.courseId) {
          const courseSelect = form.querySelector('#edit-course-select');
          if (courseSelect) courseSelect.value = assignment.courseId;
        }
        
        // Set form values
        if (assignment.title) {
          const titleInput = form.querySelector('input[name="title"], input[name="Title"]');
          if (titleInput) titleInput.value = assignment.title;
        }
        if (assignment.description) {
          const descInput = form.querySelector('textarea[name="description"], textarea[name="Description"]');
          if (descInput) descInput.value = assignment.description;
        }
        if (assignment.startDate) {
          const startInput = form.querySelector('input[name="startDate"], input[name="StartDate"]');
          if (startInput) {
            const startDate = new Date(assignment.startDate);
            startInput.value = startDate.toISOString().slice(0, 16);
          }
        }
        if (assignment.dueDate) {
          const dueInput = form.querySelector('input[name="dueDate"], input[name="DueDate"]');
          if (dueInput) {
            const dueDate = new Date(assignment.dueDate);
            dueInput.value = dueDate.toISOString().slice(0, 16);
          }
        }
        if (assignment.maxScore !== undefined) {
          const scoreInput = form.querySelector('input[name="maxScore"], input[name="MaxScore"]');
          if (scoreInput) scoreInput.value = assignment.maxScore;
        }

        // Add file input field
        if (!form.querySelector('input[type="file"]')) {
          const fileLabel = document.createElement('label');
          fileLabel.textContent = 'Attachments (optional - add new files)';
          
          const wrapper = document.createElement('div');
          wrapper.className = 'file-field';
          
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.name = 'files';
          fileInput.multiple = true;
          fileInput.accept = '.pdf,.doc,.docx,.txt';
          fileInput.id = 'files-edit';
          fileInput.style.display = 'none';
          
          const fileButton = document.createElement('button');
          fileButton.type = 'button';
          fileButton.className = 'file-button';
          fileButton.textContent = 'Choose files';
          
          const fileList = document.createElement('div');
          fileList.className = 'file-names';
          fileList.textContent = 'No new files selected';
          
          wrapper.appendChild(fileInput);
          wrapper.appendChild(fileButton);
          wrapper.appendChild(fileList);
          fileLabel.appendChild(wrapper);
          
          const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
          if (submitBtn) {
            submitBtn.parentNode.insertBefore(fileLabel, submitBtn);
          } else {
            form.appendChild(fileLabel);
          }
          
          fileButton.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', () => {
            const names = fileInput.files.length ? Array.from(fileInput.files).map(f => f.name).join(', ') : 'No new files selected';
            fileList.textContent = names;
          });
        }

        // Add cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => this.cancelEdit();
        
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          submitBtn.parentNode.insertBefore(cancelBtn, submitBtn);
        }
      }
    } catch (error) {
      console.error('Error rendering edit form:', error);
      this.showError('Failed to load edit form: ' + error.message);
    }
  }

  async handleUpdate(formData, assignmentId) {
    try {
      formData.ID = assignmentId;
      
      // Get courseId from dropdown
      const courseSelect = document.querySelector('#edit-course-select');
      if (courseSelect && courseSelect.value) {
        formData.courseId = Number(courseSelect.value);
      } else {
        this.showError('Please select a course');
        return;
      }
      
      // Convert dates
      if (formData.startDate) {
        formData.startDate = this.apiService.formatToRFC3339(new Date(formData.startDate));
      }
      if (formData.dueDate) {
        formData.dueDate = this.apiService.formatToRFC3339(new Date(formData.dueDate));
      }

      // Ensure numeric fields
      if (formData.maxScore) formData.maxScore = Number(formData.maxScore);

      // Handle file upload if files are present
      const fileInput = document.querySelector('#edit-form-container input[type="file"]');
      if (fileInput && fileInput.files.length > 0) {
        formData.files = Array.from(fileInput.files);
      }

      const result = await this.apiService.updateAssignment(formData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Assignment updated successfully!');
        this.cancelEdit();
        await this.loadAssignments();
      } else {
        throw new Error(result?.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Update error:', error);
      this.showError('Failed to update assignment: ' + error.message);
      throw error;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    const container = document.getElementById('MainContainer');
    const tableContainer = container.querySelector('#assignment-table-container');
    const editContainer = container.querySelector('#edit-form-container');
    
    if (tableContainer) {
      tableContainer.style.display = '';
    }
    if (editContainer) {
      editContainer.classList.add('hidden');
      editContainer.innerHTML = '';
    }
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
