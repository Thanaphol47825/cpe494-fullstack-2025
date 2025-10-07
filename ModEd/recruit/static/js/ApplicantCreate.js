class ApplicantCreate {
  constructor(engine, rootURL) {
    this.engine = engine
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || ""
  }

  async render() {
    if (!this.engine?.mainContainer) return false
    this.engine.mainContainer.innerHTML = ""
    try {
      await this.#createDynamicApplicantForm()
      return true
    } catch (err) {
      console.error(err)
      this.#showError("Failed to initialize form: " + err.message)
      return false
    }
  }

  async #createDynamicApplicantForm() {
    const metaURL = this.rootURL + "/api/modelmeta/applicant"
    const res = await fetch(metaURL)
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
    const meta = await res.json()
    if (!Array.isArray(meta)) throw new Error("Invalid metadata format")
    const numericFieldNames = new Set(meta.filter(f => f.type === "number").map(f => f.name))
    const schema = meta.map(f => ({ type: f.type || "text", name: f.name, label: f.label || f.name }))

    if (!this.engine.template && typeof this.engine.fetchTemplate === "function") await this.engine.fetchTemplate()
    if (!this.engine.template) throw new Error("Template not loaded")
    const application = { template: this.engine.template }

    const pageHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 11c.943 0 1.809.386 2.432 1.01A3.432 3.432 0 0115.442 14h.058A4.5 4.5 0 0012 9.5 4.5 4.5 0 007.5 14h.058c.07-1.043.504-2.003 1.265-2.744A3.432 3.432 0 0111 11h1z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Applicant Registration</h1>
          </div>

          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Applicant Information
              </h2>
            </div>

            <div class="p-8">
              <div class="applicant-form-container"></div>
              <div class="flex gap-3 mt-6">
                <button id="btnReset"
                        class="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                  Reset
                </button>
              </div>
              <div class="text-center mt-4">
                <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
              </div>
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
    `
    const pageEl = this.engine.create(pageHTML)
    this.engine.mainContainer.appendChild(pageEl)

    const formRender = new FormRender(application, schema, ".applicant-form-container")
    await formRender.render()
    requestAnimationFrame(() => {
      this.#applyTailwindStyles()
      this.#styleSubmitButton()
      this.#enforceRequiredFields()
    })

    const container = this.engine.mainContainer.querySelector(".applicant-form-container")
    document.getElementById("btnReset")?.addEventListener("click", () => {
      const f = container?.querySelector("form")
      if (f) f.reset()
      this.#setStatus("", "")
      this.#hideResult()
    })
    container?.addEventListener("submit", (e) => this.#submit(e, numericFieldNames), true)
  }

  #applyTailwindStyles() {
    const root = this.engine.mainContainer.querySelector(".applicant-form-container")
    if (!root) return
    root.querySelectorAll("label").forEach(l => {
      l.classList.add("block", "text-sm", "font-medium", "text-gray-700", "mb-1")
    })
    root.querySelectorAll("input, select, textarea").forEach(el => {
      el.classList.add(
        "mt-1", "block", "w-full",
        "rounded-md", "border-gray-300", "shadow-sm",
        "focus:ring-indigo-500", "focus:border-indigo-500", "sm:text-sm", "mb-3"
      )
    })
    root.querySelectorAll("p, .field, .form-row").forEach(w => w.classList.add("mb-3"))
  }

  #styleSubmitButton() {
    const root = this.engine.mainContainer.querySelector(".applicant-form-container")
    if (!root) return
    const submitBtn = root.querySelector('input[type="submit"], button[type="submit"]')
    if (submitBtn) {
      submitBtn.classList.add(
        "mt-4", "inline-flex", "items-center", "justify-center",
        "rounded-xl", "px-4", "py-2", "bg-indigo-600",
        "text-white", "font-medium", "shadow-md",
        "hover:bg-indigo-700", "hover:shadow-lg", "transition", "duration-200", "ease-in-out"
      )
      submitBtn.value = submitBtn.value || "Submit"
    }
  }

  async #submit(e, numericFieldNames) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]')
    const resultBox = document.getElementById("resultBox")
    const resultContent = document.getElementById("resultContent")

    if (!submitBtn.dataset.confirmed) {
      const valid = this.#validateForm(form)
      if (!valid) {
        this.#setStatus("Please complete all required fields.", "text-red-600")
        resultBox.classList.add("hidden") 
        return
      }
      this.#setStatus("Press submit again to confirm.", "text-yellow-600")
      submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700")
      submitBtn.classList.add("bg-yellow-500", "hover:bg-yellow-600")
      submitBtn.dataset.confirmed = "true"
      return
    }

    submitBtn.dataset.confirmed = ""
    submitBtn.classList.remove("bg-yellow-500", "hover:bg-yellow-600")
    submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700")

    const fd = new FormData(form)
    const data = Object.fromEntries(fd.entries())

    for (const key of Object.keys(data)) {
      if (numericFieldNames.has(key) && data[key] !== "" && !Number.isNaN(Number(data[key]))) {
        data[key] = Number(data[key])
      }
    }
    if (data.birth_date) {
      const d = new Date(data.birth_date)
      if (!isNaN(d.getTime())) data.birth_date = d.toISOString()
    }

    this.#setStatus("Submitting...", "text-gray-600")
    const url = this.rootURL + "/recruit/CreateApplicant"

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const result = await resp.json().catch(() => ({}))

      if (result?.isSuccess) {
        const payload = result.result
        let id = null
        if (Array.isArray(payload) && payload.length) id = payload[0]?.ID ?? payload[0]?.id ?? payload[0]?.Id
        else if (payload && typeof payload === "object") id = payload.ID ?? payload.id ?? payload.Id

        this.#setStatus("Applicant created successfully!", "text-green-600")

        resultBox.classList.remove("hidden")
        resultContent.innerHTML = `
          <div class="flex flex-col items-center justify-center py-10">
            <div class="text-5xl sm:text-6xl font-bold text-indigo-700 mb-3">Applicant ID</div>
            <div class="text-6xl sm:text-7xl font-extrabold text-cyan-600">${id ?? "N/A"}</div>
            <p class="mt-6 text-gray-500 text-sm">Please save this ID for your reference.</p>
          </div>
        `
        form.reset()
      } else {
        this.#setStatus("Failed to create applicant.", "text-red-600")
        resultBox.classList.add("hidden")
      }
    } catch (err) {
      this.#setStatus("Error submitting form.", "text-red-600")
      resultBox.classList.add("hidden")
    }
  }

  #setStatus(text, cls) {
    const el = document.getElementById("formStatus")
    if (!el) return
    el.textContent = text || ""
    el.className = "text-sm font-medium " + (cls || "text-gray-500")
  }

  #hideResult() {
    const box = document.getElementById("resultBox")
    const content = document.getElementById("resultContent")
    if (content) content.textContent = ""
    if (box) box.classList.add("hidden")
  }

  #showError(msg) {
    const div = document.createElement("div")
    div.className = "max-w-3xl mx-auto my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
    div.textContent = msg
    ;(this.engine?.mainContainer || document.body).appendChild(div)
  }

  #enforceRequiredFields() {
    const root = this.engine.mainContainer.querySelector(".applicant-form-container")
    if (!root) return
    root.querySelectorAll("input, select, textarea").forEach(el => {
      const type = (el.getAttribute("type") || "").toLowerCase()
      if (["submit","button","reset","hidden"].includes(type)) return
      if (el.disabled) return
      el.required = true

      el.addEventListener("input", () => this.#clearValidityStyles(el))
      el.addEventListener("change", () => this.#clearValidityStyles(el))
    })
  }

  #validateForm(form) {

    form.querySelectorAll("input, select, textarea").forEach(el => this.#clearValidityStyles(el))

    const ok = form.checkValidity()

    if (!ok) {

      const invalids = Array.from(form.querySelectorAll(":invalid"))
      invalids.forEach(el => this.#markInvalid(el))

      invalids[0]?.focus()
      invalids[0]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return ok
  }

  #markInvalid(el) {
    el.classList.add("border-red-500", "ring-1", "ring-red-400")
    const label = el.closest("p, .field, .form-row")?.querySelector("label")
    if (label) label.classList.add("text-red-600")
  }

  #clearValidityStyles(el) {
    el.classList.remove("border-red-500", "ring-1", "ring-red-400")
    const label = el.closest("p, .field, .form-row")?.querySelector("label")
    if (label) label.classList.remove("text-red-600")
  }
}

if (typeof window !== "undefined") window.ApplicantCreate = ApplicantCreate;
