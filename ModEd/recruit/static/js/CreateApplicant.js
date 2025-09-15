document.getElementById("applicantForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (data.birth_date) {
    data.birth_date = new Date(data.birth_date).toISOString();
  }

  const numberFields = [
    "gpax", "tgat1", "tgat2", "tgat3",
    "tpat1", "tpat2", "tpat3", "tpat4", "tpat5",
    "family_income", "math_grade", "science_grade", "english_grade"
  ];
  numberFields.forEach(f => {
    if (data[f]) data[f] = parseFloat(data[f]);
  });

  const statusEl = document.getElementById("formStatus");
  const resultBox = document.getElementById("resultBox");

  statusEl.textContent = "Submitting...";
  statusEl.className = "text-sm text-gray-600";

  try {
    const response = await fetch("/recruit/CreateApplicant", {
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
});
