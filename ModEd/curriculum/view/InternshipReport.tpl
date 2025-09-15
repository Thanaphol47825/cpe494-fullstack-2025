<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
</head>
<body>
  <h1>{{title}}</h1>

  {{#success}}<p style="color:green">Saved successfully.</p>{{/success}}
  <form method="POST" action="{{RootURL}}/curriculum/CreateInternshipReport">
    <label for="ReportScore">Report Score</label>
    <input type="number" id="ReportScore" name="ReportScore" min="0" max="100" required />
    <button type="submit">Save</button>
  </form>
</body>
</html>
