class InternshipAttendanceCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        console.log("Create Internship Attendance Form");
        console.log(this.application);

        if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            document.head.appendChild(script);
        }

        this.application.mainContainer.innerHTML = `
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Internship Attendance
                </h1>

                <form method="POST" 
                      action="/curriculum/InternshipAttendance/CreateInternshipAttendance"
                      class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
                    
                    <!-- Date -->
                    <div>
                      <label for="date" class="block mb-2 font-semibold text-gray-600">Date</label>
                      <input type="date" id="date" name="date"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md 
                                    focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                    </div>

                    <!-- Check-in time -->
                    <div>
                      <label for="check_in_time" class="block mb-2 font-semibold text-gray-600">Check-In Time</label>
                      <input type="time" id="check_in_time" name="check_in_time"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md 
                                    focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                    </div>

                    <!-- Check-out time -->
                    <div>
                      <label for="check_out_time" class="block mb-2 font-semibold text-gray-600">Check-Out Time</label>
                      <input type="time" id="check_out_time" name="check_out_time"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md 
                                    focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                    </div>

                    <!-- Check-in status -->
                    <div>
                      <label for="check_in_status" class="block mb-2 font-semibold text-gray-600">Check-In Status</label>
                      <select id="check_in_status" name="check_in_status"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white 
                                     focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="true">On Time</option>
                        <option value="false">Late</option>
                      </select>
                    </div>

                    <!-- Assigned work -->
                    <div>
                      <label for="assing_work" class="block mb-2 font-semibold text-gray-600">Assigned Work</label>
                      <select id="assing_work" name="assing_work"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white 
                                     focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="none">None</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <!-- Student Info ID -->
                    <div>
                      <label for="student_info_id" class="block mb-2 font-semibold text-gray-600">Student Info ID</label>
                      <input type="number" id="student_info_id" name="student_info_id"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md 
                                    focus:ring-2 focus:ring-blue-500 focus:outline-none"
                             placeholder="Enter Student ID" required>
                    </div>

                    <!-- Button -->
                    <button type="submit"
                            class="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg 
                                   shadow-md hover:bg-blue-700 transition duration-200">
                      Check in
                    </button>
                </form>
            </div>
        `;
    }
}
