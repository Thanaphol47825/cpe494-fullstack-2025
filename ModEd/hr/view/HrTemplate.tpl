<html>
<head>
  <title>{{ title }}</title>

  <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
  <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
  <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
  <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
  <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
  <script src="{{ RootURL }}/core/static/js/FormRender.js"></script>
  <script src="{{ RootURL }}/core/static/js/AdvanceFormRender.js"></script>
  <script src="{{ RootURL }}/core/static/js/AdvanceTableRender.js"></script>
  
  <!-- HR Module Scripts -->
  <script src="{{ RootURL }}/hr/static/js/HrApplication.js"></script>
  <script src="{{ RootURL }}/hr/static/js/features/StudentForm.js"></script>
  <script src="{{ RootURL }}/hr/static/js/features/InstructorForm.js"></script>
  
  <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  
  <script>
    let RootURL = "{{ RootURL }}";
    let modules = {{{modules}}};

    let engine = new TemplateEngine();
    document.addEventListener("DOMContentLoaded", async () => {
      await engine.render();

      const res = await fetch('/api/modelmeta/field');
      const meta = await res.json();

      const schema = (meta || []).map(f => ({
        type:     f.type || "text",
        name:     f.name,
        label:    f.label || f.name,
      }));

      const formRender = new FormRender(engine, schema, ".Form1");
      await formRender.render();
    });
  </script>
</head>

<body class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
  <div class="min-h-screen flex flex-col">
    <header class="bg-white/70 backdrop-blur border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            {{ title }}
          </h1>
          <p class="text-sm text-slate-500">
            Human Resources Management
          </p>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div id="MainContainer" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"></div>
      <div class="Form1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"></div>
    </main>
  </div>
</body>
</html>
