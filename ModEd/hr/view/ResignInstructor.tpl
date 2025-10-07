<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <!-- ใช้ Tailwind ผ่าน CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <!-- ตัวแปร ROOT_URL สำหรับ JS -->
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>

<body class="min-h-screen bg-gray-50 text-gray-900">
  <div class="max-w-3xl mx-auto py-10 px-4">
    
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">Instructor Resignation Request</h1>
      <p class="text-gray-600">Please fill out the form to submit your resignation request.</p>
    </header>

    <!-- Form Section -->
    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="resignationInstructorForm"
        method="post"
        action="{{ RootURL }}/hr/resignation-instructor-requests"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <!-- Instructor Code -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Instructor Code <span class="text-red-500">*</span>
          </label>
          <input
            name="InstructorCode"
            type="text"
            required
            class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="INS0001"
          />
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Reason <span class="text-red-500">*</span>
          </label>
          <input
            name="Reason"
            type="text"
            required
            class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Reason"
          />
        </div>

        <!-- Optional: Date of resignation -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Effective Date <span class="text-gray-400">(optional)</span>
          </label>
          <input
            name="EffectiveDate"
            type="date"
            class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Form Buttons -->
        <div class="md:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Submit
          </button>

          <button
            type="reset"
            class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50"
          >
            Reset
          </button>

          <a
            href="{{ RootURL }}/hr/resignation/instructor"
            class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50 text-gray-700"
          >
            Back
          </a>

          <span id="formStatus" class="text-sm"></span>
        </div>
      </form>
    </section>

    <!-- Result box -->
    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>

  <!-- JS script สำหรับประมวลผลฟอร์ม -->
  <script src="{{ RootURL }}/hr/static/js/ResignationInstructorCreateRequest.js?v=1" defer></script>
</body>
</html>