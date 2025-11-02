// Load HR Core Modules
if (typeof window !== 'undefined') {
  // Load templates first (required by UI components)
  if (!window.HrTemplates) {
    const templatesScript = document.createElement('script');
    templatesScript.src = '/hr/static/js/core/HrTemplates.js';
    document.head.appendChild(templatesScript);
  }
  
  // Load error handler
  if (!window.HrErrorHandler) {
    const errorScript = document.createElement('script');
    errorScript.src = '/hr/static/js/core/HrErrorHandler.js';
    document.head.appendChild(errorScript);
  }
  
  // Load validator
  if (!window.HrValidator) {
    const validatorScript = document.createElement('script');
    validatorScript.src = '/hr/static/js/core/HrValidator.js';
    document.head.appendChild(validatorScript);
  }
  
  // Load API service
  if (!window.HrApiService) {
    const apiScript = document.createElement('script');
    apiScript.src = '/hr/static/js/core/HrApiService.js';
    document.head.appendChild(apiScript);
  }
  
  // Load DOM helpers
  if (!window.HrDOMHelpers) {
    const domScript = document.createElement('script');
    domScript.src = '/hr/static/js/core/HrDOMHelpers.js';
    document.head.appendChild(domScript);
  }
  
  // Load UI components
  if (!window.HrUiComponents) {
    const uiScript = document.createElement('script');
    uiScript.src = '/hr/static/js/core/HrUiComponents.js';
    document.head.appendChild(uiScript);
  }
  
}

// Prevent duplicate declaration
if (typeof window !== 'undefined' && window.HrApplication) {
  // Skip re-declaration silently
} else if (typeof window !== 'undefined' && window.hrApp) {
  // Skip if instance already exists
} else {
class HrApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine)
    
    // Prevent duplicate initialization
    if (this.isInitialized) {
      return;
    }
    
    // Initialize HR-specific properties
    this.moduleName = 'hr'
    this.moduleVersion = '1.0.0'
    this.isInitialized = false
    this.rootURL = window.__ROOT_URL__ || ""
    
    // Make this instance globally accessible for onclick handlers
    if (window.hrApp) {
      return window.hrApp;
    }
    window.hrApp = this
    
    // Set the base path for sub-modules
    this.setSubModuleBasePath('/hr/static/js/components')
    
    // Initialize services
    this.apiService = new HrApiService(this.rootURL)
    this.errorHandler = new HrErrorHandler()
    
    // Initialize logger
    this.logger = {
      info: (msg) => console.log(`[HR] ${msg}`),
      error: (msg) => console.error(`[HR] ${msg}`),
      warn: (msg) => console.warn(`[HR] ${msg}`),
      debug: (msg) => console.log(`[HR DEBUG] ${msg}`)
    }
    
    // Setup routes and navigation
    this.setupRoutes()
    this.setupErrorHandling()
    
    this.isInitialized = true
    this.logger.info(`HrApplication v${this.moduleVersion} initialized`)
  }

  async ensureTemplatesLoaded() {
    // Wait for HrTemplates to be loaded
    let retries = 0;
    while (!window.HrTemplates && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      retries++;
    }

    if (!window.HrTemplates || !this.#hasRequiredTemplates(window.HrTemplates)) {
      await this.loadScript('/hr/static/js/core/HrTemplates.js?v=' + Date.now());
    }

    if (!window.HrTemplates || !this.#hasRequiredTemplates(window.HrTemplates)) {
      throw new Error('HrTemplates failed to load required templates');
    }
  }

  async ensureUiComponentsLoaded() {
    let retries = 0
    while (!window.HrUiComponents && retries < 40) {
      await new Promise(resolve => setTimeout(resolve, 50))
      retries++
    }

    if (window.HrUiComponents && this.#hasRequiredUiComponents(window.HrUiComponents)) {
      return
    }

    await this.loadScript('/hr/static/js/core/HrUiComponents.js?v=' + Date.now())

    if (!window.HrUiComponents || !this.#hasRequiredUiComponents(window.HrUiComponents)) {
      throw new Error('HrUiComponents failed to load')
    }
  }

  #hasRequiredTemplates(templates) {
    if (!templates) {
      return false
    }

    if (typeof templates.has === 'function') {
      return templates.has('leaveListPage') && templates.has('loadingStatePage')
    }

    return typeof templates.render === 'function'
  }

  #hasRequiredUiComponents(components) {
    if (!components) {
      return false
    }

    return typeof components.renderStudentLeaveListPage === 'function' &&
      typeof components.showLoadingState === 'function'
  }

  async loadFeatureModules() {
    try {
      // Ensure templates are loaded first
      await this.ensureTemplatesLoaded();
      await this.ensureUiComponentsLoaded();
      
      // Check if already loading to prevent duplicate loading
      if (this._loadingFeatures) {
        return
      }
      
      // Check if features are already loaded
      if (window.HrStudentFormFeature && window.HrInstructorFormFeature && 
          window.HrStudentResignationFormFeature && window.HrStudentResignationListFeature &&
          window.HrInstructorResignationFormFeature && window.HrInstructorResignationListFeature &&
          window.HrStudentListFeature && window.HrInstructorListFeature &&
          window.HrStudentEditFeature && window.HrInstructorEditFeature &&
          window.HrStudentLeaveFormFeature && window.HrInstructorLeaveFormFeature &&
          window.HrStudentLeaveListFeature && window.HrInstructorLeaveListFeature &&
          window.HrStudentLeaveEditFeature && window.HrInstructorLeaveEditFeature &&
          window.HrLeaveHistoryFeature) {
        return
      }
      
      this._loadingFeatures = true
      
      // Load StudentForm feature
      if (!window.HrStudentFormFeature) {
        await this.loadScript('/hr/static/js/features/students/StudentForm.js?v=' + Date.now())
      }
      
      // Load InstructorForm feature
      if (!window.HrInstructorFormFeature) {
        await this.loadScript('/hr/static/js/features/instructors/InstructorForm.js?v=' + Date.now())
      }
      
      // Load StudentResignationForm feature
      if (!window.HrStudentResignationFormFeature) {
        await this.loadScript('/hr/static/js/features/resignations/StudentResignationForm.js?v=' + Date.now())
      }
      
      // Load StudentResignationList feature
      if (!window.HrStudentResignationListFeature) {
        await this.loadScript('/hr/static/js/features/resignations/StudentResignationList.js?v=' + Date.now())
      }
      
      // Load InstructorResignationForm feature
      if (!window.HrInstructorResignationFormFeature) {
        await this.loadScript('/hr/static/js/features/resignations/InstructorResignationForm.js?v=' + Date.now())
      }
      
      // Load InstructorResignationList feature
      if (!window.HrInstructorResignationListFeature) {
        await this.loadScript('/hr/static/js/features/resignations/InstructorResignationList.js?v=' + Date.now())
      }
      
      // Load StudentList feature
      if (!window.HrStudentListFeature) {
        await this.loadScript('/hr/static/js/features/students/StudentList.js?v=' + Date.now())
      }
      
      // Load InstructorList feature
      if (!window.HrInstructorListFeature) {
        await this.loadScript('/hr/static/js/features/instructors/InstructorList.js?v=' + Date.now())
      }
      
      // Load StudentEdit feature
      if (!window.HrStudentEditFeature) {
        await this.loadScript('/hr/static/js/features/students/StudentEdit.js?v=' + Date.now())
      }
      
      // Load InstructorEdit feature
      if (!window.HrInstructorEditFeature) {
        await this.loadScript('/hr/static/js/features/instructors/InstructorEdit.js?v=' + Date.now())
      }
      
      // Load Leave Management features
      if (!window.HrStudentLeaveFormFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/StudentLeaveForm.js?v=' + Date.now())
      }
      
      if (!window.HrInstructorLeaveFormFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/InstructorLeaveForm.js?v=' + Date.now())
      }
      
      if (!window.HrStudentLeaveListFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/StudentLeaveList.js?v=' + Date.now())
      }
      
      if (!window.HrStudentLeaveEditFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/StudentLeaveEdit.js?v=' + Date.now())
      }
      
      if (!window.HrInstructorLeaveListFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/InstructorLeaveList.js?v=' + Date.now())
      }
      
      if (!window.HrInstructorLeaveEditFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/InstructorLeaveEdit.js?v=' + Date.now())
      }

      if (!window.HrLeaveHistoryFeature) {
        await this.loadScript('/hr/static/js/features/leaveManagement/LeaveHistory.js?v=' + Date.now())
      }
      
      this._loadingFeatures = false
    } catch (error) {
      this._loadingFeatures = false
      this.errorHandler.logError(error, { context: 'loadFeatureModules' })
    }
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = this.rootURL + src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  setupRoutes() {
    // Register HR sub-routes with sub-module loading
    this.addRoute('', this.renderMainPage.bind(this))
    this.addRoute('/instructors', this.renderInstructors.bind(this))
    this.addRoute('/instructors/create', this.renderCreateInstructor.bind(this))
    this.addRoute('/instructors/edit/:code', this.renderEditInstructor.bind(this))
    
    // Students routes with StudentManager sub-module
    this.addRouteWithSubModule('/students', this.renderStudents.bind(this), 'StudentManager.js')
    this.addRoute('/students/create', this.renderCreateStudent.bind(this))
    this.addRoute('/students/edit/:code', this.renderEditStudent.bind(this))
    this.addRoute('/students/:id', this.renderStudentDetail.bind(this))
    
    this.addRoute('/resignation', this.renderResignation.bind(this))
    this.addRoute('/resignation/student', this.renderStudentResignation.bind(this))
    this.addRoute('/resignation/student/create', this.renderCreateStudentResignation.bind(this))
    this.addRoute('/resignation/instructor', this.renderInstructorResignation.bind(this))
    this.addRoute('/resignation/instructor/create', this.renderCreateInstructorResignation.bind(this))
    
    // Leave Management routes
    this.addRoute('/leave', this.renderLeaveMain.bind(this))
    this.addRoute('/leave/student', this.renderStudentLeaveList.bind(this))
    this.addRoute('/leave/student/create', this.renderCreateStudentLeave.bind(this))
    this.addRoute('/leave/student/edit/:id', this.renderEditStudentLeave.bind(this))
    this.addRoute('/leave/instructor', this.renderInstructorLeaveList.bind(this))
    this.addRoute('/leave/instructor/create', this.renderCreateInstructorLeave.bind(this))
    this.addRoute('/leave/instructor/edit/:id', this.renderEditInstructorLeave.bind(this))
    this.addRoute('/leave/history', this.renderLeaveHistory.bind(this))

    // Department routes
    this.addRoute('/departments', this.renderDepartments.bind(this))
    this.addRoute('/departments/create', this.renderCreateDepartment.bind(this))
    this.addRoute('/departments/edit/:name', this.renderEditDepartment.bind(this))
    
    this.setDefaultRoute('')
    
    // Override routerLink behavior for HR module
    this.setupCustomNavigation()
  }

    
  setupCustomNavigation() {
    try {
      // Use core's hash-based navigation
      document.addEventListener('click', (e) => {
        try {
          const target = e.target.closest('[routerLink]')
          
          if (target && target.closest('#MainContainer')) {
            e.preventDefault()
            const route = target.getAttribute('routerLink')
            // Use core's RouterLinks navigation
            this.templateEngine.routerLinks.navigateTo(route)
          }
        } catch (error) {
          this.errorHandler.logError(error, { context: 'navigation_click_handler' })
        }
      })
    } catch (error) {
      this.errorHandler.logError(error, { context: 'setup_custom_navigation' })
    }
  }

  setupErrorHandling() {
    // Global error handler for HR module
    window.addEventListener('error', (event) => {
      this.errorHandler.logError(event.error, { 
        context: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.errorHandler.logError(event.reason, { 
        context: 'unhandled_promise_rejection',
        promise: event.promise
      })
    })
  }

  navigateToFullURL(route) {
    if (!route || route === '') {
      // Use SPA navigation instead of full page reload
      this.renderMainPage()
      return
    }

    // For other routes, use full URL navigation
    const cleanRoute = route.startsWith('/') ? route : `/${route}`
    window.location.href = cleanRoute
  }

  async renderMainPage() {
    this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderMainPage()
  }

  async renderInstructors() {
    try {
      // Load the InstructorList feature
      await this.loadFeatureModules();
      
      if (window.HrInstructorListFeature) {
        const listFeature = new window.HrInstructorListFeature(this.templateEngine, this.rootURL);
        await listFeature.render();
        
        // Make it globally accessible for onclick handlers
        window.instructorList = listFeature;
      } else {
        throw new Error('InstructorListFeature not available');
      }
    } catch (error) {
      console.error('Error loading instructors:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Instructors',
        message: error.message,
        hasRetry: true,
        retryAction: 'hrApp.renderInstructors()',
        backLink: 'hr',
        backLabel: 'Back to HR Menu'
      });
    }
  }

  renderInstructorsList(instructors) {
    const instructorsHTML = instructors.length > 0 
      ? instructors.map(instructor => HrUiComponents.renderInstructorCard(instructor)).join('')
      : HrUiComponents.renderEmptyState();

    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
        </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Management</h1>
            <p class="text-lg text-gray-600">Manage teaching staff and academic personnel</p>
      </div>

          <!-- Action Bar -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-lg text-gray-700 font-medium">${instructors.length} Instructor${instructors.length !== 1 ? 's' : ''} Found</span>
              </div>
            </div>
            <a routerLink="hr/instructors/create" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Instructor
            </a>
          </div>

          <!-- Instructors List -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Current Instructors
              </h2>
            </div>
            
            <div class="p-8">
              ${instructorsHTML}
            </div>
          </div>

          <!-- Back to HR Menu -->
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


  renderInstructorsError(errorMessage) {
    this.templateEngine.mainContainer.innerHTML = HrTemplates.render('detailedErrorPage', {
      title: 'Error Loading Instructors',
      subtitle: 'Failed to load instructor data',
      errorTitle: 'Failed to Load Instructors',
      errorMessage: errorMessage,
      hasRetry: true,
      retryAction: 'hrApp.renderInstructors()',
      backLink: 'hr',
      backLabel: 'Back to HR Menu'
    });
  }

  async viewInstructor(instructorCode) {
    try {
      // Use the global instructorList instance if available
      if (window.instructorList) {
        await window.instructorList.viewInstructor(instructorCode);
      } else {
        // Fallback to old method
        const instructor = await this.apiService.fetchInstructor(instructorCode);
        this.renderInstructorDetails(instructor);
      }
    } catch (error) {
      console.error('Error loading instructor:', error);
      alert(`Error loading instructor: ${error.message}`);
    }
  }

  renderInstructorDetails(instructor) {
    const fullName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Unknown';
    const department = instructor.department || 'Not specified';
    const email = instructor.email || 'No email provided';
    const instructorCode = instructor.instructor_code || 'N/A';
    const startDate = instructor.start_date ? new Date(instructor.start_date).toLocaleDateString() : 'Not specified';
    const salary = instructor.salary ? `฿${instructor.salary.toLocaleString()}` : 'Not specified';
    const phone = instructor.phone_number || 'Not provided';
    const citizenId = instructor.citizen_id || 'Not provided';
    const gender = instructor.gender || 'Not specified';
    const academicPosition = instructor.academic_position || 'Not specified';
    const departmentPosition = instructor.department_position || 'Not specified';

    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${fullName}</h1>
            <p class="text-xl text-gray-600">Instructor Details</p>
          </div>

          <!-- Instructor Details Card -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Personal Information
              </h2>
            </div>
            
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Full Name</p>
                      <p class="text-lg font-semibold text-gray-900">${fullName}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="text-lg font-semibold text-gray-900">${email}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Department</p>
                      <p class="text-lg font-semibold text-gray-900">${department}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Salary</p>
                      <p class="text-lg font-semibold text-gray-900">${salary}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Instructor Code</p>
                      <p class="text-lg font-semibold text-gray-900">${instructorCode}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Phone</p>
                      <p class="text-lg font-semibold text-gray-900">${phone}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Start Date</p>
                      <p class="text-lg font-semibold text-gray-900">${startDate}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Gender</p>
                      <p class="text-lg font-semibold text-gray-900">${gender}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Information -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Academic Position</p>
                    <p class="text-base text-gray-900">${academicPosition}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Department Position</p>
                    <p class="text-base text-gray-900">${departmentPosition}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Citizen ID</p>
                    <p class="text-base text-gray-900">${citizenId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4 mt-8">
            <button onclick="hrApp.editInstructor('${instructorCode}')" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Instructor
            </button>
            <button onclick="hrApp.renderInstructors()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>
    `;
  }

  editInstructor(instructorCode) {
    try {
      // Use the global instructorList instance if available
      if (window.instructorList) {
        window.instructorList.editInstructor(instructorCode);
      } else {
        // Fallback to old method
        this.templateEngine.routerLinks.navigateTo('hr/instructors/create');
        alert(`Edit functionality for instructor ${instructorCode} will be implemented soon!`);
      }
    } catch (error) {
      console.error('Error editing instructor:', error);
      alert(`Error editing instructor: ${error.message}`);
    }
  }

  async viewStudent(studentCode) {
    try {
      // Use the global studentList instance if available
      if (window.studentList) {
        await window.studentList.viewStudent(studentCode);
      } else {
        // Fallback to old method
        const student = await this.apiService.fetchStudent(studentCode);
        this.renderStudentDetails(student);
      }
    } catch (error) {
      console.error('Error loading student:', error);
      alert(`Error loading student: ${error.message}`);
    }
  }

  renderStudentDetails(student) {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown';
    const program = student.program || 'Not specified';
    const email = student.email || 'No email provided';
    const studentCode = student.student_code || 'N/A';
    const startDate = student.start_date ? new Date(student.start_date).toLocaleDateString() : 'Not specified';
    const year = student.year || 'Not specified';
    const status = student.status || 'Active';
    const phone = student.phone_number || 'Not provided';
    const citizenId = student.citizen_id || 'Not provided';
    const gender = student.gender || 'Not specified';
    const advisorCode = student.advisor_code || 'Not assigned';

    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${fullName}</h1>
            <p class="text-xl text-gray-600">Student Details</p>
          </div>

          <!-- Student Details Card -->
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Personal Information
              </h2>
            </div>
            
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Full Name</p>
                      <p class="text-lg font-semibold text-gray-900">${fullName}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="text-lg font-semibold text-gray-900">${email}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Program</p>
                      <p class="text-lg font-semibold text-gray-900">${program}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Year</p>
                      <p class="text-lg font-semibold text-gray-900">${year}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Student Code</p>
                      <p class="text-lg font-semibold text-gray-900">${studentCode}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Phone</p>
                      <p class="text-lg font-semibold text-gray-900">${phone}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Start Date</p>
                      <p class="text-lg font-semibold text-gray-900">${startDate}</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Status</p>
                      <p class="text-lg font-semibold text-gray-900">${status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Information -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Gender</p>
                    <p class="text-base text-gray-900">${gender}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Advisor Code</p>
                    <p class="text-base text-gray-900">${advisorCode}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">Citizen ID</p>
                    <p class="text-base text-gray-900">${citizenId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4 mt-8">
            <button onclick="hrApp.editStudent('${studentCode}')" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Student
            </button>
            <button onclick="hrApp.renderStudents()" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md hover:shadow-lg">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>
    `;
  }

  editStudent(studentCode) {
    try {
      // Use the global studentList instance if available
      if (window.studentList) {
        window.studentList.editStudent(studentCode);
      } else {
        // Fallback to old method
        this.templateEngine.routerLinks.navigateTo('hr/students/create');
        alert(`Edit functionality for student ${studentCode} will be implemented soon!`);
      }
    } catch (error) {
      console.error('Error editing student:', error);
      alert(`Error editing student: ${error.message}`);
    }
  }

  async renderCreateInstructor() {
    // Prevent duplicate rendering
    if (this._renderingInstructorForm) {
      return;
    }
    
    // Check if form is already rendered
    if (this.templateEngine.mainContainer.querySelector('.instructor-form-container')) {
      return;
    }
    
    // Check if there are multiple forms
    const existingForms = this.templateEngine.mainContainer.querySelectorAll('form');
    if (existingForms.length > 0) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    // Check if there are multiple "Add New Instructor" headers
    const existingHeaders = this.templateEngine.mainContainer.querySelectorAll('h1');
    if (existingHeaders.length > 1) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    // Check if there are multiple "Add New Instructor" text
    const addNewInstructorTexts = this.templateEngine.mainContainer.querySelectorAll('*');
    let addNewInstructorCount = 0;
    addNewInstructorTexts.forEach(el => {
      if (el.textContent && el.textContent.includes('Add New Instructor')) {
        addNewInstructorCount++;
      }
    });
    if (addNewInstructorCount > 1) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    // Check if there are multiple "Instructor Information" text
    const instructorInfoTexts = this.templateEngine.mainContainer.querySelectorAll('*');
    let instructorInfoCount = 0;
    instructorInfoTexts.forEach(el => {
      if (el.textContent && el.textContent.includes('Instructor Information')) {
        instructorInfoCount++;
      }
    });
    if (instructorInfoCount > 1) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    // Check if there are multiple "Create a new instructor record" text
    const createInstructorTexts = this.templateEngine.mainContainer.querySelectorAll('*');
    let createInstructorCount = 0;
    createInstructorTexts.forEach(el => {
      if (el.textContent && el.textContent.includes('Create a new instructor record')) {
        createInstructorCount++;
      }
    });
    if (createInstructorCount > 1) {
      this.templateEngine.mainContainer.innerHTML = "";
    }
    
    this._renderingInstructorForm = true;
    
    // Clear mainContainer first to prevent duplicate content
    this.templateEngine.mainContainer.innerHTML = "";
    
    // Add a small delay to prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 10));
    
    try {
      // Ensure templates are loaded first
      await this.ensureTemplatesLoaded();
      
      // Show loading state using template
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureLoadingPage', {
        bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
        gradientFrom: 'blue-600',
        gradientTo: 'purple-600',
        icon: HrTemplates.iconPaths.instructor,
        title: 'Create Instructor',
        message: 'Form feature is loading, please wait...',
        loadingTitle: 'Loading Form...',
        loadingMessage: 'Loading form components...',
        colorName: 'blue'
      });
    
    // Check if feature is already available
    if (window.HrInstructorFormFeature) {
      const formFeature = new window.HrInstructorFormFeature(this.templateEngine, this.rootURL);
      await formFeature.render();
      return;
    }
    
    // Ensure feature modules are loaded
    await this.loadFeatureModules()
    
    // Wait a bit more for the feature to be available
    let retries = 0
    while (!window.HrInstructorFormFeature && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }
    
    // Use JavaScript form instead of redirect
    if (window.HrInstructorFormFeature) {
      const formFeature = new window.HrInstructorFormFeature(this.templateEngine, this.rootURL);
      await formFeature.render();
    } else {
      console.error('HrInstructorFormFeature not available after loading');
      // Show error using template
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureErrorPage', {
        bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
        title: 'Create Instructor',
        errorMessage: 'Error: Form feature could not be loaded. Please refresh the page.',
        helpMessage: 'Please try refreshing the page or contact support.'
      });
    }
    } finally {
      this._renderingInstructorForm = false;
    }
  }

  async renderStudents() {
    try {
      // Load the StudentList feature
      await this.loadFeatureModules();
      
      if (window.HrStudentListFeature) {
        const listFeature = new window.HrStudentListFeature(this.templateEngine, this.rootURL);
        await listFeature.render();
        
        // Make it globally accessible for onclick handlers
        window.studentList = listFeature;
      } else {
        throw new Error('StudentListFeature not available');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Students',
        message: error.message,
        hasRetry: true,
        retryAction: 'hrApp.renderStudents()',
        backLink: 'hr',
        backLabel: 'Back to HR Menu'
      });
    }
  }

  renderStudentsList(students) {
    const studentsHTML = students.length > 0 
      ? students.map(student => HrUiComponents.renderStudentCard(student)).join('')
      : HrUiComponents.renderEmptyStudentsState();

    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
            <p class="text-lg text-gray-600">Manage student records and academic progress</p>
          </div>

          <!-- Action Bar -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-lg text-gray-700 font-medium">${students.length} Student${students.length !== 1 ? 's' : ''} Found</span>
              </div>
            </div>
            <a routerLink="hr/students/create" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Student
            </a>
          </div>

          <!-- Students List -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Current Students
              </h2>
            </div>
            
            <div class="p-8">
              ${studentsHTML}
            </div>
          </div>

          <!-- Back to HR Menu -->
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

  renderStudentsError(errorMessage) {
    this.templateEngine.mainContainer.innerHTML = HrTemplates.render('detailedErrorPage', {
      title: 'Error Loading Students',
      subtitle: 'Failed to load student data',
      errorTitle: 'Failed to Load Students',
      errorMessage: errorMessage,
      hasRetry: true,
      retryAction: 'hrApp.renderStudents()',
      backLink: 'hr',
      backLabel: 'Back to HR Menu'
    });
  }

  async renderCreateStudent() {
    // Ensure templates are loaded first
    await this.ensureTemplatesLoaded();
    
    // Show loading state using template
    this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureLoadingPage', {
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
      gradientFrom: 'green-600',
      gradientTo: 'teal-600',
      icon: HrTemplates.iconPaths.student,
      title: 'Create Student',
      message: 'Form feature is loading, please wait...',
      loadingTitle: 'Loading Form...',
      loadingMessage: 'Loading form components...',
      colorName: 'green'
    });
    
    // Check if feature is already available
    if (window.HrStudentFormFeature) {
      const formFeature = new window.HrStudentFormFeature(this.templateEngine, this.rootURL);
      await formFeature.render();
      return;
    }
    
    // Ensure feature modules are loaded
    await this.loadFeatureModules()
    
    // Wait a bit more for the feature to be available
    let retries = 0
    while (!window.HrStudentFormFeature && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }
    
    // Use JavaScript form instead of redirect
    if (window.HrStudentFormFeature) {
      const formFeature = new window.HrStudentFormFeature(this.templateEngine, this.rootURL);
      await formFeature.render();
    } else {
      console.error('HrStudentFormFeature not available after loading');
      // Show error using template
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureErrorPage', {
        bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
        title: 'Create Student',
        errorMessage: 'Error: Form feature could not be loaded. Please refresh the page.',
        helpMessage: 'Please try refreshing the page or contact support.'
      });
    }
  }

  async renderStudentDetail(params) {
    const studentId = params.id.toUpperCase()
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-student-detail">
        <h2>👨‍🎓 Student Details: ${studentId}</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Personal Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p><strong>Student ID:</strong> ${studentId}</p>
              <p><strong>Name:</strong> Alice Johnson</p>
              <p><strong>Email:</strong> alice.johnson@student.edu</p>
            </div>
            <div>
              <p><strong>Program:</strong> Computer Science</p>
              <p><strong>Year:</strong> 2</p>
              <p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
            </div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <button style="background: #ffc107; color: #212529; padding: 8px 16px; border: none; border-radius: 4px; margin-right: 10px;">Edit Student</button>
          <a routerLink="hr/students" style="background: #6c757d; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Back to Students</a>
        </div>
      </div>
    `
  }

  async renderResignation() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-resignation">
        <h2>📝 Resignation Management</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>👨‍🎓 Student Resignations</h4>
            <p>Handle student withdrawal requests</p>
            <a routerLink="hr/resignation/student" style="color: #007bff;">Manage Student Resignations</a>
          </div>
          
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>👨‍🏫 Instructor Resignations</h4>
            <p>Handle instructor resignation requests</p>
            <a routerLink="hr/resignation/instructor" style="color: #007bff;">Manage Instructor Resignations</a>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr" style="color: #6c757d;">← Back to HR Menu</a>
        </div>
      </div>
    `
  }

  async renderStudentResignation() {
    try {
      // Load the StudentResignationList feature
      await this.loadFeatureModules();
      
      if (window.HrStudentResignationListFeature) {
        const listFeature = new window.HrStudentResignationListFeature(this.templateEngine, this.rootURL);
        await listFeature.render();
        
        // Make it globally accessible for onclick handlers
        window.resignationList = listFeature;
      } else {
        throw new Error('StudentResignationListFeature not available');
      }
    } catch (error) {
      console.error('Error loading student resignations:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Student Resignations',
        message: error.message,
        hasRetry: true,
        retryAction: 'hrApp.renderStudentResignation()',
        backLink: 'hr/resignation',
        backLabel: 'Back to Resignations'
      });
    }
  }

  async renderCreateStudentResignation() {
    // Ensure templates are loaded first
    await this.ensureTemplatesLoaded();
    
    // Show loading using template
    this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureLoadingPage', {
      bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
      gradientFrom: 'orange-500',
      gradientTo: 'orange-600',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
      title: 'Create Student Resignation',
      message: 'Form feature is loading, please wait...',
      loadingTitle: 'Loading Form...',
      loadingMessage: 'Loading form components...',
      colorName: 'amber'
    });

    if (window.HrStudentResignationFormFeature) {
      const feature = new window.HrStudentResignationFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
      return
    }

    await this.loadFeatureModules()
    let retries = 0
    while (!window.HrStudentResignationFormFeature && retries < 10) {
      await new Promise(r => setTimeout(r, 100))
      retries++
    }
    if (window.HrStudentResignationFormFeature) {
      const feature = new window.HrStudentResignationFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
    } else {
      console.error('HrStudentResignationFormFeature not available after loading')
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureErrorPage', {
        bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
        title: 'Create Student Resignation',
        errorMessage: 'Error: Form feature could not be loaded.',
        helpMessage: 'Please refresh the page or try again later.'
      });
    }
  }

  async renderInstructorResignation() {
    try {
      // Load the InstructorResignationList feature
      await this.loadFeatureModules();
      
      if (window.HrInstructorResignationListFeature) {
        const listFeature = new window.HrInstructorResignationListFeature(this.templateEngine, this.rootURL);
        await listFeature.render();
        
        // Make it globally accessible for onclick handlers
        window.instructorResignationList = listFeature;
      } else {
        throw new Error('InstructorResignationListFeature not available');
      }
    } catch (error) {
      console.error('Error loading instructor resignations:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Instructor Resignations',
        message: error.message,
        hasRetry: true,
        retryAction: 'hrApp.renderInstructorResignation()',
        backLink: 'hr/resignation',
        backLabel: 'Back to Resignations'
      });
    }
  }

  async renderCreateInstructorResignation() {
    // Ensure templates are loaded first
    await this.ensureTemplatesLoaded();
    
    // Show loading using template
    this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureLoadingPage', {
      bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
      gradientFrom: 'orange-500',
      gradientTo: 'red-600',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
      title: 'Create Instructor Resignation',
      message: 'Form feature is loading, please wait...',
      loadingTitle: 'Loading Form...',
      loadingMessage: 'Loading form components...',
      colorName: 'amber'
    });

    if (window.HrInstructorResignationFormFeature) {
      const feature = new window.HrInstructorResignationFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
      return
    }

    await this.loadFeatureModules()
    let retries = 0
    while (!window.HrInstructorResignationFormFeature && retries < 10) {
      await new Promise(r => setTimeout(r, 100))
      retries++
    }
    if (window.HrInstructorResignationFormFeature) {
      const feature = new window.HrInstructorResignationFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
    } else {
      console.error('HrInstructorResignationFormFeature not available after loading')
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('featureErrorPage', {
        bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
        title: 'Create Instructor Resignation',
        errorMessage: 'Error: Form feature could not be loaded.',
        helpMessage: 'Please refresh the page or try again later.'
      });
    }
  }

  async renderLeaveMain() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
            <p class="text-gray-600">Manage student and instructor leave requests</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Student Leave</h3>
              </div>
              <p class="text-gray-600 mb-6">Manage student leave requests</p>
              <div class="flex flex-col space-y-2">
                <a routerLink="hr/leave/student" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">View Requests</a>
                <a routerLink="hr/leave/student/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">New Request</a>
              </div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Instructor Leave</h3>
              </div>
              <p class="text-gray-600 mb-6">Manage instructor leave requests</p>
              <div class="flex flex-col space-y-2">
                <a routerLink="hr/leave/instructor" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">View Requests</a>
                <a routerLink="hr/leave/instructor/create" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">New Request</a>
              </div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">History</h3>
              </div>
              <p class="text-gray-600 mb-6">View complete leave request history</p>
              <a routerLink="hr/leave/history" class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">View History</a>
            </div>
          </div>
          <div class="text-center">
            <a routerLink="hr" class="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50">Back to HR Menu</a>
          </div>
        </div>
      </div>
    `
  }

  async renderCreateStudentLeave() {
    await this.loadFeatureModules()
    if (window.HrStudentLeaveFormFeature) {
      const feature = new window.HrStudentLeaveFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
    }
  }

  async renderEditStudentLeave(params = {}) {
    await this.loadFeatureModules()
    if (window.HrStudentLeaveEditFeature) {
      const feature = new window.HrStudentLeaveEditFeature(this.templateEngine, this.rootURL, params?.id)
      await feature.render()
    }
  }

  async renderCreateInstructorLeave() {
    await this.loadFeatureModules()
    if (window.HrInstructorLeaveFormFeature) {
      const feature = new window.HrInstructorLeaveFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
    }
  }

  async renderEditInstructorLeave(params = {}) {
    await this.loadFeatureModules()
    if (window.HrInstructorLeaveEditFeature) {
      const feature = new window.HrInstructorLeaveEditFeature(this.templateEngine, this.rootURL, params?.id)
      await feature.render()
    }
  }

  async renderStudentLeaveList() {
    await this.loadFeatureModules()
    if (window.HrStudentLeaveListFeature) {
      const feature = new window.HrStudentLeaveListFeature(this.templateEngine, this.rootURL)
      await feature.render()
    }
  }

  async renderInstructorLeaveList() {
    await this.loadFeatureModules()
    if (window.HrInstructorLeaveListFeature) {
      const feature = new window.HrInstructorLeaveListFeature(this.templateEngine, this.rootURL)
      await feature.render()
    }
  }

  async renderLeaveHistory() {
    await this.loadFeatureModules()
    if (window.HrLeaveHistoryFeature) {
      const feature = new window.HrLeaveHistoryFeature(this.templateEngine, this.rootURL)
      await feature.render()
    }
  }

  async renderDepartments() {
    this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderLoadingState(
      'Departments',
      'Manage departments and budgets'
    )

    try {
      if (!window.HrDepartmentListFeature) {
        await this.loadScript('/hr/static/js/features/departments/DepartmentList.js?v=' + Date.now())
      }
      const feature = new window.HrDepartmentListFeature(this.templateEngine, this.rootURL)
      window.departmentList = feature
      await feature.render()
    } catch (err) {
      console.error('Error loading Departments list:', err)
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Departments</h2>
              <p class="text-red-600 mt-2">${err.message || 'Unknown error'}</p>
              <div class="mt-4">
                <a routerLink="hr" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back to HR</a>
              </div>
            </div>
          </div>
        </div>
      `
    }
  }

  async renderCreateDepartment() {
    this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderLoadingState(
      'Add Department',
      'Create a new department'
    )

    try {
      if (!window.HrDepartmentFormFeature) {
        await this.loadScript('/hr/static/js/features/departments/DepartmentForm.js?v=' + Date.now())
      }
      const feature = new window.HrDepartmentFormFeature(this.templateEngine, this.rootURL)
      await feature.render()
    } catch (err) {
      console.error('Error loading Department form:', err)
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Form</h2>
              <p class="text-red-600 mt-2">${err.message || 'Unknown error'}</p>
              <div class="mt-4">
                <a routerLink="hr/departments" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back to Departments</a>
              </div>
            </div>
          </div>
        </div>
      `
    }
  }

  async renderEditDepartment(params) {
    const name = params?.name || ''
    this.templateEngine.mainContainer.innerHTML = HrUiComponents.renderLoadingState(
      'Edit Department',
      `Updating: ${decodeURIComponent(name)}`
    )

    try {
      if (!window.HrDepartmentEditFeature) {
        await this.loadScript('/hr/static/js/features/departments/DepartmentEdit.js?v=' + Date.now())
      }
      const feature = new window.HrDepartmentEditFeature(this.templateEngine, this.rootURL, name)
      await feature.render()
    } catch (err) {
      console.error('Error loading Department edit:', err)
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">Error Loading Department</h2>
              <p class="text-red-600 mt-2">${err.message || 'Unknown error'}</p>
              <div class="mt-4">
                <a routerLink="hr/departments" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Back to Departments</a>
              </div>
            </div>
          </div>
        </div>
      `
    }
  }

  // Override the default render method
  async render() {
    try {
      // Get current path from hash (core's way)
      const currentPath = this.templateEngine.getCurrentPath()
      
      // Ensure mainContainer is available
      if (!this.templateEngine.mainContainer) {
        this.templateEngine.mainContainer = document.getElementById('MainContainer')
      }
      
      // Validate template engine
      if (!this.templateEngine || !this.templateEngine.mainContainer) {
        throw new Error('Template engine or main container not available')
      }
      
      // Handle HR routes
      const result = await this.handleRoute(currentPath)
      this.isInitialized = true
      return result
    } catch (error) {
      this.errorHandler.logError(error, { context: 'render_method' })
      await this.renderErrorPage(error)
      return false
    }
  }

  async renderErrorPage(error) {
    try {
      const errorHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-red-800">HR Module Error</h2>
              <p class="text-red-600 mt-2">${error.message || 'An unexpected error occurred'}</p>
              <div class="mt-4">
                <button onclick="window.location.reload()" 
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  Retry
                </button>
                <button onclick="window.location.href='/'"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ml-3">
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      
      if (this.templateEngine && this.templateEngine.mainContainer) {
        this.templateEngine.mainContainer.innerHTML = errorHTML
      }
    } catch (renderError) {
      console.error('Failed to render error page:', renderError)
    }
  }

  // Utility methods for better architecture
  getModuleInfo() {
    return {
      name: this.moduleName,
      version: this.moduleVersion,
      isInitialized: this.isInitialized,
      errorCount: this.errorHandler.errors.length,
      hasErrors: this.errorHandler.hasErrors()
    }
  }

  getHealthStatus() {
    return {
      status: this.isInitialized ? 'healthy' : 'initializing',
      errors: this.errorHandler.getErrors(),
      lastError: this.errorHandler.errors[this.errorHandler.errors.length - 1] || null
    }
  }

  // Cleanup method for proper memory management
  cleanup() {
    try {
      // Remove event listeners
      window.removeEventListener('error', this.errorHandler)
      window.removeEventListener('unhandledrejection', this.errorHandler)
      
      // Clear error logs
      this.errorHandler.clearErrors()
      
      // Reset state
      this.isInitialized = false
      
      // HrApplication cleaned up successfully
    } catch (error) {
      console.error('Failed to cleanup HrApplication:', error)
    }
  }

  async renderEditInstructor(params) {
    try {
      // Load the InstructorEdit feature
      await this.loadFeatureModules();
      
      if (window.HrInstructorEditFeature) {
        const editFeature = new window.HrInstructorEditFeature(this.templateEngine, this.rootURL, params.code);
        await editFeature.render();
      } else {
        throw new Error('InstructorEditFeature not available');
      }
    } catch (error) {
      console.error('Error loading instructor edit:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Instructor Edit',
        message: error.message,
        hasRetry: true,
        retryAction: `hrApp.renderEditInstructor({code: '${params.code}'})`,
        backLink: 'hr/instructors',
        backLabel: 'Back to Instructors'
      });
    }
  }

  async renderEditStudent(params) {
    try {
      // Load the StudentEdit feature
      await this.loadFeatureModules();
      
      if (window.HrStudentEditFeature) {
        const editFeature = new window.HrStudentEditFeature(this.templateEngine, this.rootURL, params.code);
        await editFeature.render();
      } else {
        throw new Error('StudentEditFeature not available');
      }
    } catch (error) {
      console.error('Error loading student edit:', error);
      this.templateEngine.mainContainer.innerHTML = HrTemplates.render('errorPage', {
        title: 'Error Loading Student Edit',
        message: error.message,
        hasRetry: true,
        retryAction: `hrApp.renderEditStudent({code: '${params.code}'})`,
        backLink: 'hr/students',
        backLabel: 'Back to Students'
      });
    }
  }

  // Debug utilities
  debug() {
    console.group('HrApplication Debug Info')
    console.log('Module Info:', this.getModuleInfo())
    console.log('Health Status:', this.getHealthStatus())
    console.log('Template Engine:', this.templateEngine ? 'Available' : 'Not Available')
    console.log('Main Container:', this.templateEngine?.mainContainer ? 'Available' : 'Not Available')
    console.groupEnd()
  }
}

if (typeof window !== 'undefined') {
  window.HrApplication = HrApplication;
}
}
