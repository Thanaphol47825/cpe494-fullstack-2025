<!doctype html>
<html>
<head>
  <title>Internship Attendance</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
  <h1 class="text-2xl font-bold text-center text-gray-700 mt-8">Internship Attendance</h1>

  <form method="POST" action="/curriculum/InternshipAttendance/CreateInternshipAttendance"
        class="max-w-xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-md space-y-4">
    
    <div>
      <label for="date" class="block mb-2 font-semibold text-gray-600">Date</label>
      <input type="date" id="date" name="date"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
    </div>

    <div>
      <label for="check_in_time" class="block mb-2 font-semibold text-gray-600">Check-In Time</label>
      <input type="time" id="check_in_time" name="check_in_time"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
    </div>

    <div>
      <label for="check_out_time" class="block mb-2 font-semibold text-gray-600">Check-Out Time</label>
      <input type="time" id="check_out_time" name="check_out_time"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
    </div>

    <div>
      <label for="check_in_status" class="block mb-2 font-semibold text-gray-600">Check-In Status</label>
      <select id="check_in_status" name="check_in_status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
        <option value="true">On Time</option>
        <option value="false">Late</option>
      </select>
    </div>

    <div>
      <label for="assing_work" class="block mb-2 font-semibold text-gray-600">Assigned Work</label>
      <select id="assing_work" name="assing_work"
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
        <option value="none">None</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div>
      <label for="student_info_id" class="block mb-2 font-semibold text-gray-600">Student Info ID</label>
      <input type="number" id="student_info_id" name="student_info_id"
             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
             placeholder="Enter Student ID" required>
    </div>

    <button type="submit"
            class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200">
      Check in
    </button>
  </form>
</body>
</html>
