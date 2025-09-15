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
      <h1 class="text-3xl font-bold tracking-tight">Create Request</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="resignationStudentForm"
        method="post"
        action="{{ RootURL }}/hr/resignation-student-requests"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Student Code <span class="text-red-500">*</span></label>
          <input name="StudentCode" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="STU0001" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Reason <span class="text-red-500">*</span></label>
          <input name="Reason" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Reason" />
        </div>

        <div class="md:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Submit</button>
          <button type="reset" class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">Reset</button>
          <span id="formStatus" class="text-sm"></span>
        </div>
      </form>
    </section>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>

  <script src="{{ RootURL }}/hr/static/js/ResignationStudentCreateRequest.js?v=1" defer></script>
</body>
</html>
