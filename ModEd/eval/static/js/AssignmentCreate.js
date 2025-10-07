// AssignmentCreate - Assignment creation feature
class AssignmentCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
    this.templatePath = '/eval/static/view/AssignmentForm.tpl';
  }

  async initialize() {
    const container = document.getElementById('assignment-demo') || document.getElementById('MainContainer') || document.body;
    if (!container) return;

    // Load template
    const tplText = await this.fetchTemplate(this.templatePath);
    const html = Mustache.render(tplText, { title: 'Create new Assignment' });
    // insert content
    container.innerHTML = html;

    // Attach event listeners
    const form = document.getElementById('assignmentForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
      form.addEventListener('reset', () => this.onReset());
    }

    const loadBtn = document.getElementById('loadAllBtn');
    if (loadBtn) loadBtn.addEventListener('click', () => this.loadAllAssignments());

    await this.loadAllAssignments();
  }

  async fetchTemplate(path) {
    const candidates = [];
    try {
      if (typeof RootURL !== 'undefined' && RootURL !== null) {
        candidates.push(String(RootURL).replace(/\/$/, '') + path);
      }
    } catch (e) {
      // ignore
    }
    candidates.push(path);

    let lastErr = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Template fetch failed: ' + res.status + ' for ' + url);
        return await res.text();
      } catch (err) {
        lastErr = err;
        console.warn('Attempt to fetch template failed for', url, err);
        // try next candidate
      }
    }

    console.error('All attempts to load template failed. Tried:', candidates, 'last error:', lastErr);
    return '<div>Error loading template</div>';
  }

  onReset() {
    console.log('Clear button clicked - resetting form');
    const result = document.getElementById('result');
    if (result) result.textContent = '';
    
    // Also clear the assignments list
    const allAssignments = document.getElementById('allAssignments');
    if (allAssignments) allAssignments.textContent = '';
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // convert types
    if (data.startDate) data.startDate = new Date(data.startDate).toISOString();
    if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString();
    data.maxScore = Number(data.maxScore || 100);

  // normalize field names: validator expects `name`, template uses `title`
  if (!data.name && data.title) data.name = data.title;
  // also ensure title exists for display/use downstream
  if (!data.title && data.name) data.title = data.name;

    // Validate data (validator may be optional)
    if (this.validator && typeof this.validator.validateAssignment === 'function') {
      const validation = this.validator.validateAssignment(data);
      if (!this.validator.showErrors(validation.errors)) return;
    }

    const result = await this.apiService.createAssignment(data);
    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.textContent = JSON.stringify(result, null, 2);

    await this.loadAllAssignments();
    if (form) form.reset();
    
    // Show success message
    this.showSuccessMessage('Assignment created successfully!');
  }

  async loadAllAssignments() {
    try {
      const response = await this.apiService.getAllAssignments();
      const container = document.getElementById('allAssignments');
      if (!container) return;

      if (response && response.isSuccess && Array.isArray(response.result)) {
        const list = response.result;
        const items = list.map(a => {
          const title = a.title || a.Title || a.Name || '';
          const description = a.description || a.Description || '';
          const id = a.id || a.ID || a.Id || '';
          const due = a.dueDate || a.DueDate || '';
          const maxScore = a.maxScore || a.MaxScore || '';
          return `ID: ${id}\nTitle: ${title}\nDesc: ${description}\nDue: ${due}\nMax: ${maxScore}\n----`;
        }).join('\n');

        container.textContent = items || 'No assignments found.';
      } else {
        console.error('Invalid response format:', response);
        container.textContent = 'Error loading assignments: Invalid response format';
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
      const container = document.getElementById('allAssignments');
      if (container) {
        container.textContent = `Error loading assignments: ${error.message}`;
      }
    }
  }

  showSuccessMessage(message) {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 bg-green-100 text-green-800 border border-green-200';
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

// Expose globally for TemplateEngine
window.AssignmentCreate = AssignmentCreate;
