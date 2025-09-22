class ApplicationRoundCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("ApplicationRoundCreate: render()");
    this.application.mainContainer.innerHTML = "<h2>Create Application Round</h2>";

    const formTpl = `
      <form id="ApplicationRoundForm" class="space-y-4">
        {{#fields}}
        <p>
          <label class="block text-sm font-medium">{{label}}</label>
          <input name="{{name}}" type="{{type}}"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </p>
        {{/fields}}
        <p>
          <input type="submit" value="Save Application Round"
                 class="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"/>
        </p>
        <p id="formStatus" class="text-sm text-gray-600"></p>
        <pre id="resultBox" class="hidden mt-6 rounded-xl border p-4 text-sm"></pre>
      </form>
    `;

    const fields = [
      { label: "Round Name", name: "round_name", type: "text" },
    ];

    const html = Mustache.render(formTpl, { fields });
    this.application.mainContainer.insertAdjacentHTML("beforeend", html);

    document
      .getElementById("ApplicationRoundForm")
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
    statusEl.className = "text-sm text-gray-600";

    try {
      const response = await fetch(RootURL + "/recruit/CreateApplicationRound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.isSuccess) {
        statusEl.textContent = "Application Round created successfully!";
        statusEl.className = "text-sm text-green-600 font-medium";

        resultBox.className =
          "mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800";
        resultBox.textContent = JSON.stringify(result.result, null, 2);
        resultBox.classList.remove("hidden");

        form.reset();
      } else {
        statusEl.textContent = "Failed to create application round";
        statusEl.className = "text-sm text-red-600 font-medium";

        resultBox.className =
          "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
        resultBox.textContent = result.result || "Unknown error";
        resultBox.classList.remove("hidden");
      }
    } catch (err) {
      statusEl.textContent = "Error submitting form";
      statusEl.className = "text-sm text-red-600 font-medium";

      resultBox.className =
        "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
      resultBox.textContent = err.toString();
      resultBox.classList.remove("hidden");
    }
  }
}
