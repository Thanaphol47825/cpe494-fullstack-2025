class CommonStudentListFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.tableRenderer = null;
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("❌ Template engine or main container not found");
      return false;
    }

    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const wrapper = document.createElement("main");
    wrapper.className = "form-container";
    wrapper.style.maxWidth = "1500px"; 

    const header = document.createElement("div");
    header.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a id="commonBackToMain" href="#common" class="btn-home">← Back to Common Menu</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Student List</h2>
        <div id="tableMessages"></div>
      </header>
    `;
    wrapper.appendChild(header);

    // Create table container div
    const tableContainer = document.createElement("div");
    tableContainer.id = "studentTableContainer";
    wrapper.appendChild(tableContainer);

    container.appendChild(wrapper);

    // Setup back button
    const backBtn = document.getElementById("commonBackToMain");
    if (backBtn) {
      backBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        location.hash = "#common";
      });
    }

    // Initialize TableRenderV2
    try {

      // Make sure templates are loaded
      if (!this.templateEngine.template) {
        await this.templateEngine.fetchTemplate();
      }

      console.log("Template loaded:", !!this.templateEngine.template);
      console.log(
        "Table template exists:",
        !!this.templateEngine.template?.Table
      );

      const url = `${this.rootURL}/common/students/getall`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch students: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const students = data.result || data || [];
      console.log("Students loaded:", students.length, "records");

      // Check if TableRenderV2 is available
      if (typeof TableRenderV2 === 'undefined') {
        throw new Error("TableRenderV2 is not loaded. Please ensure core module is loaded.");
      }

      const table = new TableRenderV2(this.templateEngine, {
          modelPath: "common/student",
          data: students,
          targetSelector: "#studentTableContainer"
      });

      await table.render();

      return true;
    } catch (error) {
      console.error("❌ Error rendering table:", error);
      this.showMessage(`Error: ${error.message}`, "error");
      return false;
    }
  }

  renderSimpleTable(students, schema) {
    const container = document.getElementById("studentTableContainer");
    if (!container) return;

    const displayFields = schema.filter((field) => field.display !== false);

    // Create table HTML
    let html = '<table class="table-blue">';

    // Table header
    html += "<thead><tr>";
    displayFields.forEach((field) => {
      html += `<th>${field.label || field.name}</th>`;
    });
    html += "</tr></thead>";

    // Table body
    html += "<tbody>";
    if (students.length === 0) {
      html += `<tr><td colspan="${displayFields.length}" class="ui-table-empty">No students found</td></tr>`;
    } else {
      students.forEach((student) => {
        html += "<tr>";
        displayFields.forEach((field) => {
          const value = student[field.name] || "-";
          html += `<td>${value}</td>`;
        });
        html += "</tr>";
      });
    }
    html += "</tbody></table>";

    container.innerHTML = html;
    const wrap = document.getElementById('studentTableContainer');
    wrap.style.width = '100%';
    wrap.style.overflowX = 'auto';
    wrap.style.webkitOverflowScrolling = 'touch';

    const tbl = wrap.querySelector('table');
    tbl.style.width = 'max-content';

    tbl.querySelectorAll('th,td').forEach(el => el.style.whiteSpace = 'nowrap');
  }

  showMessage(message, type = "info") {
    const messagesDiv = document.getElementById("tableMessages");
    if (!messagesDiv) return;

    const colorClass =
      type === "error"
        ? "text-red-600"
        : type === "success"
          ? "text-green-600"
          : "text-blue-600";

    messagesDiv.innerHTML = `
      <div class="mb-4 p-3 rounded-lg ${type === "error" ? "bg-red-50" : type === "success" ? "bg-green-50" : "bg-blue-50"}">
        <p class="text-sm font-medium ${colorClass}">${message}</p>
      </div>
    `;
  }
}

if (typeof window !== "undefined") {
  window.CommonStudentListFeature = CommonStudentListFeature;
}

console.log("📦 CommonStudentListFeature loaded (using TableRenderV2)");
