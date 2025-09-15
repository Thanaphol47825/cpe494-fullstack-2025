<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>
<body class="min-h-screen bg-blue-200">
  <div class="max-w-3xl mx-auto py-10 px-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Add Curriculum</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="curriculum-create-form"
        method="post"
        action="{{ RootURL }}/curriculum/Curriculum/createCurriculum"
        class="flex flex-col gap-4"
      >
        <div>
          <label class="text-sm font-medium mb-1">Name<span class="text-red-500">*</span></label>
          <input name="Name" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Curriculum Name" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">Start Year<span class="text-red-500">*</span></label>
          <input name="StartYear" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="25xx" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">End Year<span class="text-red-500">*</span></label>
          <input name="EndYear" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="25xx" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">Department</label>
          <select name="Department" class="w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="">Please Select</option>
            <option value=0>Machanical Engineering</option>
            <option value=1>Computer Engineering</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-medium mb-1">ProgramType</label>
          <select name="ProgramType" class="w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="">Please Select</option>
            <option value=0>Regular</option>
            <option value=1>International</option>
          </select>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" class="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 focus:ring-blue-500">Save</button>
        </div>
      </form>
    </section>

  </div>

  <script src="{{ RootURL }}/curriculum/static/js/CurriculumCreate.js" defer></script>
</body>
</html>
