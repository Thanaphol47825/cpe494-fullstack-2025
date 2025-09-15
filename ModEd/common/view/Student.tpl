<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>
<body class="bg-gray-50 text-gray-900">
  <main class="max-w-2xl mx-auto p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Add Student</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="studentForm"
        method="post"
        action="{{ RootURL }}/common/students"
        class="grid grid-cols-1 gap-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Student Code <span class="text-red-500">*</span></label>
          <input name="student_code" type="text" required placeholder="0"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">First Name <span class="text-red-500">*</span></label>
            <input name="first_name" type="text" required placeholder="First name"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Last Name <span class="text-red-500">*</span></label>
            <input name="last_name" type="text" required placeholder="Last name"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email <span class="text-red-500">*</span></label>
          <input name="email" type="email" required placeholder="name@example.com"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Start Date</label>
            <input name="start_date" type="date"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Birth Date</label>
            <input name="birth_date" type="date"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Program</label>
            <select name="program"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">Select</option>
              <option value="0">Regular</option>
              <option value="1">International</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Department</label>
            <input name="department" type="text" placeholder="e.g., CPE"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Status</label>
            <select name="status"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">Select</option>
              <option value="0">ACTIVE</option>
              <option value="1">GRADUATED</option>
              <option value="2">DROP</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Gender</label>
            <select name="Gender"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Citizen ID</label>
            <input name="CitizenID" type="text" placeholder="0"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Phone Number</label>
            <input name="PhoneNumber" type="tel" placeholder="0"
                   class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Advisor Code</label>
          <input name="AdvisorCode" type="text" placeholder="0"
                 class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit"
                  class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Save
          </button>
          <button type="reset"
                  class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
            Reset
          </button>
        </div>
      </form>
    </section>

    <div id="resultBox" class="mt-4 text-sm text-gray-700"></div>
  </main>

  <script src="{{ RootURL }}/common/static/js/StudentCreate.js?v=1" defer></script>
</body>
</html>
