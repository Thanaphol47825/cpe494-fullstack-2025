// AssignmentCreate - Using AdvanceFormRender from core
class AssignmentCreate {
  constructor(application) {
    this.application = application;
    this.apiService = new EvalApiService();
    this.form = null;
    this.courses = [];
  }

  async initialize() {
    const container = document.getElementById('MainContainer') || document.body;
    if (!container) {
      console.error('MainContainer not found');
      return;
    }

    // Clear container and add wrapper
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div class="max-w-4xl mx-auto px-4">
          <style>
            /* replicate small file-field styles so dynamically injected field matches static template */
            .file-field{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;display:flex;align-items:center;gap:10px;min-height:44px}
            .file-field .file-button{background:transparent;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;color:#111}
            .file-field .file-names{flex:1;font-size:0.95rem;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            .file-field input[type=file]{display:none}
          </style>
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Assignment</h1>
            <p class="text-lg text-gray-600">Fill in the form below to create a new assignment</p>
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

          <!-- Form Container -->
          <div id="assignment-form-container"></div>
        </div>
      </div>
    `;

    // Load courses first
    await this.loadCourses();

    // Initialize EvalFormRenderer (filters out system fields like 'model')
    // Note: AdvanceFormRender expects application.template and application.fetchTemplate()
    // We need to pass templateEngine instead
    this.form = new EvalFormRenderer(this.application.templateEngine, {
      modelPath: "eval/assignment",
      targetSelector: "#assignment-form-container",
      submitHandler: async (formData) => await this.handleSubmit(formData),
      autoFocus: true,
      validateOnBlur: true
    });

    try {
      await this.form.render();
      
      // Get form element after rendering
      const containerEl = document.querySelector('#assignment-form-container');
      const formEl = containerEl ? containerEl.querySelector('form') : null;
      
      if (formEl) {
        // Add course dropdown at the top AFTER form is rendered
        await this.addCourseDropdown();
        
        // Ensure a file input is present inside the rendered form so users can attach files
        if (!formEl.querySelector('input[type="file"]')) {
          // create a label block that matches existing label styling
          const fileLabel = document.createElement('label');
          fileLabel.textContent = 'Attachments';

          // create hidden file input + styled button + filename display so it matches other input boxes
          const wrapper = document.createElement('div');
          wrapper.className = 'file-field';

          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.name = 'files';
          fileInput.multiple = true;
          fileInput.accept = '.pdf,.doc,.docx,.txt';
          fileInput.id = 'files-dyn';
          fileInput.style.display = 'none';

          const fileButton = document.createElement('button');
          fileButton.type = 'button';
          fileButton.className = 'file-button';
          fileButton.textContent = 'Choose files';

          const fileList = document.createElement('div');
          fileList.className = 'file-names';
          fileList.textContent = 'No files selected';

          wrapper.appendChild(fileInput);
          wrapper.appendChild(fileButton);
          wrapper.appendChild(fileList);
          fileLabel.appendChild(wrapper);

              // insert directly above the submit control (robust against variations)
              // prefer to insert before the last submit-like element in the form
              const submitSelectors = 'button[type="submit"], input[type="submit"], button.primary, .btn.primary, input[type="button"].primary';
              let submitBtn = formEl.querySelector(submitSelectors);
              if (!submitBtn) {
                // fallback: pick the last button or submit input inside the form
                const candidates = Array.from(formEl.querySelectorAll('button, input[type="submit"]'));
                if (candidates.length > 0) submitBtn = candidates[candidates.length - 1];
              }

              if (submitBtn) {
                submitBtn.parentNode.insertBefore(fileLabel, submitBtn);
              } else {
                // fallback: insert at end of form but before any .actions if present
                const actions = formEl.querySelector('.actions');
                if (actions) actions.appendChild(fileLabel);
                else formEl.appendChild(fileLabel);
              }

          // open file dialog when button clicked and update fileList on change
          fileButton.addEventListener('click', ()=> fileInput.click());
          fileInput.addEventListener('change', ()=>{
            const names = fileInput.files.length ? Array.from(fileInput.files).map(f=>f.name).join(', ') : 'No files selected';
            fileList.textContent = names;
          });
        }
      }
    } catch (error) {
      console.error('Error rendering form:', error);
      this.showError('Failed to load form: ' + error.message);
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

  async addCourseDropdown() {
    // Find the form element
    const form = document.querySelector('#assignment-form-container form');
    if (!form) {
      console.error('Form not found');
      return;
    }

    // Create course dropdown wrapper
    const courseField = document.createElement('div');
    courseField.className = 'mb-6';
    courseField.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Course <span class="text-red-500">*</span>
      </label>
      <select 
        id="course-select" 
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

    // Find the first direct child element of the form (could be a field wrapper div, label, etc.)
    // Look for common form field containers
    let insertBefore = null;
    const possibleFirstElements = form.querySelectorAll(':scope > div, :scope > label, :scope > fieldset');
    
    if (possibleFirstElements.length > 0) {
      insertBefore = possibleFirstElements[0];
    } else {
      // If no direct children found, look for any first element
      insertBefore = form.firstElementChild;
    }

    // Insert the course dropdown at the top
    if (insertBefore) {
      form.insertBefore(courseField, insertBefore);
    } else {
      // If form is empty, just append
      form.appendChild(courseField);
    }
  }

  async handleSubmit(formData) {
    try {
      // Get courseId from dropdown
      const courseSelect = document.getElementById('course-select');
      if (courseSelect && courseSelect.value) {
        formData.courseId = Number(courseSelect.value);
      } else {
        this.showError('Please select a course');
        return;
      }

      // Convert dates to RFC3339 format if needed
      // Pass the raw string value to formatToRFC3339 - it handles datetime-local format
      if (formData.startDate) {
        formData.startDate = this.apiService.formatToRFC3339(formData.startDate);
      }
      if (formData.dueDate) {
        formData.dueDate = this.apiService.formatToRFC3339(formData.dueDate);
      }

      // Ensure numeric fields
      if (formData.maxScore) formData.maxScore = Number(formData.maxScore);

      // Handle file upload if files are present (look inside assignment form container)
      const fileInput = document.querySelector('#assignment-form-container input[type="file"]');
      if (fileInput && fileInput.files.length > 0) {
        formData.files = Array.from(fileInput.files);
      }

      const result = await this.apiService.createAssignment(formData);
      
      if (result && result.isSuccess) {
        this.showSuccess('Assignment created successfully!');
        // Reset the actual form element
        const formWrapper = document.getElementById('assignment-form-container');
        const realForm = formWrapper ? formWrapper.querySelector('form') : null;
        if (realForm) {
          realForm.reset();
          const fileNames = realForm.querySelector('.file-names, #file-list');
          if (fileNames) fileNames.textContent = 'No files selected';
        }
      } else {
        // Show the actual error message from the API
        const errorMsg = result?.result || result?.message || 'Failed to create assignment';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Failed to create assignment: ' + error.message);
      throw error;
    }
  }


  showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-green-100 text-green-800 border border-green-200 transition-opacity duration-300';
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 300);
    }, 3000);
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
window.AssignmentCreate = AssignmentCreate;
