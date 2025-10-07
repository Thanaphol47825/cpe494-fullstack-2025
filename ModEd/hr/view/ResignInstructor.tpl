<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Instructor Resignation</title>
  <script src="{{RootURL}}/hr/static/js/ResignInstructor.js"></script>
</head>
<body>
  <h1>Instructor Resignation Form</h1>

  <form id="resignForm">
    <label for="instructorCode">Instructor Code:</label><br />
    <input type="text" id="instructorCode" name="instructorCode" required /><br /><br />

    <label for="reason">Reason:</label><br />
    <textarea id="reason" name="reason" rows="4" cols="40" required></textarea><br /><br />

    <button type="submit">Submit Resignation</button>
  </form>

  <div id="message"></div>


</body>
</html>
