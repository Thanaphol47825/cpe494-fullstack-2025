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
      <form id="interviewForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Instructor ID <span class="text-red-500">*</span></label>
          <input name="instructor_id" type="number" value="1" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter instructor ID" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Application Report ID <span class="text-red-500">*</span></label>
          <input name="application_report_id" type="number" value="1" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter application report ID" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Scheduled Appointment <span class="text-red-500">*</span></label>
          <input name="scheduled_appointment" type="datetime-local" value="2025-01-20T14:00" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Criteria Scores</label>
          <textarea name="criteria_scores" rows="4" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder='{"communication": 8.5, "technical": 9.0, "motivation": 8.0}'>{"communication": 8.5, "technical": 9.0, "motivation": 8.0, "problem_solving": 7.5, "teamwork": 8.0}</textarea>
          <p class="text-sm text-gray-500 mt-1">Enter JSON format for criteria scores</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Total Score</label>
          <input name="total_score" type="number" step="0.1" value="8.2" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.0" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Evaluated At</label>
          <input name="evaluated_at" type="datetime-local" value="2025-01-20T15:30" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Interview Status</label>
          <select name="interview_status" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Evaluated" selected>Evaluated</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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

  <script src="{{ RootURL }}/recruit/static/js/InterviewCreate.js" defer></script>
</body>
</html>