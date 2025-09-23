// 📍 File: /common/static/js/features/InstructorForm.js
// Feature module for creating instructors in the Common module

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
      <div class="max-w-2xl mx-auto space-y-6">
        <button id="commonBackToMain" class="text-blue-700 hover:text-blue-900">← Back to Common Menu</button>
        <div>
          <h2 class="text-2xl font-bold">Add Instructor</h2>
          <p class="text-sm text-gray-600">Create a new instructor record without reloading the page.</p>
        </div>
        <form id="commonInstructorForm" class="space-y-4">
          <fieldset class="space-y-3">
            <legend class="font-semibold text-gray-700">Required Information</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-sm">Instructor Code *
                <input name="instructor_code" type="text" required class="mt-1 w-full rounded-md border px-3 py-2" placeholder="INS001" />
              </label>
              <label class="block text-sm">Email *
                <input name="email" type="email" required class="mt-1 w-full rounded-md border px-3 py-2" placeholder="name@example.com" />
              </label>
              <label class="block text-sm">First Name *
                <input name="first_name" type="text" required class="mt-1 w-full rounded-md border px-3 py-2" placeholder="First name" />
              </label>
              <label class="block text-sm">Last Name *
                <input name="last_name" type="text" required class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Last name" />
              </label>
            </div>
          </fieldset>

          <fieldset class="space-y-3">
            <legend class="font-semibold text-gray-700">Optional Information</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-sm">Department
                <input name="department" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Department" />
              </label>
              <label class="block text-sm">Start Date
                <input name="start_date" type="date" class="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
            </div>
          </fieldset>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800">Create Instructor</button>
            <button type="reset" class="rounded-md border px-4 py-2 hover:bg-gray-50">Reset</button>
            <span id="commonInstructorStatus" class="text-sm"></span>
          </div>
        </form>
        <div id="commonInstructorResult" class="hidden rounded-md border bg-white p-4 text-sm"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById("commonBackToMain");
    if (backBtn) backBtn.addEventListener("click", () => this.templateEngine.render());

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
