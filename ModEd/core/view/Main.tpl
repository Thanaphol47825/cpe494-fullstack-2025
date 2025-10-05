<html>

<head>
  <title>{{ title }}</title>
  <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
  <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
  <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
  <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
  <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
  <script src="{{ RootURL }}/core/static/js/FormRender.js"></script>
  
  <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
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
    const form = await formRender.render();

    const container = document.getElementById("MainContainer");
    });
  </script>
</head>

<body>
  <h1>{{ title }}</h1>
  <div id="MainContainer"></div>
  <div class="Form1"></div>
</body>

</html>