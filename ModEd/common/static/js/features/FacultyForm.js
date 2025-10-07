class CommonFacultyFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
    this.formRenderer = null;
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

    // ====== USE Style.css ======
    header.innerHTML = `
      <div style="margin-bottom: 24px;">
        <a id="commonBackToMain" href="#common" class="btn-home">← Back to Common Menu</a>
      </div>
      <header style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 600; color: #2d2d2d;">Add Faculty</h2>
      </header>
      <div id="formMessages"></div>
    `;
    wrapper.appendChild(header);

    const formContainer = document.createElement("div");
    formContainer.id = "facultyFormContainer";
    wrapper.appendChild(formContainer);

    container.appendChild(wrapper);

    const backBtn = document.getElementById("commonBackToMain");
    if (backBtn) {
      backBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        location.hash = "#common";
      });
    }

    // ====== FORM RENDER ======
    try {
      this.formRenderer = new FormRenderV2(this.templateEngine, {
        modelPath: "common/faculty",
        targetSelector: "#facultyFormContainer",
        submitHandler: this.handleSubmit.bind(this),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.formRenderer.render();

      console.log("✅ Faculty form rendered using FormRenderV2");
      return true;
    } catch (error) {
      console.error("❌ Error rendering faculty form:", error);
      this.showMessage(`Failed to load form: ${error.message}`, "error");
      return false;
    }
  }

  async handleSubmit(formData, _event, formInstance) {
    this.showMessage("Saving faculty...", "info");

    // Transform data to match API expectations
    const payload = this.transformData(formData);

    try {
      const response = await fetch(`${this.rootURL}/common/faculties`, {
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
      this.showMessage("Faculty created successfully!", "success");
      this.showResult(data, "success");

      // Reset form after delay
      setTimeout(() => {
        if (formInstance) {
          formInstance.reset();
        }
        this.showMessage("Ready to add another faculty", "info");
      }, 2000);
    } catch (error) {
      const message = error?.message || "Save failed.";
      this.showMessage(message, "error");
      this.showResult({ error: message }, "error");
    }
  }

  transformData(formData) {
    return {
      faculty_name: formData.faculty_name,
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
  window.CommonFacultyFormFeature = CommonFacultyFormFeature;
}

console.log("📦 CommonFacultyFormFeature loaded (using FormRenderV2)");
