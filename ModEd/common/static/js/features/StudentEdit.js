class CommonStudentEditFeature {
  constructor(templateEngine, rootURL, studentId) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.formRenderer = null;
    this.studentId = studentId;
  }

  // Fetch student data by ID
  async fetchStudentData(id) {
    try {
      const response = await fetch(`${this.rootURL}/common/students/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error("❌ Error fetching student:", error);
      throw error;
    }
  }

  // Convert RFC3339 date to YYYY-MM-DD format for form input
  formatDateForInput(dateStr) {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  }

  // Manually populate form fields after render
  populateFormFields(data) {
    if (!data) return;

    console.log("🔧 Populating form fields with data:", data);

    // Get all form inputs in the container
    const container = document.getElementById("studentEditFormContainer");
    if (!container) {
      console.error("❌ Form container not found");
      return;
    }

    // Iterate through data and populate matching fields
    Object.keys(data).forEach(fieldName => {
      const value = data[fieldName];

      // Skip null/undefined values
      if (value === null || value === undefined) return;

      // Try to find input/select/textarea with matching name
      const field = container.querySelector(`[name="${fieldName}"]`);

      if (field) {
        if (field.tagName === "SELECT") {
          // Handle select dropdowns
          field.value = value;
        } else if (field.type === "checkbox") {
          // Handle checkboxes
          field.checked = !!value;
        } else if (field.type === "radio") {
          // Handle radio buttons
          const radio = container.querySelector(`[name="${fieldName}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else {
          // Handle text inputs, textareas, dates, etc.
          field.value = value;
        }

        console.log(`✓ Set ${fieldName} = ${value}`);

        // Trigger change event to notify any listeners
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.log(`⚠ Field not found: ${fieldName}`);
      }
    });

    console.log("✅ Form fields populated");
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

    const header = document.createElement("div");

    // ========= USE Style.css ========
    header.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a id="commonBackToList" href="#common/student/list" class="btn-home">← Back to Student List</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Edit Student #${this.studentId}</h2>
      </header>
      <div id="formMessages"></div>
    `;
    wrapper.appendChild(header);

    const formContainer = document.createElement("div");
    formContainer.id = "studentEditFormContainer";
    wrapper.appendChild(formContainer);

    container.appendChild(wrapper);

    const backBtn = document.getElementById("commonBackToList");
    if (backBtn) {
      backBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        location.hash = "#common/student/list";
      });
    }

    // ====== FORM RENDER ======
    try {
      // Fetch existing data
      this.showMessage("Loading student data...", "info");
      const studentData = await this.fetchStudentData(this.studentId);
      console.log("✅ Student data fetched:", studentData);

      // Convert date fields to YYYY-MM-DD format
      const initialData = {
        ...studentData,
        start_date: this.formatDateForInput(studentData.start_date),
        birth_date: this.formatDateForInput(studentData.birth_date),
      };

      this.showMessage("Student data loaded", "success");

      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "common/student",
        targetSelector: "#studentEditFormContainer",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
        initialData: initialData, // Pre-fill form with existing data
      });

      await this.formRenderer.render();

      // Manually populate form fields with fetched data
      this.populateFormFields(initialData);

      console.log(`✅ Student edit form rendered successfully`);
      return true;
    } catch (error) {
      console.error("❌ Error rendering student edit form:", error);
      this.showMessage(`Failed to load student: ${error.message}`, "error");
      return false;
    }
  }

  async handleSubmit(formData, _event, formInstance) {
    this.showMessage("Updating student...", "info");

    const payload = this.transformData(formData);

    try {
      const response = await fetch(`${this.rootURL}/common/students/${this.studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data?.error?.message ||
          data?.message ||
          `Request failed (${response.status})`;
        throw new Error(message);
      }

      // Show success message
      this.showMessage("Student updated successfully!", "success");
      this.showResult(data, "success");

      // Redirect to student list after delay
      setTimeout(() => {
        location.hash = "#common/student/list";
      }, 1500);
    } catch (error) {
      const message = error?.message || "Update failed.";
      this.showMessage(message, "error");
      this.showResult({ error: message }, "error");
    }
  }

  transformData(formData) {
    // Convert date strings to RFC3339 format
    const toRFC3339 = (dateStr) => {
      if (!dateStr) return null;
      return `${dateStr}T00:00:00Z`;
    };

    return {
      student_code: formData.student_code,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      department: formData.department || null,
      program: formData.program || null,
      Gender: formData.Gender || null,
      CitizenID: formData.CitizenID || null,
      PhoneNumber: formData.PhoneNumber || null,
      AdvisorCode: formData.AdvisorCode || null,
      start_date: toRFC3339(formData.start_date),
      birth_date: toRFC3339(formData.birth_date),
      userid: formData.userid || null,
    };
  }

  showMessage(message, type = "info") {
    const messagesDiv = document.getElementById("formMessages");
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

  showResult(data, type = "info") {
    const messagesDiv = document.getElementById("formMessages");
    if (!messagesDiv) return;

    const bgClass =
      type === "error"
        ? "bg-red-50 border-red-200"
        : "bg-green-50 border-green-200";
    const textClass = type === "error" ? "text-red-700" : "text-green-700";

    messagesDiv.innerHTML += `
      <div class="mt-3 p-4 rounded-lg border ${bgClass}">
        <pre class="text-xs ${textClass} whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }
}

if (typeof window !== "undefined") {
  window.CommonStudentEditFeature = CommonStudentEditFeature;
}

console.log("📦 CommonStudentEditFeature loaded");
