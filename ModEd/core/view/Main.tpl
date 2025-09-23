<html>

<head>
  <title>{{ title }}</title>
  <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
  <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
  <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
  <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
 
  <link rel="stylesheet" type="text/css" href="{{ RootURL }}/static/css/Style.css" />
  <script>
    let RootURL = "{{ RootURL }}";
    let modules = {{{modules}}};

    let engine = new TemplateEngine();
    document.addEventListener("DOMContentLoaded", () => {
      engine.render();
    });
  </script>
</head>

<body>
  <h1>{{ title }}</h1>
  <div id="MainContainer"></div>
</body>

</html>