class AdminCreate {
  constructor(engine, rootURL, adminId = null) {
    this.engine = engine;
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || "";
    this.adminId = adminId;
  }

  async render() {
    if (!this.engine?.mainContainer) return false;
    this.engine.mainContainer.innerHTML = "";
    try {
      await this.#createDynamicAdminForm();
      if (this.adminId) await this.#loadExistingData(this.adminId);
      return true;
    } catch (err) {
      console.error(err);
      this.#showError("Failed to initialize Admin form: " + err.message);
      return false;
    }
  }

  async #createDynamicAdminForm() {
    const metaURL = this.rootURL + "/api/modelmeta/admin";
    const res = await fetch(metaURL);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    const meta = await res.json();
    if (!Array.isArray(meta)) throw new Error("Invalid metadata format");

    const numericFieldNames = new Set(meta.filter(f => f.type === "number").map(f => f.name));
    const schema = meta.map(f => ({
      type: f.type || "text",
      name: f.name,
      label: f.label || f.name
    }));

    if (!this.engine.template && typeof this.engine.fetchTemplate === "function")
      await this.engine.fetchTemplate();
    if (!this.engine.template) throw new Error("Template not loaded");

    const application = { template: this.engine.template };

    const pageHTML = `
      <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-cyan-50 py-10 px-6">
        <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 4v16m8-8H4"></path>
              </svg>
              ${this.adminId ? "Edit Admin" : "Create Admin"}
            </h1>
            <button id="btnBack"
              class="text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition">
              ← Back
            </button>
          </div>

          <div class="p-8">
            <div class="admin-form-container"></div>

            <div class="flex justify-end gap-3 mt-6">
              <button id="btnReset"
                class="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                Reset
              </button>
            </div>

            <div class="text-center mt-4">
              <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
            </div>
          </div>

          <div id="resultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Form Submission Result
              </h3>
            </div>
            <div class="p-6">
              <pre id="resultContent" class="text-sm"></pre>
            </div>
          </div>
        </div>
      </div>
    `;

    const pageEl = this.engine.create(pageHTML);
    this.engine.mainContainer.appendChild(pageEl);

    const formRender = new FormRender(application, schema, ".admin-form-container");
    await formRender.render();

    requestAnimationFrame(() => {
      this.#applyTailwindStyles();
      this.#styleSubmitButton();
      this.#enforceRequiredFields();
    });

    const container = this.engine.mainContainer.querySelector(".admin-form-container");

    document.getElementById("btnReset")?.addEventListener("click", () => {
      const f = container?.querySelector("form");
      if (f) f.reset();
      this.#setStatus("", "");
      this.#hideResult();
    });

    document.getElementById("btnBack")?.addEventListener("click", () => this.#goBack());

    container?.addEventListener("submit", (e) => this.#submit(e, numericFieldNames), true);
  }

  async #loadExistingData(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetAdmin/${id}`);
      const data = await res.json();
      if (data.isSuccess && data.result) {
        const formEl = this.engine.mainContainer.querySelector("form");
        Object.keys(data.result).forEach((key) => {
          if (formEl.elements[key]) formEl.elements[key].value = data.result[key];
        });
      }
    } catch (err) {
      console.error("Error loading admin:", err);
    }
  }

  async #submit(e, numericFieldNames) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    const resultBox = document.getElementById("resultBox");
    const resultContent = document.getElementById("resultContent");

    if (!submitBtn.dataset.confirmed) {
      const valid = form.checkValidity();
      if (!valid) {
        this.#setStatus("Please complete all required fields.", "text-red-600");
        resultBox.classList.add("hidden");
        return;
      }
      this.#setStatus("Press submit again to confirm.", "text-yellow-600");
      submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
      submitBtn.classList.add("bg-yellow-500", "hover:bg-yellow-600");
      submitBtn.dataset.confirmed = "true";
      return;
    }

    submitBtn.dataset.confirmed = "";
    submitBtn.classList.remove("bg-yellow-500", "hover:bg-yellow-600");
    submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700");

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    for (const key of Object.keys(data)) {
      if (numericFieldNames.has(key) && data[key] !== "" && !Number.isNaN(Number(data[key]))) {
        data[key] = Number(data[key]);
      }
    }

    if (this.adminId) data.id = Number(this.adminId);

    const url = this.rootURL + (
      this.adminId
        ? "/recruit/UpdateAdmin"
        : "/recruit/CreateAdmin"
    );

    this.#setStatus(this.adminId ? "Updating..." : "Submitting...", "text-gray-600");

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await resp.json().catch(() => ({}));

      if (result?.isSuccess) {
        this.#setStatus(this.adminId ? "✅ Updated successfully!" : "✅ Saved successfully!", "text-green-600");
        resultBox.classList.remove("hidden");
        resultContent.innerHTML = JSON.stringify(result.result, null, 2);
        setTimeout(() => this.#goBack(), 1000);
      } else {
        this.#setStatus("❌ Operation failed.", "text-red-600");
        resultBox.classList.add("hidden");
      }
    } catch (err) {
      console.error("Error submitting:", err);
      this.#setStatus("Error submitting form.", "text-red-600");
      resultBox.classList.add("hidden");
    }
  }

  async #goBack() {
    await this.engine.fetchModule("/recruit/static/js/AdminList.js");
    const list = new AdminList(this.engine, this.rootURL);
    this.engine.mainContainer.innerHTML = "";
    await list.render();
  }

  #applyTailwindStyles() {
    const root = this.engine.mainContainer.querySelector(".admin-form-container");
    if (!root) return;
    root.querySelectorAll("label").forEach(l => {
      l.classList.add("block", "text-sm", "font-medium", "text-gray-700", "mb-1");
    });
    root.querySelectorAll("input, select, textarea").forEach(el => {
      el.classList.add(
        "mt-1", "block", "w-full",
        "rounded-md", "border-gray-300", "shadow-sm",
        "focus:ring-indigo-500", "focus:border-indigo-500", "sm:text-sm", "mb-3"
      );
    });
  }

  #styleSubmitButton() {
    const root = this.engine.mainContainer.querySelector(".admin-form-container");
    if (!root) return;
    const submitBtn = root.querySelector('input[type="submit"], button[type="submit"]');
    if (submitBtn) {
      submitBtn.classList.add(
        "mt-4", "inline-flex", "items-center", "justify-center",
        "rounded-xl", "px-4", "py-2", "bg-indigo-600",
        "text-white", "font-medium", "shadow-md",
        "hover:bg-indigo-700", "hover:shadow-lg", "transition", "duration-200", "ease-in-out"
      );
      submitBtn.value = submitBtn.value || "Submit";
    }
  }

  #enforceRequiredFields() {
    const root = this.engine.mainContainer.querySelector(".admin-form-container");
    if (!root) return;
    root.querySelectorAll("input, select, textarea").forEach(el => {
      const type = (el.getAttribute("type") || "").toLowerCase();
      if (["submit", "button", "reset", "hidden"].includes(type)) return;
      if (el.disabled) return;
      el.required = true;
    });
  }

  #setStatus(text, cls) {
    const el = document.getElementById("formStatus");
    if (!el) return;
    el.textContent = text || "";
    el.className = "text-sm font-medium " + (cls || "text-gray-500");
  }

  #hideResult() {
    const box = document.getElementById("resultBox");
    const content = document.getElementById("resultContent");
    if (content) content.textContent = "";
    if (box) box.classList.add("hidden");
  }

  #showError(msg) {
    const div = document.createElement("div");
    div.className = "max-w-3xl mx-auto my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800";
    div.textContent = msg;
    (this.engine?.mainContainer || document.body).appendChild(div);
  }
}

if (typeof window !== "undefined") window.AdminCreate = AdminCreate;


