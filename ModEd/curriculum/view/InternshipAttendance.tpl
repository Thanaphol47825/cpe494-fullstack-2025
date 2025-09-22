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
    <form method="POST" action="/curriculum/InternshipAttendance/CreateInternshipAttendance">
        <label for="date">Date:</label>
        <input type="date" id="date" name="date" required><br>

        <label for="check_in_time">Check-In Time:</label>
        <input type="time" id="check_in_time" name="check_in_time" required><br>

        <label for="check_out_time">Check-Out Time:</label>
        <input type="time" id="check_out_time" name="check_out_time" required><br>

        <label for="check_in_status">Check-In Status:</label>
        <select id="check_in_status" name="check_in_status">
            <option value="true">On Time</option>
            <option value="false">Late</option>
        </select><br>

        <label for="assing_work">Assigned Work:</label>
        <select id="assing_work" name="assing_work">
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
        </select><br>

        <label for="student_info_id">Student Info ID:</label>
        <input type="number" id="student_info_id" name="student_info_id" placeholder="Enter Student Info ID" required><br>

        <button type="submit">Check in</button>
    </form>

</body>
</html>