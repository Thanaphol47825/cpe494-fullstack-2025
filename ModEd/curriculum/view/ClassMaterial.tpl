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
                <h1 class="text-3xl font-bold tracking-tight">Add Class Material</h1>
            </header>

            <section class="bg-white rounded-2xl shadow p-6">
                <form
                    id="classMaterialForm"
                    method="post"
                    action="{{ RootURL }}/curriculum/ClassMaterial/createClassMaterial"
                    class="flex flex-col gap-6"
                >
                    <div>
                        <label class="block text-sm font-medium mb-1"> <span class="text-red-500">Class</span></label>
                        <div id="classSelectContainer"></div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">File Name</label>
                        <input required name="FileName" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Class Material File Name" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">File Path</label>
                        <input required name="FilePath" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="/path/to/your/file" />
                    </div>

                    <div class="md:col-span-2">
                        <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save Class Material</button>
                    </div>
                </form>
            </section>
        </div>

    </body>
    <script src="{{ RootURL }}/curriculum/static/js/ClassMaterialCreate.js?v=1" defer></script>
</html>