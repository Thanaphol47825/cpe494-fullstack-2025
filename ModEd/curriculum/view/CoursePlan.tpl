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
                <h1 class="text-3xl font-bold tracking-tight">Add Course Plan</h1>
            </header>

            <section class="bg-white rounded-2xl shadow p-6">
                <form
                    id="coursePlanForm"
                    method="post"
                    action="{{ RootURL }}/curriculum/CoursePlan/createCoursePlan"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div>
                      <label class="block text-sm font-medium mb-1">Course<span class="text-red-500">*</span></label>
                      <div id="CourseSelectContainer"></div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Date<span class="text-red-500">*</span></label>
                        <input type="date" name="date" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Week<span class="text-red-500">*</span></label>
                        <input type="number" name="week" min="1" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter a number of week" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Topic<span class="text-red-500">*</span></label>
                        <textarea name="topic" required class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Course Plan Topic"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea name="description" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Course Plan Description"></textarea>
                    </div>

                    <div class="md:col-span-2">
                        <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save Course Plan</button>
                    </div>
                </form>
            </section>
        </div>

        <script src="{{ RootURL }}/curriculum/static/js/CoursePlanCreate.js?v=1" defer></script>
    </body>

</html>