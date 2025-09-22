class ApplicantCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("ApplicantCreate: render(New Applicant Form)");
    
    const fields = [
      { label: "First Name", name: "first_name", type: "text", required: true },
      { label: "Last Name", name: "last_name", type: "text", required: true },
      { label: "Email", name: "email", type: "email", required: true },
      { label: "Birth Date", name: "birth_date", type: "date", required: true },
      { label: "Address", name: "address", type: "text", colSpan: 2 },
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

      { label: "Portfolio URL", name: "portfolio_url", type: "url", colSpan: 2 },

      { label: "Family Income", name: "family_income", type: "number", step: "0.01" },
      { label: "Math Grade", name: "math_grade", type: "number", step: "0.01" },
      { label: "Science Grade", name: "science_grade", type: "number", step: "0.01" },
      { label: "English Grade", name: "english_grade", type: "number", step: "0.01" },
    ];

    const formTpl = `
      <div class="max-w-3xl mx-auto py-10 px-4">
        <header class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight">Create Applicant</h1>
        </header>
        <section class="bg-white rounded-2xl shadow p-6">
          <form id="ApplicantForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${fields.map(f => `
              <div class="${f.colSpan === 2 ? "md:col-span-2" : ""}">
                <label class="block text-sm font-medium mb-1">
                  ${f.label}${f.required ? '<span class="text-red-500">*</span>' : ""}
                </label>
                <input type="${f.type}" 
                       name="${f.name}" 
                       ${f.required ? "required" : ""} 
                       ${f.step ? `step="${f.step}"` : ""} 
                       class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            `).join("")}

            <div class="md:col-span-2 pt-4">
              <button type="submit" 
                class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Save Applicant
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


    domObj.html.querySelector("#ApplicantForm")
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
      "gpax","tgat1","tgat2","tgat3",
      "tpat1","tpat2","tpat3","tpat4","tpat5",
      "family_income","math_grade","science_grade","english_grade"
    ].forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
    });

    const statusEl = document.getElementById("formStatus");
    const resultBox = document.getElementById("resultBox");

    statusEl.textContent = "Submitting...";
    statusEl.className = "text-sm text-gray-500";

    try {
      const res = await fetch(window.__ROOT_URL__ + "/recruit/CreateApplicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.isSuccess) {
        statusEl.textContent = "Applicant created successfully!";
        statusEl.className = "text-sm text-green-600";
        resultBox.className = "mt-4 text-sm p-3 rounded-md bg-green-50 text-green-700";
        resultBox.textContent = JSON.stringify(result.result, null, 2);
        resultBox.classList.remove("hidden");
        form.reset();
      } else {
        statusEl.textContent = "Failed to create applicant";
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
