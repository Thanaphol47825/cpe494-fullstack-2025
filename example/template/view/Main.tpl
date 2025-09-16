<html>
	<head>
		<title>{{ title }}</title>
		<script src="{{ RootURL }}static/js/TemplateEngine.js"></script>
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
	</head>
	<body>
		<h1>{{ title }}</h1>
		<div id="MainContainer">
			<h2>Nothing</h2>
		</div>
	</body>
</html>