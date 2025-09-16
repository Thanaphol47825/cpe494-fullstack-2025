<!doctype html>
<html>
<head>
    <title>Internship Attendance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            color: #333;
        }

        form {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #555;
        }

        input[type="date"],
        input[type="time"],
        input[type="text"],
        input[type="number"],
        input[type="email"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }

        input[readonly] {
            background-color: #f0f0f0;
        }

        button {
            display: block;
            width: 100%;
            padding: 10px;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <h1>Internship Attendance</h1>
    <form method="POST" action="/curriculum/CreateInternshipAttendance">
        <label for="Date">Date:</label>
        <input type="date" id="Date" name="Date" required><br>

        <label for="CheckInTime">Check-In Time:</label>
        <input type="time" id="CheckInTime" name="CheckInTime" required><br>

        <label for="CheckOutTime">Check-Out Time:</label>
        <input type="time" id="CheckOutTime" name="CheckOutTime" required><br>

        <label for="CheckInStatus">Check-In Status:</label>
        <input type="text" id="CheckInStatus" name="CheckInStatus" value="Auto-generated" readonly><br>

        <label for="AssingWork">Assigned Work:</label>
        <select id="AssingWork" name="AssingWork">
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
        </select><br>

        <label for="StudentInfoID">Student Info ID:</label>
        <input type="number" id="StudentInfoID" name="StudentInfoID" value="Auto-generated" readonly><br>

        <button type="submit">Check in</button>
    </form>
</body>
</html>