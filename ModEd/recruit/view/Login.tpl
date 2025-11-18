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
  
  <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  
  <script>
    let RootURL = "{{ RootURL }}";
    window.RootURL = RootURL;
  </script>
  <script src="{{ RootURL }}/recruit/static/js/Login.js"></script>
</head>

<body class="min-h-screen bg-gray-50">
  <div id="MainContainer" class="w-full"></div>
</body>

</html>
