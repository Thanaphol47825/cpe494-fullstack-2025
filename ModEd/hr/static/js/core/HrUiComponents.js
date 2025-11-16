// HR UI Components - Refactored to use Template Registry
if (typeof window !== 'undefined' && !window.HrUiComponents) {
  class HrUiComponents {
  static renderMainPage() {
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          <!-- Background Ornaments -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-10 -left-10 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20"></div>
            <div class="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20"></div>
          </div>

          <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h1 class="text-5xl font-extrabold text-slate-900 mb-3">
                <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Human Resources
                </span>
              </h1>
              <p class="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Manage instructors, students, departments, resignations, and leave requests in a single, modern HR workspace.
              </p>
            </div>

            <!-- Main Menu Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

              <!-- Instructors Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Instructors</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Manage teaching staff and academic personnel</p>
                  <div class="space-y-3">
                    <a routerLink="hr/instructors" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Browse Instructors
                    </a>
                    <a routerLink="hr/instructors/create" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create New
                    </a>
                  </div>
                </div>
              </div>

              <!-- Students Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Students</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Manage student records and academic progress</p>
                  <div class="space-y-3">
                    <a routerLink="hr/students" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Browse Students
                    </a>
                    <a routerLink="hr/students/create" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create New
                    </a>
                  </div>
                </div>
              </div>

              <!-- Student Resignation Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-amber-500 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Student Resignation</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Handle student withdrawal and resignation requests</p>
                  <div class="space-y-3">
                    <a routerLink="hr/resignation/student" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Requests
                    </a>
                  </div>
                </div>
              </div>

              <!-- Instructor Resignation Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-rose-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-rose-500 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Instructor Resignation</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Handle instructor resignation and exit processes</p>
                  <div class="space-y-3">
                    <a routerLink="hr/resignation/instructor" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Requests
                    </a>
                  </div>
                </div>
              </div>

              <!-- Leave Management Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Leave Management</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Manage leave requests and vacation tracking</p>
                  <div class="space-y-3">
                    <a routerLink="hr/leave" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                      </svg>
                      Manage Leave
                    </a>
                    <a routerLink="hr/leave/history" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      View History
                    </a>
                  </div>
                </div>
              </div>

              <!-- Departments Card -->
              <div class="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-sky-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500 to-blue-600 opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="relative z-10 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-5 shadow-lg group-hover:rotate-3 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                  </svg>
                </div>
                <div class="relative z-10">
                  <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">Departments</h3>
                  <p class="text-slate-600 mb-5 text-sm leading-relaxed">Manage academic departments and budgets</p>
                  <div class="space-y-3">
                    <a routerLink="hr/departments" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Browse Departments
                    </a>
                    <a routerLink="hr/departments/create" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create New
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Back to Main Menu -->
            <div class="text-center">
              <a routerLink="" class="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:bg-white focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 shadow-md hover:shadow-lg">
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

    // ========================================
    // Card Renderers (Using Templates)
    // ========================================

    static renderInstructorCard(instructor) {
      return HrTemplates.render('instructorCard', {
        fullName: HrTemplates.getFullName(instructor.first_name, instructor.last_name),
        instructorCode: instructor.instructor_code || 'N/A',
        department: instructor.department || 'Not specified',
        email: instructor.email || 'No email provided',
        startDate: HrTemplates.formatDate(instructor.start_date),
        salary: HrTemplates.formatCurrency(instructor.salary)
      });
    }

    static renderStudentCard(student) {
      const status = student.status || 'Active';
      return HrTemplates.render('studentCard', {
        fullName: HrTemplates.getFullName(student.first_name, student.last_name),
        studentCode: student.student_code || 'N/A',
        program: student.program || 'Not specified',
        email: student.email || 'No email provided',
        startDate: HrTemplates.formatDate(student.start_date),
        year: student.year || 'Not specified',
        status: status,
        statusClass: status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      });
    }

    static renderEmptyState() {
      return HrTemplates.render('emptyState', {
        icon: HrTemplates.iconPaths.instructor,
        title: 'No Instructors Found',
        message: 'Get started by adding your first instructor to the system.',
        hasAction: true,
        actionLink: 'hr/instructors/create',
        actionLabel: 'Add First Instructor'
      });
    }

    static renderEmptyStudentsState() {
      return HrTemplates.render('emptyState', {
        icon: HrTemplates.iconPaths.student,
        title: 'No Students Found',
        message: 'Get started by adding your first student to the system.',
        hasAction: true,
        actionLink: 'hr/students/create',
        actionLabel: 'Add First Student'
      });
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

    static renderStudentResignationCard(request) {
      return HrTemplates.render('studentResignationCard', {
        studentCode: request.student_code || 'N/A',
        reason: request.reason || 'No reason provided',
        status: request.status || 'Pending',
        statusClass: HrTemplates.getStatusClass(request.status),
        requestedAt: request.requested_at ? new Date(request.requested_at).toLocaleString() : 'Unknown',
        id: request.id
      });
    }

    static renderEmptyStudentResignationsState() {
      return HrTemplates.render('emptyState', {
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        title: 'No Student Resignations',
        message: 'There are currently no student resignation requests.',
        hasAction: false
      });
    }

    static renderInstructorResignationCard(request) {
      const status = request.Status || 'Pending';
      return HrTemplates.render('instructorResignationCard', {
        instructorCode: request.InstructorCode || 'N/A',
        reason: request.Reason || 'No reason provided',
        status: status,
        statusClass: HrTemplates.getStatusClass(status),
        requestedAt: request.CreatedAt ? new Date(request.CreatedAt).toLocaleString() : 'Unknown',
        id: request.ID || request.id,
        isPending: status === 'Pending'
      });
    }

    static renderEmptyInstructorResignationsState() {
      return HrTemplates.render('emptyState', {
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        title: 'No Instructor Resignations',
        message: 'There are currently no instructor resignation requests.',
        hasAction: false
      });
    }

    // ========================================
    // Leave Management Helpers
    // ========================================

    static renderStudentLeaveListPage(requests = []) {
      const parsedRequests = (requests || []).map((request) => {
        const idValue = request.ID ?? request.id ?? request.Id ?? null;
        const id = idValue !== null && idValue !== undefined ? String(idValue) : '';
        const studentCode = request.student_code || request.StudentCode || request.studentCode || 'N/A';
        const leaveType = request.leave_type || request.LeaveType || 'N/A';
        const leaveDateRaw = request.leave_date || request.LeaveDate || request.leaveDate || '';
        const status = request.Status || request.status || 'Pending';

        const baseActionClasses = 'inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200';
        const actions = [
          {
            isLink: true,
            route: `hr/leave/student/edit/${id}`,
            label: 'Edit',
            className: `${baseActionClasses} bg-yellow-50 text-yellow-700 hover:bg-yellow-100`,
            id
          },
          {
            isButton: true,
            action: 'delete',
            actionType: 'delete',
            label: 'Delete',
            className: `${baseActionClasses} js-delete-btn bg-red-50 text-red-700 hover:bg-red-100`,
            id
          }
        ];

        if (status === 'Pending') {
          actions.unshift({
            isButton: true,
            action: 'reject',
            actionType: 'review',
            label: 'Reject',
            className: `${baseActionClasses} review-btn js-review-btn bg-rose-50 text-rose-700 hover:bg-rose-100`,
            id
          });
          actions.unshift({
            isButton: true,
            action: 'approve',
            actionType: 'review',
            label: 'Approve',
            className: `${baseActionClasses} review-btn js-review-btn bg-blue-50 text-blue-700 hover:bg-blue-100`,
            id
          });
        }

        return {
          id,
          personLabel: studentCode,
          leaveType,
          leaveDate: HrTemplates.formatDate(leaveDateRaw),
          status,
          statusClass: HrTemplates.getStatusClass(status),
          actions
        };
      });

      const data = {
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        gradientFrom: 'blue-600',
        gradientTo: 'indigo-600',
        title: 'Student Leave Requests',
        description: 'View and manage student leave requests',
        icon: HrTemplates.iconPaths.student,
        actions: [
          {
            route: 'hr/leave/student/create',
            label: 'New Leave Request',
            className: 'inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200',
            icon: HrTemplates.iconPaths.add
          }
        ],
        showRefresh: true,
        refreshId: 'refreshBtn',
        refreshClass: 'inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200',
        refreshLabel: 'Refresh',
        hasRequests: parsedRequests.length > 0,
        requests: parsedRequests,
        columns: [
          { label: 'ID' },
          { label: 'Student' },
          { label: 'Leave Type' },
          { label: 'Leave Date' },
          { label: 'Status' },
          { label: 'Actions' }
        ],
        emptyTitle: 'No Leave Requests Yet',
        emptyMessage: 'There are no student leave requests to display.',
        emptyActionRoute: 'hr/leave/student/create',
        emptyActionLabel: 'Create First Request',
        backRoute: 'hr/leave',
        modalId: 'reviewModal',
        modalTitle: 'Review Leave Request',
        modalMessageId: 'reviewModalMessage',
        modalMessage: 'Are you sure you want to review this leave request?',
        reasonFieldId: 'reviewReason',
        reasonPlaceholder: 'Optional: add a reason for your decision...',
        confirmButtonId: 'confirmReview',
        confirmLabel: 'Confirm',
        cancelButtonId: 'cancelReview',
        cancelLabel: 'Cancel'
      };

      return HrTemplates.render('leaveListPage', data);
    }

    static renderStudentLeaveForm(options = {}) {
      const { students = [], initialData = {} } = options;
      const selectedStudent = initialData.student_code || initialData.StudentCode || options.selectedStudent || '';
      const selectedLeaveType = initialData.leave_type || initialData.LeaveType || options.selectedLeaveType || '';

      const mappedStudents = students.map((student) => {
        const code = student.student_code || student.StudentCode || student.code;
        const firstName = student.first_name || student.firstName || '';
        const lastName = student.last_name || student.lastName || '';
        return {
          value: code,
          label: `${code} - ${firstName} ${lastName}`.trim(),
          selected: code === selectedStudent
        };
      });

      const leaveTypes = ['Sick', 'Vacation', 'Personal', 'Maternity', 'Other'].map((type) => ({
        value: type,
        label: type,
        selected: type === selectedLeaveType
      }));

      const data = {
        formId: options.formId || 'studentLeaveForm',
        students: mappedStudents,
        leaveTypes,
        leaveDate: HrUiComponents.formatDateForInput(initialData.leave_date || initialData.LeaveDate || ''),
        reason: (initialData.reason || initialData.Reason || '').trim(),
        statusContainerId: options.statusContainerId || 'formStatus',
        submitLabel: options.submitLabel || (initialData && initialData.ID ? 'Update Leave Request' : 'Submit Leave Request'),
        cancelLabel: options.cancelLabel || 'Cancel',
        cancelRoute: options.cancelRoute || 'hr/leave/student',
        showDelete: options.showDelete || false,
        deleteButtonId: options.deleteButtonId || 'deleteRequestBtn',
        deleteLabel: options.deleteLabel || 'Delete Request'
      };

      return HrTemplates.render('studentLeaveForm', data);
    }

    static renderInstructorLeaveForm(options = {}) {
      const { instructors = [], initialData = {} } = options;
      const selectedInstructor = initialData.InstructorCode || initialData.instructor_code || options.selectedInstructor || '';
      const selectedLeaveType = initialData.LeaveType || initialData.leave_type || options.selectedLeaveType || '';

      const mappedInstructors = instructors.map((instructor) => {
        const code = instructor.instructor_code || instructor.InstructorCode || instructor.code;
        const firstName = instructor.first_name || instructor.FirstName || '';
        const lastName = instructor.last_name || instructor.LastName || '';
        return {
          value: code,
          label: `${code} - ${firstName} ${lastName}`.trim(),
          selected: code === selectedInstructor
        };
      });

      const leaveTypes = ['Sick', 'Vacation', 'Personal', 'Maternity', 'Other'].map((type) => ({
        value: type,
        label: type,
        selected: type === selectedLeaveType
      }));

      const data = {
        formId: options.formId || 'instructorLeaveForm',
        instructors: mappedInstructors,
        leaveTypes,
        leaveDate: HrUiComponents.formatDateForInput(initialData.DateStr || initialData.leave_date || initialData.LeaveDate || ''),
        reason: (initialData.Reason || initialData.reason || '').trim(),
        statusContainerId: options.statusContainerId || 'formStatus',
        submitLabel: options.submitLabel || 'Submit Leave Request',
        cancelLabel: options.cancelLabel || 'Cancel',
        cancelRoute: options.cancelRoute || 'hr/leave/instructor',
        showDelete: options.showDelete || false,
        deleteButtonId: options.deleteButtonId || 'deleteInstructorLeaveBtn',
        deleteLabel: options.deleteLabel || 'Delete Request',
        disableInstructor: options.disableInstructor || false,
        disableDate: options.disableDate || false
      };

      return HrTemplates.render('instructorLeaveForm', data);
    }

    static renderInstructorLeaveListPage(requests = []) {
      const parsedRequests = (requests || []).map((request) => {
        const idValue = request.ID ?? request.id ?? request.Id ?? null;
        const id = idValue !== null && idValue !== undefined ? String(idValue) : '';
        const instructorCode = request.InstructorCode || request.instructor_code || 'N/A';
        const leaveType = request.LeaveType || request.leave_type || 'N/A';
        const leaveDateRaw = request.LeaveDate || request.leave_date || '';
        const status = request.Status || request.status || 'Pending';

        const actions = [
          {
            isLink: true,
            route: `hr/leave/instructor/edit/${id}`,
            label: 'Edit',
            className: 'inline-flex items-center px-3 py-1.5 text-sm rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
            id
          },
          {
            isButton: true,
            action: 'delete',
            actionType: 'delete',
            label: 'Delete',
            className: 'inline-flex items-center px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-700 hover:bg-red-100 js-delete-btn',
            id
          }
        ];
        if (status === 'Pending') {
          const baseActionClasses = 'inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 review-btn';
          actions.push({
            isButton: true,
            action: 'approve',
            actionType: 'review',
            label: 'Approve',
            className: `${baseActionClasses} bg-blue-50 text-blue-700 hover:bg-blue-100`,
            id
          });
          actions.push({
            isButton: true,
            action: 'reject',
            actionType: 'review',
            label: 'Reject',
            className: `${baseActionClasses} bg-rose-50 text-rose-700 hover:bg-rose-100`,
            id
          });
        }

        return {
          id,
          personLabel: instructorCode,
          leaveType,
          leaveDate: HrTemplates.formatDate(leaveDateRaw),
          status,
          statusClass: HrTemplates.getStatusClass(status),
          actions
        };
      });

      const data = {
        bgGradient: 'from-slate-50 via-blue-50 to-indigo-100',
        gradientFrom: 'purple-600',
        gradientTo: 'indigo-600',
        title: 'Instructor Leave Requests',
        description: 'View and manage instructor leave requests',
        icon: HrTemplates.iconPaths.instructor,
        actions: [
          {
            route: 'hr/leave/instructor/create',
            label: 'New Leave Request',
            className: 'inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200',
            icon: HrTemplates.iconPaths.add
          }
        ],
        showRefresh: true,
        refreshId: 'refreshBtn',
        refreshClass: 'inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200',
        refreshLabel: 'Refresh',
        hasRequests: parsedRequests.length > 0,
        requests: parsedRequests,
        columns: [
          { label: 'ID' },
          { label: 'Instructor' },
          { label: 'Leave Type' },
          { label: 'Leave Date' },
          { label: 'Status' },
          { label: 'Actions' }
        ],
        emptyTitle: 'No Leave Requests Yet',
        emptyMessage: 'There are no instructor leave requests to display.',
        emptyActionRoute: 'hr/leave/instructor/create',
        emptyActionLabel: 'Create First Request',
        backRoute: 'hr/leave',
        modalId: 'reviewModal',
        modalTitle: 'Review Leave Request',
        modalMessageId: 'reviewModalMessage',
        modalMessage: 'Are you sure you want to review this leave request?',
        reasonFieldId: 'reviewReason',
        reasonPlaceholder: 'Optional: add a reason for your decision...',
        confirmButtonId: 'confirmReview',
        confirmLabel: 'Confirm',
        cancelButtonId: 'cancelReview',
        cancelLabel: 'Cancel'
      };

      return HrTemplates.render('leaveListPage', data);
    }

    static formatDateForInput(dateValue) {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // ========================================
    // Shared Form Page Utilities (V2 + Templates)
    // ========================================

    /**
     * Create a form page wrapper with consistent styling using templates
     */
    static createFormPageWrapper(options = {}) {
      const html = HrTemplates.render('formPageLayout', {
        bgGradient: options.bgGradient || 'from-blue-50 via-indigo-50 to-purple-50',
        gradientFrom: options.gradientFrom || 'blue-600',
        gradientTo: options.gradientTo || 'purple-600',
        title: options.title || 'Form',
        description: options.description || 'Fill in the form below',
        icon: options.icon || HrTemplates.iconPaths.add,
        formTitle: options.formTitle || 'Information',
        containerClass: (options.containerSelector || '.form-container').replace('.', ''),
        backLink: options.backLink || 'hr',
        backLabel: options.backLabel || 'Back to HR Menu'
      });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.firstElementChild;
    }

    /**
     * Create an edit form page wrapper using templates
     */
    static createEditFormPageWrapper(options = {}) {
      const html = HrTemplates.render('editFormPageLayout', {
        bgGradient: options.bgGradient || 'from-blue-50 via-indigo-50 to-purple-50',
        gradientFrom: options.gradientFrom || 'blue-600',
        gradientTo: options.gradientTo || 'purple-600',
        title: options.title || 'Edit Record',
        description: options.description || 'Update the record information',
        icon: options.icon || HrTemplates.iconPaths.edit,
        formTitle: options.formTitle || 'Information',
        containerClass: (options.containerSelector || '.form-container').replace('.', ''),
        backLink: options.backLink || 'hr',
        backLabel: options.backLabel || 'Back to List'
      });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.firstElementChild;
    }

    /**
     * Show success result in form result box using templates
     */
    static showFormSuccess(message, data = null) {
      const resultBox = document.getElementById('formResultBox');
      const resultHeader = document.getElementById('formResultHeader');
      const resultIcon = document.getElementById('formResultIcon');
      const resultTitle = document.getElementById('formResultTitle');
      const resultContent = document.getElementById('formResultContent');

      if (!resultBox) return;

      resultBox.classList.remove('hidden');
      resultHeader.className = 'px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200';

      resultIcon.innerHTML = `
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrTemplates.iconPaths.success}
        </svg>
      `;
      resultTitle.textContent = 'Success!';

      // Use template for success message
      resultContent.innerHTML = HrTemplates.render('successMessage', {
        message,
        hasData: !!data,
        dataJson: data ? JSON.stringify(data, null, 2) : ''
      });
    }

    /**
     * Show error result in form result box using templates
     */
    static showFormError(message, error = null) {
      const resultBox = document.getElementById('formResultBox');
      const resultHeader = document.getElementById('formResultHeader');
      const resultIcon = document.getElementById('formResultIcon');
      const resultTitle = document.getElementById('formResultTitle');
      const resultContent = document.getElementById('formResultContent');

      if (!resultBox) return;

      resultBox.classList.remove('hidden');
      resultHeader.className = 'px-6 py-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200';

      resultIcon.innerHTML = `
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${HrTemplates.iconPaths.error}
        </svg>
      `;
      resultTitle.textContent = 'Error';

      // Use template for error message
      const errorMessage = error?.message || error || message;
      resultContent.innerHTML = HrTemplates.render('errorMessage', {
        message: errorMessage
      });
    }

    /**
     * Hide form result box
     */
    static hideFormResult() {
      const resultBox = document.getElementById('formResultBox');
      if (resultBox) {
        resultBox.classList.add('hidden');
      }
    }

    /**
     * Show loading state for data fetching using templates
     */
    static showLoadingState(title = 'Loading...', message = 'Please wait while we load the data.', gradientFrom = 'blue-600', gradientTo = 'purple-600', bgGradient = 'from-blue-50 via-indigo-50 to-purple-50') {
      return HrTemplates.render('loadingStatePage', {
        title,
        message,
        gradientFrom,
        gradientTo,
        bgGradient
      });
    }

    // ========================================
    // Shared Tailwind CSS Classes as constants
    // ========================================

    static get buttonClasses() {
      return {
        primary: 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1',
        success: 'inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1',
        secondary: 'inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg',
        danger: 'inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300',
        small: 'inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200'
      };
    }

    static get iconPaths() {
      // Delegate to HrTemplates for icon paths
      return HrTemplates ? HrTemplates.iconPaths : {
        instructor: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
        student: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>',
        add: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>',
        edit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>',
        save: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
        cancel: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
        reset: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>',
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
        loading: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>'
      };
    }
  }

  window.HrUiComponents = HrUiComponents;
}
