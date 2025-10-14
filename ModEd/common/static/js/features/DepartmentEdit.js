class CommonDepartmentEditFeature {
  constructor(templateEngine, rootURL, departmentId) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.formRenderer = null;
    this.departmentId = departmentId;
  }

  async fetchDepartmentData(id) {
    try {
      const response = await fetch(`${this.rootURL}/common/departments/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error("❌ Error fetching department:", error);
      throw error;
    }
  }

  populateFormFields(data) {
    if (!data) return;

    console.log("🔧 Populating form fields with data:", data);

    const container = document.getElementById("departmentEditFormContainer");
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
        <a id="commonBackToList" href="#common/department/list" class="btn-home">← Back to Department List</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Edit Department #${this.departmentId}</h2>
      </header>
      <div id="formMessages"></div>
    `;
    wrapper.appendChild(header);

    const formContainer = document.createElement("div");
    formContainer.id = "departmentEditFormContainer";
    wrapper.appendChild(formContainer);

    container.appendChild(wrapper);

    const backBtn = document.getElementById("commonBackToList");
    if (backBtn) {
      backBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        location.hash = "#common/department/list";
      });
    }

    try {
      this.showMessage("Loading department data...", "info");
      const departmentData = await this.fetchDepartmentData(this.departmentId);
      console.log("✅ Department data fetched:", departmentData);

      const initialData = { ...departmentData };

      this.showMessage("Department data loaded", "success");

      this.formRenderer = new AdvanceFormRender(this.templateEngine, {
        modelPath: "common/department",
        targetSelector: "#departmentEditFormContainer",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
        initialData: initialData,
      });

      await this.formRenderer.render();

      this.populateFormFields(initialData);

      console.log(`✅ Department edit form rendered successfully`);
      return true;
    } catch (error) {
      console.error("❌ Error rendering department edit form:", error);
      this.showMessage(`Failed to load department: ${error.message}`, "error");
      return false;
    }
  }

  async handleSubmit(formData) {
    this.showMessage("Updating department...", "info");

    const payload = this.transformData(formData);

    try {
      const response = await fetch(`${this.rootURL}/common/departments/${this.departmentId}`, {
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

      this.showMessage("Department updated successfully!", "success");
      this.showResult(data, "success");

      setTimeout(() => {
        location.hash = "#common/department/list";
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
      faculty: formData.faculty || null,
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
  window.CommonDepartmentEditFeature = CommonDepartmentEditFeature;
}

console.log("📦 CommonDepartmentEditFeature loaded");
