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
        <h1 class="text-3xl font-bold tracking-tight">Add Course</h1>
      </header>

      <section class="bg-white rounded-2xl shadow p-6">
        <form id="courseForm" method="post" action="{{ RootURL }}/curriculum/Course/createCourse" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Course Name <span class="text-red-500">*</span></label>
            <input type="text" name="Name" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Enter course name" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Description <span class="text-red-500">*</span></label>
            <textarea name="Description" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Course description"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Curriculum</label>
            <div id="curriculumSelectContainer"></div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Optional <span class="text-red-500">*</span></label>
            <select name="Optional" required class="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">Please Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Course Status <span class="text-red-500">*</span></label>
            <select name="CourseStatus" required class="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">Please Select</option>
              <option value="0">Inactive</option>
              <option value="1">Active</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <button type="submit" class="w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700">Save Course</button>
          </div>
        </form>
      </section>
    </div>
    <script src="{{ RootURL }}/curriculum/static/js//CourseCreate.js"></script>
  </body>
</html>