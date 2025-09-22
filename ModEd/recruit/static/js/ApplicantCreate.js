class ApplicantCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("ApplicantCreate: render()");
    this.application.mainContainer.innerHTML = "<h2>Create Applicant</h2>";

    const formTpl = `
      <form id="ApplicantForm" class="space-y-4">
        {{#fields}}
        <p>
          <label class="block text-sm font-medium">{{label}}</label>
          <input name="{{name}}" type="{{type}}" {{#step}}step="{{step}}"{{/step}}
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </p>
        {{/fields}}
        <p>
          <input type="submit" value="Save Applicant"
                 class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"/>
        </p>
        <p id="formStatus" class="text-sm text-gray-600"></p>
        <pre id="resultBox" class="hidden mt-6 rounded-xl border p-4 text-sm"></pre>
      </form>
    `;

    const fields = [
      { label: "First Name", name: "first_name", type: "text" },
      { label: "Last Name", name: "last_name", type: "text" },
      { label: "Email", name: "email", type: "email" },
      { label: "Birth Date", name: "birth_date", type: "date" },
      { label: "Address", name: "address", type: "text" },
      { label: "Phone Number", name: "phone_number", type: "text" },

      { label: "GPAX", name: "gpax", type: "number", step: "0.01" },
      { label: "High School Program", name: "high_school_program", type: "text" },

      { label: "TGAT1", name: "tgat1", type: "number", step: "0.01" },
      { label: "TGAT2", name: "tgat2", type: "number", step: "0.01" },
      { label: "TGAT3", name: "tgat3", type: "number", step: "0.01" },

      { label: "TPAT1", name: "tpat1", type: "number", step: "0.01" },
      { label: "TPAT2", name: "tpat2", type: "number", step: "0.01" },
      { label: "TPAT3", name: "tpat3", type: "number", step: "0.01" },
      { label: "TPAT4", name: "tpat4", type: "number", step: "0.01" },
      { label: "TPAT5", name: "tpat5", type: "number", step: "0.01" },

      { label: "Portfolio URL", name: "portfolio_url", type: "url" },

      { label: "Family Income", name: "family_income", type: "number", step: "0.01" },
      { label: "Math Grade", name: "math_grade", type: "number", step: "0.01" },
      { label: "Science Grade", name: "science_grade", type: "number", step: "0.01" },
      { label: "English Grade", name: "english_grade", type: "number", step: "0.01" },
    ];

    const html = Mustache.render(formTpl, { fields });

    this.application.mainContainer.insertAdjacentHTML("beforeend", html);

    document
      .getElementById("ApplicantForm")
      .addEventListener("submit", (e) => this.submit(e));
  }

  async submit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.birth_date) {
      data.birth_date = new Date(data.birth_date).toISOString();
    }

    [
      "gpax",
      "tgat1", "tgat2", "tgat3",
      "tpat1", "tpat2", "tpat3", "tpat4", "tpat5",
      "family_income",
      "math_grade", "science_grade", "english_grade"
    ].forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
    });

    const statusEl = document.getElementById("formStatus");
    const resultBox = document.getElementById("resultBox");

    statusEl.textContent = "Submitting...";
    statusEl.className = "text-sm text-gray-600";

    try {
      const response = await fetch(RootURL + "/recruit/CreateApplicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.isSuccess) {
        statusEl.textContent = "Applicant created successfully!";
        statusEl.className = "text-sm text-green-600 font-medium";

        resultBox.className = "mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800";
        resultBox.textContent = JSON.stringify(result.result, null, 2);
        resultBox.classList.remove("hidden");

        form.reset();
      } else {
        statusEl.textContent = "Failed to create applicant";
        statusEl.className = "text-sm text-red-600 font-medium";

        resultBox.className = "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
        resultBox.textContent = result.result || "Unknown error";
        resultBox.classList.remove("hidden");
      }
    } catch (err) {
      statusEl.textContent = "Error submitting form";
      statusEl.className = "text-sm text-red-600 font-medium";

      resultBox.className = "mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800";
      resultBox.textContent = err.toString();
      resultBox.classList.remove("hidden");
    }
  }
}
