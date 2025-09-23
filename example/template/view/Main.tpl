<html>
	<head>
		<title>{{ title }}</title>
		<script src="{{ RootURL }}static/js/TemplateEngine.js"></script>
		<script src="{{ RootURL }}static/js/FormRender.js"></script>
		<script src="{{ RootURL }}static/js/TableRender.js"></script>
		<script src="{{ RootURL }}static/js/mustache.min.js"></script>
		<script src="{{ RootURL }}static/js/DOMObject.js"></script>

		<script src="{{ RootURL }}static/js/HRApplication.js"></script>

		<script>
			let RootURL = "{{ RootURL }}";
			let engine = new TemplateEngine();
			console.log(engine);
			document.addEventListener("DOMContentLoaded", () => {
				engine.render();
			});
		</script>

		<link rel="stylesheet" type="text/css" href="{{ RootURL }}static/css/Style.css" />
	</head>
	<body>
	</body>
</html>