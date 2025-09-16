<html>
  <head>
        <meta charset="utf-8" />
        <title>{{ title }}</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
    </head>
  <body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div class="max-w-2xl mx-auto mb-8 text-center">
        <h1 class="text-3xl font-extrabold mb-2">Internship Criteria Management</h1>
        <p class="text-gray-500">Create, edit, and manage internship evaluation criteria easily.</p>
      </div>
      <!-- Modal -->
      <div id="criteria-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 w-full max-w-lg relative animate-fade-in">
          <button id="closeModalBtn" class="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold">&times;</button>
          <h2 class="text-xl font-bold text-blue-700 mb-4">Internship Criteria Form</h2>
          <form id="criteriaForm" class="space-y-4">
            <div>
              <label class="block font-semibold text-blue-700">Title</label>
              <input type="text" name="title" class="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none" required />
            </div>
            <div>
              <label class="block font-semibold text-blue-700">Description</label>
              <input type="text" name="description" class="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none" required />
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold text-blue-700">Score</label>
                <input type="number" name="score" class="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none" required min="0" />
              </div>
              <div class="flex-1">
                <label class="block font-semibold text-blue-700">Internship Application ID</label>
                <input type="number" name="internship_application_id" class="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none" required min="1" />
              </div>
            </div>
            <div class="flex gap-2 pt-2">
              <button id="submitBtn" type="submit" class="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-semibold shadow">Create</button>
            </div>
          </form>
        </div>
      </div>
      <div class="max-w-3xl mx-auto">
        <div id="criteria-list"></div>
      </div>
    </div>
    <script src="/curriculum/static/js/internship_criteria.js"></script>
  </body>
</html>
