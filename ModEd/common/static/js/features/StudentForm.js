class CommonStudentFormFeature {
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
      <div class="max-w-3xl mx-auto space-y-6">
        <button id="commonBackToMain" class="text-blue-700 hover:text-blue-900">← Back to Common Menu</button>
        <div>
          <h2 class="text-2xl font-bold">Add Student</h2>
        </div>
        <form id="commonStudentForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-sm">Student Code *
                <input name="student_code" type="text" required class="mt-1 w-full rounded-md border px-3 py-2" placeholder="STU001" />
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
          
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-sm">Department
                <input name="department" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Department" />
              </label>
              <label class="block text-sm">Program
                <input name="program" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Program" />
              </label>
              <label class="block text-sm">Gender
                <input name="Gender" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Gender" />
              </label>
              <label class="block text-sm">Citizen ID
                <input name="CitizenID" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Citizen ID" />
              </label>
              <label class="block text-sm">Phone Number
                <input name="PhoneNumber" type="tel" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Phone Number" />
              </label>
              <label class="block text-sm">Advisor Code
                <input name="AdvisorCode" type="text" class="mt-1 w-full rounded-md border px-3 py-2" placeholder="Advisor Code" />
              </label>
              <label class="block text-sm">Start Date
                <input name="start_date" type="date" class="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
              <label class="block text-sm">Birth Date
                <input name="birth_date" type="date" class="mt-1 w-full rounded-md border px-3 py-2" />
              </label>
            </div>
        

          <div class="md:col-span-2 flex items-center gap-3 pt-2">
            <button type="submit" class="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800">Create Student</button>
            <button type="reset" class="rounded-md border px-4 py-2 hover:bg-gray-50">Reset</button>
            <span id="commonStudentStatus" class="text-sm"></span>
          </div>
        </form>
        <div id="commonStudentResult" class="hidden rounded-md border bg-white p-4 text-sm"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    this.templateEngine.mainContainer.appendChild(element);

    const backBtn = document.getElementById("commonBackToMain");
    if (backBtn) backBtn.addEventListener("click", () => this.templateEngine.render());

    const form = document.getElementById("commonStudentForm");
    if (!form) return true;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleSubmit();
    });

    form.addEventListener("reset", () => this.#handleReset());

    const firstInput = form.querySelector('input[name="student_code"]');
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
    const required = ["student_code", "email", "first_name", "last_name"];
    const missing = required.filter((key) => !payload[key]);
    return { ok: missing.length === 0, missing };
  }

  #transform(payload) {
    const toRFC3339 = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
    return {
      student_code: payload.student_code,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      department: payload.department || null,
      program: payload.program || null,
      Gender: payload.Gender || null,
      CitizenID: payload.CitizenID || null,
      PhoneNumber: payload.PhoneNumber || null,
      AdvisorCode: payload.AdvisorCode || null,
      start_date: toRFC3339(payload.start_date),
      birth_date: toRFC3339(payload.birth_date),
    };
  }

  async #handleSubmit() {
    const form = document.getElementById("commonStudentForm");
    const statusEl = document.getElementById("commonStudentStatus");
    const resultEl = document.getElementById("commonStudentResult");

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
      const res = await fetch(`${this.rootURL}/common/students`, {
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
      showResult(`<div><strong>Student Code:</strong> ${data?.student_code || payload.student_code}</div><pre class="mt-2 whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`, "success");
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
    const statusEl = document.getElementById("commonStudentStatus");
    const resultEl = document.getElementById("commonStudentResult");
    if (statusEl) {
      statusEl.textContent = "Form reset";
      statusEl.className = "text-sm text-gray-500";
    }
    if (resultEl) {
      resultEl.classList.add("hidden");
    }
    setTimeout(() => {
      const first = document.querySelector('#commonStudentForm input[name="student_code"]');
      if (first) first.focus();
    }, 100);
  }
}

if (typeof window !== "undefined") {
  window.CommonStudentFormFeature = CommonStudentFormFeature;
}

console.log("📦 CommonStudentFormFeature loaded");
