<html>

<head>
  <title>{{ title }}</title>
  <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
  <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
  <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
  <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
  <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
  <script src="{{ RootURL }}/core/static/js/FormRender.js"></script>
  <script src="{{ RootURL }}/core/static/js/FormRenderV2.js"></script>
  <script src="{{ RootURL }}/core/static/js/TableRenderV2.js"></script>
  
  <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    let RootURL = "{{ RootURL }}";
    let modules = {{{modules}}};

    let engine = new TemplateEngine();
    document.addEventListener("DOMContentLoaded", async () => {
      await engine.render();

      // const formRender = new FormRenderV2(engine, {
      //   modelPath: "common/student",
      // }).render();
    });
  </script>
</head>

<body>
  <h1>{{ title }}</h1>
  <div id="MainContainer"></div>
  <div class="Form1"></div>
</body>

</html>