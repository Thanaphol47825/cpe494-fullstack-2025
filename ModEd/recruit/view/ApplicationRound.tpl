<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>
<body class="min-h-screen bg-gray-50 text-gray-900">
  <div class="max-w-xl mx-auto py-10 px-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="applicationRoundForm"
        method="post"
        action="{{ RootURL }}/recruit/CreateApplicationRound"
        class="grid grid-cols-1 gap-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Round Name <span class="text-red-500">*</span></label>
          <input
            name="round_name"
            type="text"
            required
            class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., First Round"
          />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Save
          </button>
          <button
            type="reset"
            class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
            Reset
          </button>
          <span id="formStatus" class="text-sm"></span>
        </div>
      </form>
    </section>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>

  <script src="{{ RootURL }}/recruit/static/js/ApplicationRoundCreate.js?v=1" defer></script>
</body>
</html>
