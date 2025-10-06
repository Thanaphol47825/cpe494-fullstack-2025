class ApplicationRoundCreate {
  constructor(engine, rootURL) {
    this.engine = engine
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || ""
  }

  async render() {
    if (!this.engine?.mainContainer) return false
    this.engine.mainContainer.innerHTML = ""
    try {
      await this.#createForm()
      return true
    } catch (err) {
      console.error(err)
      this.#showError("Failed to initialize form: " + err.message)
      return false
    }
  }

  async #createForm() {
    const pageHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 py-8">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900">Create Application Round</h1>
          </div>

          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Application Round Information
              </h2>
            </div>

            <div class="p-8">
              <form id="applicationRoundForm" class="space-y-6">
                <div>
                  <label for="round_name" class="block text-sm font-medium text-gray-700 mb-1">Round Name</label>
                  <input type="text" id="round_name" name="round_name" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <div class="flex gap-3 mt-6">
                  <button type="reset"
                          class="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50">
                    Reset
                  </button>
                  <button type="submit"
                          class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-white hover:opacity-90">
                    Create
                  </button>
                </div>
                <div class="text-center mt-4">
                  <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
                </div>
              </form>
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

    const form = document.getElementById("applicationRoundForm")
    const resultBox = document.getElementById("resultBox")
    const resultContent = document.getElementById("resultContent")

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      this.#setStatus("Submitting...", "text-gray-600")
      this.#hideResult()

      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())

      try {
        const resp = await fetch(this.rootURL + "/recruit/CreateApplicationRound", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const result = await resp.json()
        if (result?.isSuccess) {
          this.#setStatus("Application round created successfully!", "text-green-600")
          resultContent.textContent = JSON.stringify(result.result, null, 2)
          resultBox.classList.remove("hidden")
          form.reset()
        } else {
          this.#setStatus("Failed to create application round", "text-red-600")
          resultContent.textContent = JSON.stringify(result, null, 2)
          resultBox.classList.remove("hidden")
        }
      } catch (err) {
        this.#setStatus("Error submitting form", "text-red-600")
        resultContent.textContent = err.toString()
        resultBox.classList.remove("hidden")
      }
    })
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
}
