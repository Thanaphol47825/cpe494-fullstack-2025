<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{ title }}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script>window.__ROOT_URL__ = "{{ RootURL }}";</script>
</head>

<body class="min-h-screen bg-gray-50 text-gray-900">
  <div class="max-w-xl mx-auto py-10 px-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
    </header>

    <div class="Form1"></div>

    <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
  </div>

  <script src="{{ RootURL }}/recruit/static/js/AdminCreate.js" defer></script>
</body>
</html>
