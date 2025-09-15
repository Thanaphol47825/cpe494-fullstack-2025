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
      <h1 class="text-3xl font-bold tracking-tight">Add Student</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="studentForm"
        method="post"
        action="{{ RootURL }}/hr/students"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Student Code <span class="text-red-500">*</span></label>
          <input name="student_code" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="STU0001" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email <span class="text-red-500">*</span></label>
          <input name="email" type="email" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="name@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">First Name <span class="text-red-500">*</span></label>
          <input name="first_name" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="First name" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Last Name <span class="text-red-500">*</span></label>
          <input name="last_name" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Last name" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Department</label>
          <input name="department" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" placeholder="Department (e.g., CPE)" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Start Date</label>
          <input name="start_date" type="date" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Birth Date</label>
          <input name="birth_date" type="date" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Program</label>
          <select name="program" class="w-full rounded-xl border border-gray-300 px-3 py-2">
            <option value="">— Select —</option>
            <option value="0">Regular</option>
            <option value="1">International</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <select name="status" class="w-full rounded-xl border border-gray-300 px-3 py-2">
            <option value="">— Select —</option>
            <option value="0">ACTIVE</option>
            <option value="1">GRADUATED</option>
            <option value="2">DROP</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Gender</label>
          <select name="Gender" class="w-full rounded-xl border border-gray-300 px-3 py-2">
            <option value="">— Select —</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Citizen ID</label>
          <input name="CitizenID" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Citizen ID" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Phone Number</label>
          <input name="PhoneNumber" type="tel" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Phone number" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Advisor Code</label>
          <input name="AdvisorCode" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="INS0001" />
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

  <script src="{{ RootURL }}/hr/static/js/StudentCreate.js?v=1" defer></script>
</body>
</html>
