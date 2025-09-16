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
      <h1 class="text-2xl font-semibold">Add Instructor</h1>
    </header>

    <form
      id="instructorForm"
      method="post"
      action="{{ RootURL }}/common/instructors"
      class="space-y-4"
    >
      <div>
        <label class="block text-sm mb-1">Instructor Code</label>
        <input name="instructorCode" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="INS001" />
      </div>

      <div>
        <label class="block text-sm mb-1">First Name</label>
        <input name="firstName" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="First name" />
      </div>

      <div>
        <label class="block text-sm mb-1">Last Name</label>
        <input name="lastName" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="Last name" />
      </div>

      <div>
        <label class="block text-sm mb-1">Email</label>
        <input name="email" type="email" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="name@example.com" />
      </div>

      <div>
        <label class="block text-sm mb-1">Start Date</label>
        <input name="startDate" type="date" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm mb-1">Department</label>
        <input name="department" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-gray-400" placeholder="Department" />
      </div>

      <div>
        <button type="submit" class="w-full rounded-md mt-2 bg-green-700 text-white px-4 py-2 hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400">Submit</button>
        <span id="formStatus" class="text-sm text-gray-600"></span>
      </div>
    </form>
  </div>

  <script src="{{ RootURL }}/common/static/js/InstructorForm.js?v=1" defer></script>
</body>
</html>
