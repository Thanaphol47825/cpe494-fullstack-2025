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
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form id="applicantForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name <span class="text-red-500">*</span></label>
          <input name="first_name" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Last Name <span class="text-red-500">*</span></label>
          <input name="last_name" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email <span class="text-red-500">*</span></label>
          <input name="email" type="email" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Birth Date</label>
          <input name="birth_date" type="date" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Address</label>
          <input name="address" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Phone Number</label>
          <input name="phone_number" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">GPAX</label>
          <input name="gpax" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">High School Program</label>
          <input name="high_school_program" type="text" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TGAT1</label>
          <input name="tgat1" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TGAT2</label>
          <input name="tgat2" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TGAT3</label>
          <input name="tgat3" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TPAT1</label>
          <input name="tpat1" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TPAT2</label>
          <input name="tpat2" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TPAT3</label>
          <input name="tpat3" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TPAT4</label>
          <input name="tpat4" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">TPAT5</label>
          <input name="tpat5" type="number" step="0.01" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Portfolio URL</label>
          <input name="portfolio_url" type="url" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Family Income</label>
          <input name="family_income" type="number" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Math Grade</label>
          <input name="math_grade" type="number" step="0.01" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Science Grade</label>
          <input name="science_grade" type="number" step="0.01" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">English Grade</label>
          <input name="english_grade" type="number" step="0.01" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none" />
        </div>

        <div class="md:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save</button>
          <button type="reset" class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">Reset</button>
          <span id="formStatus" class="text-sm"></span>
        </div>
      </form>
    </section>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>

  <script src="{{ RootURL }}/recruit/static/js/CreateApplicant.js" defer></script>
</body>
</html>
