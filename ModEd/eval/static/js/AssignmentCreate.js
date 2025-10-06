// AssignmentCreate - Assignment creation feature
class AssignmentCreate {
  constructor() {
    this.apiService = new EvalApiService();
    this.validator = new EvalValidator();
  }

  async initialize() {
    const container = document.getElementById('assignment-demo');
    if (!container) return;

    container.innerHTML = `
      <div class="demo-section">
        <h2>Assignment Management Demo</h2>
        <form id="assignmentForm">
          <label>Assignment Name:</label>
          <input type="text" name="name" required placeholder="Enter assignment name" />
          <label>Description:</label>
          <input type="text" name="description" placeholder="Enter assignment description" />
          <label>Start Date:</label>
          <input type="datetime-local" name="startDate" />
          <label>Due Date:</label>
          <input type="datetime-local" name="dueDate" />
          <label>Max Score:</label>
          <input type="number" name="maxScore" value="100" min="1" max="1000" />
          <input type="submit" value="Create Assignment" />
        </form>

        <button id="loadAllBtn">Load All Assignments</button>

        <h3>Latest Result:</h3>
        <div id="result"></div>
        <h3>All Assignments:</h3>
        <div id="allAssignments"></div>
      </div>
    `;

    // Attach event listeners
    document.getElementById("assignmentForm")
      .addEventListener("submit", (e) => this.handleSubmit(e));
    document.getElementById("loadAllBtn")
      .addEventListener("click", () => this.loadAllAssignments());

    // Load initial data
    await this.loadAllAssignments();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate data
    const validation = this.validator.validateAssignment(data);
    if (!this.validator.showErrors(validation.errors)) {
      return;
    }

    // Submit data
    const result = await this.apiService.createAssignment(data);
    
    document.getElementById('result').textContent = JSON.stringify(result, null, 2);
    await this.loadAllAssignments();
    document.getElementById('assignmentForm').reset();
  }

  async loadAllAssignments() {
    const data = await this.apiService.getAllAssignments();
    const container = document.getElementById('allAssignments');
    if (!container) return;

    if (data.isSuccess && Array.isArray(data.result)) {
      let text = "";
      data.result.forEach(assignment => {
        const title = assignment.title || assignment.Title;
        const description = assignment.description || assignment.Description;
        const id = assignment.id || assignment.ID;
        const dueDate = assignment.dueDate || assignment.DueDate;
        const maxScore = assignment.maxScore || assignment.MaxScore;
        text += `ID: ${id}, Title: ${title}, Description: ${description}, Due: ${dueDate}, Max Score: ${maxScore}\n`;
      });
      container.textContent = text || "No assignments found.";
    } else {
      container.textContent = "Error loading assignments: " + JSON.stringify(data.result);
    }
  }
}

// Make it globally available
window.AssignmentCreate = AssignmentCreate;
