// HR UI Components
if (typeof window !== 'undefined' && !window.HrUiComponents) {
  class HrUiComponents {
    static renderMainPage() {
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Human Resources Management</h1>
              <p class="text-xl text-gray-600 max-w-3xl mx-auto">Manage instructors, students, and HR processes with our comprehensive management system</p>
            </div>

            <!-- Main Menu Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              
              <!-- Instructors Card -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Instructors</h3>
                  </div>
                  <p class="text-gray-600 mb-6">Manage teaching staff and academic personnel</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/instructors" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View All
                    </a>
                    <a routerLink="hr/instructors/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Students Card -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Students</h3>
                  </div>
                  <p class="text-gray-600 mb-6">Manage student records and academic progress</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/students" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View All
                    </a>
                    <a routerLink="hr/students/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Resignation - Students -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Student Resignation</h3>
                  </div>
                  <p class="text-gray-600 mb-6">Handle student withdrawal and resignation requests</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/resignation/student" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Requests
                    </a>
                  </div>
                </div>
              </div>

              <!-- Resignation - Instructors -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Instructor Resignation</h3>
                  </div>
                  <p class="text-gray-600 mb-6">Handle instructor resignation and exit processes</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/resignation/instructor" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Requests
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Leave Management Card -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Leave Management</h3>
                    <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">ACTIVE</span>
                  </div>
                  <p class="text-gray-600 mb-6">Manage leave requests and vacation tracking</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/leave" class="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                      </svg>
                      Manage Leave
                    </a>
                    <a routerLink="hr/leave/history" class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      View History
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Departments Card -->
              <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900">Departments</h3>
                  </div>
                  <p class="text-gray-600 mb-6">Manage academic departments and budgets</p>
                  <div class="flex flex-col space-y-2">
                    <a routerLink="hr/departments" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View All
                    </a>
                    <a routerLink="hr/departments/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Back to Main Menu -->
            <div class="text-center">
              <a routerLink="" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Main Menu
              </a>
            </div>
          </div>
        </div>
      `;
    }

    static renderInstructorCard(instructor) {
      const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';
      const department = instructor.department || 'Not specified';
      const email = instructor.email || 'No email provided';
      const instructorCode = instructor.instructor_code || 'N/A';
      const startDate = instructor.start_date ? new Date(instructor.start_date).toLocaleDateString() : 'Not specified';
      const salary = instructor.salary ? `฿${instructor.salary.toLocaleString()}` : 'Not specified';

      return `
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg mb-6">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">${fullName}</h3>
                  <p class="text-sm text-gray-600">Code: ${instructorCode}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Active
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span class="font-medium">Department:</span> ${department}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span class="font-medium">Email:</span> ${email}
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="font-medium">Start Date:</span> ${startDate}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="font-medium">Salary:</span> ${salary}
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <button onclick="hrApp.viewInstructor('${instructorCode}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
              <button onclick="hrApp.editInstructor('${instructorCode}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `;
    }

    static renderEmptyState() {
      return `
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Instructors Found</h3>
          <p class="text-gray-600 mb-6">Get started by adding your first instructor to the system.</p>
          <a routerLink="hr/instructors/create" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add First Instructor
          </a>
        </div>
      `;
    }

    static renderLoadingState(title, description) {
      return `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">${title}</h1>
              <p class="text-lg text-gray-600">${description}</p>
            </div>

            <div class="flex justify-between items-center mb-8">
              <div class="flex items-center space-x-4">
                <div class="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span class="text-lg text-gray-600">Loading...</span>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div class="text-center py-16">
                <div class="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p class="text-lg text-gray-600">Loading data...</p>
              </div>
            </div>

            <div class="text-center mt-8">
              <a routerLink="hr" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to HR Menu
              </a>
            </div>
          </div>
        </div>
      `;
    }

    static renderStudentCard(student) {
      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown';
      const program = student.program || 'Not specified';
      const email = student.email || 'No email provided';
      const studentCode = student.student_code || 'N/A';
      const startDate = student.start_date ? new Date(student.start_date).toLocaleDateString() : 'Not specified';
      const year = student.year || 'Not specified';
      const status = student.status || 'Active';

      return `
        <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg mb-6">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">${fullName}</h3>
                  <p class="text-sm text-gray-600">Code: ${studentCode}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  ${status}
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                  </svg>
                  <span class="font-medium">Program:</span> ${program}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span class="font-medium">Email:</span> ${email}
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="font-medium">Start Date:</span> ${startDate}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-medium">Year:</span> ${year}
                </div>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <button onclick="hrApp.viewStudent('${studentCode}')" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
              <button onclick="hrApp.editStudent('${studentCode}')" class="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `;
    }

    static renderEmptyStudentsState() {
      return `
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
          <p class="text-gray-600 mb-6">Get started by adding your first student to the system.</p>
          <a routerLink="hr/students/create" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add First Student
          </a>
        </div>
      `;
    }

    static renderStudentResignationCard(request) {
      const studentCode = request.student_code || 'N/A';
      const reason = request.reason || 'No reason provided';
      const status = request.status || 'Pending';
      const requestedAt = request.requested_at ? new Date(request.requested_at).toLocaleString() : 'Unknown';

      return `
        <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg mb-4 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Student: ${studentCode}</h4>
              <p class="text-sm text-gray-600 mt-1">Reason: ${reason}</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === 'Approved' ? 'bg-green-100 text-green-800' : status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">${status}</span>
          </div>
          <div class="mt-3 text-sm text-gray-500">Requested At: ${requestedAt}</div>
          <div class="mt-4 flex gap-3">
            <a routerLink="hr/resignation/student/${request.id}" class="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">View</a>
          </div>
        </div>
      `;
    }

    static renderEmptyStudentResignationsState() {
      return `
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Student Resignations</h3>
          <p class="text-gray-600">There are currently no student resignation requests.</p>
        </div>
      `;
    }
  }
  
  window.HrUiComponents = HrUiComponents
}
