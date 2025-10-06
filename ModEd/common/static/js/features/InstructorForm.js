class CommonInstructorFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("❌ Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";

    const html = `
      <main class="form-container">
        <div>
          <a id="commonBackToMain" href="#common" class="btn-home">← Back to Common Menu</a>
        </div>

        <header>
          <h2>Add Instructor</h2>
        </header>

        <form id="commonInstructorForm">
          <div class="form-field">
            <label for="inst_code">Instructor Code *</label>
            <input id="inst_code" name="instructor_code" type="text" required class="form-input" placeholder="INST001" />
          </div>

          <div class="form-field">
            <label for="inst_email">Email *</label>
            <input id="inst_email" name="email" type="email" required class="form-input" placeholder="name@example.com" />
          </div>

          <div class="form-field">
            <label for="first_name">First Name *</label>
            <input id="first_name" name="first_name" type="text" required class="form-input" placeholder="First name" />
          </div>

          <div class="form-field">
            <label for="last_name">Last Name *</label>
            <input id="last_name" name="last_name" type="text" required class="form-input" placeholder="Last name" />
          </div>

          <div class="form-field">
            <label for="dept">Department</label>
            <input id="dept" name="department" type="text" class="form-input" placeholder="Department" />
            <!-- If you use a dropdown, swap to: <select class="form-select"> -->
          </div>

          <div class="form-field" style="display:flex; gap:12px; align-items:center;">
            <button type="submit" class="form-submit-btn">Create Instructor</button>
            <button type="reset" class="form-reset-btn">Reset</button>
            <span id="commonInstructorStatus" class="status-text"></span>
          </div>
        </form>

        <div id="commonInstructorResult" class="hidden result-box"></div>
      </main>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById("commonBackToMain");
    if (backBtn) backBtn.addEventListener("click", async () => {
      location.hash = "#common";
      console.log("Navigating back to Common Menu");

      if (window.CommonAppInstance) {
        await window.CommonAppInstance.renderMenu();
      } else if (this.templateEngine?.mainContainer) {
        this.templateEngine.mainContainer.innerHTML = "";
        const msg = document.createElement("div");
        msg.textContent = "Common Menu not found. Please reload.";
        msg.className = "text-center text-red-600 mt-6";
        this.templateEngine.mainContainer.appendChild(msg);
      }
    });

    const form = document.getElementById("commonInstructorForm");
    if (!form) return true;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });

    form.addEventListener("reset", () => this.#handleReset());

    const firstInput = form.querySelector('input[name="instructor_code"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);

    return true;
  }

  #collect(form) {
    const fd = new FormData(form);
    const payload = {};
    for (const [key, value] of fd.entries()) {
      const trimmed = String(value ?? "").trim();
      if (trimmed !== "") payload[key] = trimmed;
    }
    return payload;
  }

  #validate(payload) {
    const required = ["instructor_code", "email", "first_name", "last_name"];
    const missing = required.filter((key) => !payload[key]);
    return { ok: missing.length === 0, missing };
  }

  #transform(payload) {
    const toRFC3339 = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
    return {
      instructor_code: payload.instructor_code,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      department: payload.department || null,
      start_date: toRFC3339(payload.start_date),
    };
  }

  async #handleSubmit() {
    const form = document.getElementById("commonInstructorForm");
    const statusEl = document.getElementById("commonInstructorStatus");
    const resultEl = document.getElementById("commonInstructorResult");

    const setStatus = (msg, tone = "info") => {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.className = `text-sm ${tone === "error" ? "text-red-600" : tone === "success" ? "text-green-600" : "text-gray-600"}`;
    };

    const showResult = (html, tone = "info") => {
      if (!resultEl) return;
      resultEl.className = `rounded-md border p-4 text-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`;
      resultEl.innerHTML = html;
      resultEl.classList.remove("hidden");
    };

    setStatus("Saving…");
    if (resultEl) resultEl.classList.add("hidden");

    const raw = this.#collect(form);
    const { ok, missing } = this.#validate(raw);
    if (!ok) {
      setStatus(`Please fill required fields: ${missing.join(", ")}`, "error");
      return;
    }

    const payload = this.#transform(raw);

    try {
      const res = await fetch(`${this.rootURL}/common/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error?.message || data?.message || `Request failed (${res.status})`;
        throw new Error(message);
      }

      setStatus("Saved successfully.", "success");
      showResult(`<div><strong>Instructor Code:</strong> ${data?.instructor_code || payload.instructor_code}</div><pre class="mt-2 whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`, "success");
      setTimeout(() => {
        if (form) form.reset();
        setStatus("Ready.");
      }, 1200);
    } catch (err) {
      const message = err?.message || "Save failed.";
      setStatus(message, "error");
      showResult(`<div><strong>Error:</strong> ${message}</div>`, "error");
    }
  }

  #handleReset() {
    const statusEl = document.getElementById("commonInstructorStatus");
    const resultEl = document.getElementById("commonInstructorResult");
    if (statusEl) {
      statusEl.textContent = "Form reset";
      statusEl.className = "text-sm text-gray-500";
    }
    if (resultEl) {
      resultEl.classList.add("hidden");
    }
    setTimeout(() => {
      const first = document.querySelector('#commonInstructorForm input[name="instructor_code"]');
      if (first) first.focus();
    }, 100);
  }
}

if (typeof window !== "undefined") {
  window.CommonInstructorFormFeature = CommonInstructorFormFeature;
}

console.log("📦 CommonInstructorFormFeature loaded");
