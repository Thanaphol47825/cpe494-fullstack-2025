<!-- Verification Form Template -->
<div id="verification-form-container">
  <div class="max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Enter Your Student Code</h2>
      <form id="verification-form" class="space-y-4">
        <div>
          <label for="student_code" class="block text-sm font-medium text-gray-700 mb-2">
            Student Code <span class="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id="student_code" 
            name="student_code" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter your student code (e.g., 65070501000)"
            required
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Verify
        </button>
      </form>
    </div>
  </div>
</div>

<!-- Attendance Panel Template -->
<div id="attendance-panel-container" class="hidden">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Student Info Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center space-x-4 mb-4">
        <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
          <span id="student-avatar" class="text-2xl font-bold text-blue-600">S</span>
        </div>
        <div>
          <h2 id="student-name" class="text-2xl font-semibold text-gray-800">Student Name</h2>
          <p id="student-code" class="text-gray-600">Student Code: N/A</p>
        </div>
      </div>
      <div class="border-t pt-4">
        <p class="text-sm text-gray-600">Date: <span id="current-date" class="font-medium"></span></p>
      </div>
    </div>

    <!-- Attendance Status Card -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
      <div class="space-y-4">
        <!-- Check-In Status -->
        <div id="checkin-section" class="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-medium text-gray-600">Check-In</p>
              <p id="checkin-time" class="text-sm text-gray-500">Not checked in</p>
            </div>
          </div>
          <button id="checkin-btn" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-medium">
            Check In
          </button>
        </div>

        <!-- Check-Out Status -->
        <div id="checkout-section" class="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-medium text-gray-600">Check-Out</p>
              <p id="checkout-time" class="text-sm text-gray-500">Not checked out</p>
            </div>
          </div>
          <span id="checkout-btn-container" class="text-gray-400 text-sm">Check in first</span>
        </div>
      </div>
    </div>

    <!-- View All Records Button -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <button id="view-all-records-btn" class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition font-medium flex items-center justify-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <span>📊 View All Your Attendance Records</span>
      </button>
    </div>

    <!-- All Records Table (Hidden by default) -->
    <div id="all-records-container" class="hidden bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Your Attendance History</h3>
        <button id="hide-records-btn" class="text-gray-600 hover:text-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div id="records-loading" class="text-center py-4">
        <p class="text-gray-600">Loading records...</p>
      </div>
      
      <div id="records-error" class="hidden text-center py-4">
        <p class="text-red-600" id="records-error-message"></p>
      </div>

      <div id="records-table-container" class="hidden overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody id="records-tbody" class="bg-white divide-y divide-gray-200">
          </tbody>
        </table>
      </div>

      <div id="records-empty" class="hidden text-center py-8">
        <p class="text-gray-600">No attendance records found</p>
      </div>
    </div>

    <!-- Change Student Button -->
    <div class="text-center">
      <button id="change-student-btn" class="text-blue-600 hover:text-blue-800 text-sm font-medium">← Change Student</button>
    </div>
  </div>
</div>