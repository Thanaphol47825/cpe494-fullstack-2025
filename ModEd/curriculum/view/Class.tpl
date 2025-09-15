<html>
  <head>
    <meta charset="utf-8" />
    <title>{{ title }}</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
  </head>
  <body class="min-h-screen bg-gray-50 text-gray-900">
    <div class="max-w-3xl mx-auto py-10 px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Add Class</h1>
      </header>

      <section class="bg-white rounded-2xl shadow p-6">
        <form
          id="class-create-form"
          method="post"
          action="{{ RootURL }}/curriculum/Class/createClass"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Course ID <span class="text-red-500">*</span></label>
            <input name="CourseId" type="number" min="1" required
              class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 101" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Section <span class="text-red-500">*</span></label>
            <input name="Section" type="number" min="0" required
              class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 1" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Schedule <span class="text-red-500">*</span></label>
            <input name="Schedule" type="datetime-local" required
              class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="md:col-span-2">
            <button type="submit"
              class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Save Class
            </button>
          </div>
        </form>
      </section>
    </div>

    <script src="{{ RootURL }}/curriculum/static/js/ClassCreate.js?v=1" defer></script>
  </body>
</html>
