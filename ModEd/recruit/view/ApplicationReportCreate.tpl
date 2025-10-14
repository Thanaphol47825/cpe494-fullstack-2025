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
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
      <p class="text-gray-600 mt-2">Create a new Application Report for applicants and their selected program.</p>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form id="applicationReportForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium mb-1">Applicant ID <span class="text-red-500">*</span></label>
          <input name="applicant_id" type="number" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Application Round ID <span class="text-red-500">*</span></label>
          <input name="application_rounds_id" type="number" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Faculty ID <span class="text-red-500">*</span></label>
          <input name="faculty_id" type="number" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Department ID <span class="text-red-500">*</span></label>
          <input name="department_id" type="number" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Program Name</label>
          <input name="program" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Application Status</label>
          <select name="application_statuses" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none">
            <option value="">-- Select Status --</option>
            <option value="Pending">Pending</option>
            <option value="Eligible">Eligible</option>
            <option value="Rejected">Rejected</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div class="md:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit"
            class="inline-flex items-center rounded-xl bg-purple-600 text-white px-4 py-2 font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
            Save
          </button>
          <button type="reset"
            class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
            Reset
          </button>
          <span id="formStatus" class="text-sm"></span>
        </div>

      </form>
    </section>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>
  
  <script src="{{ RootURL }}/recruit/static/js/ApplicationReportCreate.js" defer></script>
</body>
</html>
