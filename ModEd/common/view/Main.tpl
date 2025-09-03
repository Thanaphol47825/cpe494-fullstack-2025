<html>
	<head>
		<title>{{ title}}</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
		<script>
			let a = 10;
			console.log(a);
			let allHeaders = document.getElementsByTagName("h1");
			let badHeader = document.getElementById("BadID");
			let modules = document.getElementsByClassName("moduleList");
		</script>
		<script src="{{ RootURL }}/common/static/js/demo.js"></script>
		<style>
			h1{
				font-weight: bold;
			}

			#BadID{
				font-size: 64px;
			}

			.moduleList{
				font-style: oblique;
			}
		</style>
		<link href="{{ RootURL }}common/share/css/Main.css" >
	</head>
	<body>
    <h1 class="text-3xl font-bold underline">
      ModEd BackOffice
    </h1>
		<h1 id="BadID">BasId</h1>
		<ul>
			<li class="moduleList">Module Common</li>
			<li class="moduleList">Module HR</li>
			<li class="moduleList">Module Evaluation</li>
			<li class="moduleList">Module Recruit</li>
		</ul>
		<form method="POST" action="{{ RootURL }}common/student/insert">
			<p>
				<label>First Name</label>
				<input type="text" name="FirstName" placeholder="First Name"/>
			</p>
			<input type="submit" />
		</form>
	</body>
</html>