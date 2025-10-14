class CommonFacultyEditFeature {
  constructor(templateEngine, rootURL, facultyId) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.formRenderer = null;
    this.facultyId = facultyId;
  }

  async fetchFacultyData(id) {
    try {
      const response = await fetch(`${this.rootURL}/common/faculties/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error("❌ Error fetching faculty:", error);
      throw error;
    }
  }

  populateFormFields(data) {
    if (!data) return;

    console.log("🔧 Populating form fields with data:", data);

    const container = document.getElementById("facultyEditFormContainer");
    if (!container) {
      console.error("❌ Form container not found");
      return;
    }

    Object.keys(data).forEach(fieldName => {
      const value = data[fieldName];

      if (value === null || value === undefined) return;

      const field = container.querySelector(`[name="${fieldName}"]`);

      if (field) {
        if (field.tagName === "SELECT") {
          field.value = value;
        } else if (field.type === "checkbox") {
          field.checked = !!value;
        } else if (field.type === "radio") {
          const radio = container.querySelector(`[name="${fieldName}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else {
          field.value = value;
        }

        console.log(`✓ Set ${fieldName} = ${value}`);

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

    header.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a id="commonBackToList" href="#common/faculty/list" class="btn-home">← Back to Faculty List</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Edit Faculty #${this.facultyId}</h2>
      </header>
      <div id="formMessages"></div>
    `;
    wrapper.appendChild(header);

    const formContainer = document.createElement("div");
    formContainer.id = "facultyEditFormContainer";
    wrapper.appendChild(formContainer);

    container.appendChild(wrapper);

    const backBtn = document.getElementById("commonBackToList");
    if (backBtn) {
      backBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        location.hash = "#common/faculty/list";
      });
    }

    try {
      this.showMessage("Loading faculty data...", "info");
      const facultyData = await this.fetchFacultyData(this.facultyId);
      console.log("✅ Faculty data fetched:", facultyData);

      const initialData = { ...facultyData };

      this.showMessage("Faculty data loaded", "success");

      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "common/faculty",
        targetSelector: "#facultyEditFormContainer",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
        initialData: initialData,
      });

      await this.formRenderer.render();

      this.populateFormFields(initialData);

      console.log(`✅ Faculty edit form rendered successfully`);
      return true;
    } catch (error) {
      console.error("❌ Error rendering faculty edit form:", error);
      this.showMessage(`Failed to load faculty: ${error.message}`, "error");
      return false;
    }
  }

  async handleSubmit(formData) {
    this.showMessage("Updating faculty...", "info");

    const payload = this.transformData(formData);

    try {
      const response = await fetch(`${this.rootURL}/common/faculties/${this.facultyId}`, {
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

      this.showMessage("Faculty updated successfully!", "success");
      this.showResult(data, "success");

      setTimeout(() => {
        location.hash = "#common/faculty/list";
      }, 1500);
    } catch (error) {
      const message = error?.message || "Update failed.";
      this.showMessage(message, "error");
      this.showResult({ error: message }, "error");
    }
  }

  transformData(formData) {
    return {
      name: formData.name,
      budget: formData.budget ? parseFloat(formData.budget) : null,
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
  window.CommonFacultyEditFeature = CommonFacultyEditFeature;
}

console.log("📦 CommonFacultyEditFeature loaded");
