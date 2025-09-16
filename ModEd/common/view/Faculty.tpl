<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>
<body class="min-h-screen bg-white text-gray-800">
  <div class="max-w-2xl mx-auto py-10 px-4">
    <header class="mb-8">
      <h1 class="text-2xl font-semibold">Add Faculty</h1>
    </header>

    <form
      id="facultyForm"
      method="post"
      action="{{ RootURL }}/common/faculties"
      class="space-y-4"
    >
      <div>
        <label class="block text-sm mb-1">Faculty Name</label>
        <input name="name" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="Faculty name" />
      </div>

      <div>
        <label class="block text-sm mb-1">Budget</label>
        <input name="budget" type="number" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="0" min="0" />
      </div>

      <div>
        <button type="submit" class="w-full rounded-md mt-2 bg-green-700 text-white px-4 py-2 hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400">Submit</button>
      </div>
    </form>
  </div>

  <script src="{{ RootURL }}/common/static/js/FacultyForm.js?v=1" defer></script>
</body>
</html>