<!DOCTYPE html>
<html>
<head>
    <title>Create Internship Mentor</title>
</head>
<body>
    <h1>Create Internship Mentor</h1>
    <form method="POST" action="/curriculum/CreateInternshipMentor">
        <label for="MentorFirstName">First Name:</label>
        <input type="text" id="MentorFirstName" name="MentorFirstName" required><br>

        <label for="MentorLastName">Last Name:</label>
        <input type="text" id="MentorLastName" name="MentorLastName" required><br>

        <label for="MentorEmail">Email:</label>
        <input type="email" id="MentorEmail" name="MentorEmail" required><br>

        <label for="MentorPhone">Phone:</label>
        <input type="text" id="MentorPhone" name="MentorPhone" required><br>

        <label for="CompanyId">Company ID:</label>
        <input type="number" id="CompanyId" name="CompanyId" required><br>

        <button type="submit">Create Mentor</button>
    </form>
</body>
</html>