<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>

<body class="min-h-screen bg-gray-50 text-gray-900">
  <div class="max-w-3xl mx-auto py-10 px-4">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
      <p class="text-gray-600 mt-2">
        Create or edit application reports for applicants and their application rounds.
      </p>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form id="applicationReportForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">
            Applicant ID <span class="text-red-500">*</span>
          </label>
          <input name="applicant_id" type="number" required
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Application Round ID <span class="text-red-500">*</span>
          </label>
          <input name="application_rounds_id" type="number" required
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Faculty ID</label>
          <input name="faculty_id" type="number"
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Department ID</label>
          <input name="department_id" type="number"
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Program Name / Type</label>
          <input name="program" type="text"
                 placeholder="e.g. Portfolio, Scholarship, Special Admission"
                 class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Application Status</label>
          <select name="application_statuses"
                  class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none">
            <option value="">-- Select Status --</option>
            <option value="Pending">Pending</option>
            <option value="Eligible">Eligible</option>
            <option value="Interview">Interview</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div class="md:col-span-2 flex items-center gap-3 pt-4 justify-end">
          <button type="button" id="btnCancel"
                  class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
            ← Cancel
          </button>

          <button type="reset"
                  class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
            Reset
          </button>

          <button type="submit"
                  class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Save
          </button>

          <span id="formStatus" class="text-sm ml-4"></span>
        </div>
      </form>
    </section>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm overflow-x-auto shadow-sm">
      <pre id="resultContent" class="whitespace-pre-wrap text-gray-800"></pre>
    </div>
  </div>

  <script src="{{ RootURL }}/recruit/static/js/ApplicationReportCreate.js" defer></script>
  <script>
    document.addEventListener("DOMContentLoaded", async () => {
      const cancelBtn = document.getElementById("btnCancel");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", async () => {
          await window.engine?.fetchModule("/recruit/static/js/ApplicationReportList.js");
          const list = new ApplicationReportList(window.engine, window.__ROOT_URL__);
          document.body.innerHTML = "";
          await list.render();
        });
      }
    });
  </script>
</body>
</html>
