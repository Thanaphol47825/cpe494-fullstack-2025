<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Interview Criteria</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>

<body class="min-h-screen bg-gray-50 text-gray-900">
    <div class="max-w-3xl mx-auto py-10 px-4">
        <div class="flex items-center justify-center">
            <div class="text-3xl font-bold tracking-tight">Interview Criteria</div>
        </div>
        <section class="bg-white rounded-2xl shadow p-6 mt-6">
            <form id="createCriteriaForm" class="grid grid-cols-1 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Application Round ID</label>
                    <input name="application_rounds_id" type="text" value="1" required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Faculty ID</label>
                    <input name="faculty_id" type="text" value="2" required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Department ID</label>
                    <input name="department_id" type="text" value="3" required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2" />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Passing Score</label>
                    <input name="passing_score" type="text" value="60.5" required
                        class="w-full rounded-xl border border-gray-300 px-3 py-2" />
                </div>

                <div class="flex items-center gap-3 pt-2">
                    <button id="submitCreateCriteria" type="submit"
                        class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">Save</button>
                    <button type="reset"
                        class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">Reset</button>
                    <button id="addCriteriaBtn"
                        class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">
                        Add config
                    </button>
                    <span id="formMessage" class="text-sm text-gray-600"></span>
                </div>
            </form>
        </section>

    </div>
    <script src="{{ RootURL }}/recruit/static/js/InterviewCriteriaCreate.js" defer></script>
</body>

</html>