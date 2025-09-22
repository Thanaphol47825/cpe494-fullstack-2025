class EvalApplication {
  constructor(application) {
    this.application = application;
    this.apiBase = "http://100.76.219.70:8080/eval/assignment";
  }

  formatToRFC3339(dtLocal) {
    if (!dtLocal) return null;
    return dtLocal + ":00Z";
  }

  async fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      return await res.json();
    } catch (err) {
      return { isSuccess: false, result: err.message };
    }
  }

  async loadAllAssignments() {
    const data = await this.fetchJSON(`${this.apiBase}/getAll`);
    const container = document.getElementById("allAssignments");
    if (data.isSuccess && Array.isArray(data.result)) {
      let text = "";
      data.result.forEach(a => {
        const title = a.title || a.Title;
        const description = a.description || a.Description;
        const id = a.id || a.ID;
        text += `ID: ${id}, Title: ${title}, Description: ${description}\n`;
      });
      container.textContent = text || "No assignments found.";
    } else {
      container.textContent = "Error loading assignments: " + JSON.stringify(data.result);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.name.value,
      description: form.description.value,
      dueDate: this.formatToRFC3339(form.dueDate.value),
      startDate: this.formatToRFC3339(form.startDate.value),
      maxScore: Number(form.maxScore.value),
      instructorId: 1,
      courseId: 101,
      isReleased: true,
      isActive: true
    };

    const data = await this.fetchJSON(`${this.apiBase}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
    await this.loadAllAssignments();
    form.reset();
  }

  async render() {
    // ✅ เขียน form ลง container
    this.application.mainContainer.innerHTML = `
      <form id="assignmentForm">
        <label>Name:</label>
        <input type="text" name="name" required />
        <label>Description:</label>
        <input type="text" name="description" />
        <label>Due Date:</label>
        <input type="datetime-local" name="dueDate" />
        <label>Start Date:</label>
        <input type="datetime-local" name="startDate" />
        <label>Max Score:</label>
        <input type="number" name="maxScore" value="100" />
        <input type="submit" value="Create Assignment" />
      </form>

      <button id="loadAllBtn">Load All Assignments</button>

      <h3>Latest Result:</h3>
      <div id="result"></div>
      <h3>All Assignments:</h3>
      <div id="allAssignments"></div>
    `;

    // ✅ Attach event
    document.getElementById("assignmentForm")
      .addEventListener("submit", (e) => this.handleSubmit(e));
    document.getElementById("loadAllBtn")
      .addEventListener("click", () => this.loadAllAssignments());

    // โหลด assignments ตอนเริ่มต้น
    await this.loadAllAssignments();
    return true;
  }
}
