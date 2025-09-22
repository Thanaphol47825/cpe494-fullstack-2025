class ApplicationRoundCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("ApplicationRoundCreate: render(New Application Round Form)");

    const fields = [
      { label: "Round Name", name: "round_name", type: "text", required: true }
    ];

    const formTpl = `
      <div class="max-w-2xl mx-auto py-10 px-4">
        <header class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight">Create Application Round</h1>
        </header>
        <section class="bg-white rounded-2xl shadow p-6">
          <form id="ApplicationRoundForm" class="grid grid-cols-1 gap-4">
            ${fields.map(f => `
              <div>
                <label class="block text-sm font-medium mb-1">
                  ${f.label}${f.required ? '<span class="text-red-500">*</span>' : ""}
                </label>
                <input type="${f.type}" 
                       name="${f.name}" 
                       ${f.required ? "required" : ""} 
                       class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            `).join("")}

            <div class="pt-4">
              <button type="submit" 
                class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Save Application Round
              </button>
            </div>
          </form>
          <p id="formStatus" class="text-sm text-gray-500 mt-2"></p>
          <pre id="resultBox" class="hidden mt-4 text-sm p-3 rounded-md"></pre>
        </section>
      </div>
    `;

    const domObj = new DOMObject(formTpl, {}, false);
    this.application.mainContainer.innerHTML = "";
    this.application.mainContainer.appendChild(domObj.html);

    domObj.html.querySelector("#ApplicationRoundForm")
      .addEventListener("submit", (e) => this.submit(e));
  }

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const statusEl = document.getElementById("formStatus");
    const resultBox = document.getElementById("resultBox");

    statusEl.textContent = "Submitting...";
    statusEl.className = "text-sm text-gray-500";

    try {
      const res = await fetch(window.__ROOT_URL__ + "/recruit/CreateApplicationRound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.isSuccess) {
        statusEl.textContent = "Application Round created successfully!";
        statusEl.className = "text-sm text-green-600";

        resultBox.className = "mt-4 text-sm p-3 rounded-md bg-green-50 text-green-700";
        resultBox.textContent = JSON.stringify(result.result, null, 2);
        resultBox.classList.remove("hidden");

        form.reset();
      } else {
        statusEl.textContent = "Failed to create Application Round";
        statusEl.className = "text-sm text-red-600";

        resultBox.className = "mt-4 text-sm p-3 rounded-md bg-red-50 text-red-700";
        resultBox.textContent = result.result || "Unknown error";
        resultBox.classList.remove("hidden");
      }
    } catch (err) {
      statusEl.textContent = "Error submitting form";
      statusEl.className = "text-sm text-red-600";

      resultBox.className = "mt-4 text-sm p-3 rounded-md bg-red-50 text-red-700";
      resultBox.textContent = err.toString();
      resultBox.classList.remove("hidden");
    }
  }
}
