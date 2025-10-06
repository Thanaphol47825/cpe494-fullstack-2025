// HR Error Handler Class
if (typeof window !== 'undefined' && !window.HrErrorHandler) {
  class HrErrorHandler {
    constructor() {
      this.errors = []
      this.maxErrors = 100
    }

    logError(error, context = {}) {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        message: error.message || error,
        stack: error.stack,
        context: context,
        module: 'hr'
      }
      
      this.errors.push(errorEntry)
      
      // Keep only recent errors
      if (this.errors.length > this.maxErrors) {
        this.errors.shift()
      }
      
      console.error('🚨 HR Error:', errorEntry)
      return errorEntry
    }

    getErrors() {
      return this.errors
    }

    clearErrors() {
      this.errors = []
    }

    hasErrors() {
      return this.errors.length > 0
    }
  }
  
  window.HrErrorHandler = HrErrorHandler
}

// HR Validation Utilities
if (typeof window !== 'undefined' && !window.HrValidator) {
  class HrValidator {
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    static validateRequired(fields, data) {
      const missing = fields.filter(field => !data[field] || data[field].trim() === '')
      return {
        isValid: missing.length === 0,
        missing: missing
      }
    }

    static validateStudentData(data) {
      const required = ['student_code', 'first_name', 'last_name', 'email']
      const validation = this.validateRequired(required, data)
      
      if (!validation.isValid) {
        return { isValid: false, errors: [`Missing required fields: ${validation.missing.join(', ')}`] }
      }

      if (data.email && !this.validateEmail(data.email)) {
        return { isValid: false, errors: ['Invalid email format'] }
      }

      return { isValid: true, errors: [] }
    }

    static validateInstructorData(data) {
      const required = ['instructor_code', 'first_name', 'last_name', 'email']
      const validation = this.validateRequired(required, data)
      
      if (!validation.isValid) {
        return { isValid: false, errors: [`Missing required fields: ${validation.missing.join(', ')}`] }
      }

      if (data.email && !this.validateEmail(data.email)) {
        return { isValid: false, errors: ['Invalid email format'] }
      }

      return { isValid: true, errors: [] }
    }
  }
  
  window.HrValidator = HrValidator
}

// Prevent duplicate declaration
if (typeof window !== 'undefined' && window.HrApplication) {
  // Skip re-declaration silently
} else {
class HrApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine)
    
    // Initialize HR-specific properties
    this.moduleName = 'hr'
    this.moduleVersion = '1.0.0'
    this.isInitialized = false
    this.rootURL = window.__ROOT_URL__ || ""
    
    // Set the base path for sub-modules
    this.setSubModuleBasePath('/hr/static/js/components')
    
    // Initialize error handling and logging
    this.errorHandler = new HrErrorHandler()
    
    // Initialize logger if available, otherwise create a simple fallback
    if (typeof HrLogger !== 'undefined') {
      this.logger = new HrLogger('hr')
    } else {
      this.logger = {
        info: (msg) => console.log(`[HR] ${msg}`),
        error: (msg) => console.error(`[HR] ${msg}`),
        warn: (msg) => console.warn(`[HR] ${msg}`),
        debug: (msg) => console.log(`[HR DEBUG] ${msg}`)
      }
    }
    
    // HR module uses core's hash-based routing
    
    // Setup routes and navigation
    this.setupRoutes()
    this.setupErrorHandling()
    
    this.logger.info(`HrApplication v${this.moduleVersion} initialized`)
  }

  async loadFeatureModules() {
    try {
      // Check if already loading to prevent duplicate loading
      if (this._loadingFeatures) {
        return
      }
      
      // Check if features are already loaded
      if (window.HrStudentFormFeature && window.HrInstructorFormFeature) {
        return
      }
      
      this._loadingFeatures = true
      
      // Load StudentForm feature
      if (!window.HrStudentFormFeature) {
        await this.loadScript('/hr/static/js/features/StudentForm.js')
      }
      
      // Load InstructorForm feature
      if (!window.HrInstructorFormFeature) {
        await this.loadScript('/hr/static/js/features/InstructorForm.js')
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
    
    // Students routes with StudentManager sub-module
    this.addRouteWithSubModule('/students', this.renderStudents.bind(this), 'StudentManager.js')
    this.addRoute('/students/create', this.renderCreateStudent.bind(this))
    this.addRoute('/students/:id', this.renderStudentDetail.bind(this))
    
    this.addRoute('/resignation', this.renderResignation.bind(this))
    this.addRoute('/resignation/student', this.renderStudentResignation.bind(this))
    this.addRoute('/resignation/instructor', this.renderInstructorResignation.bind(this))
    
    // Leave routes with LeaveManager sub-module
    this.addRouteWithSubModule('/leave', this.renderLeave.bind(this), 'LeaveManager.js')
    this.addRouteWithSubModule('/leave/create', this.renderCreateLeave.bind(this), 'LeaveManager.js')
    this.addRouteWithSubModule('/leave/history', this.renderLeaveHistory.bind(this), 'LeaveManager.js')
    
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
    this.templateEngine.mainContainer.innerHTML = `
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

            <!-- Resignation Card (TODO) -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden opacity-75">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">Resignation</h3>
                  <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">TODO</span>
                </div>
                <p class="text-gray-600 mb-6">Handle resignation requests and exit processes</p>
                <div class="flex flex-col space-y-2">
                  <button disabled class="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Requests
                    <span class="ml-2 text-xs">(Coming Soon)</span>
                  </button>
                </div>
                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-sm text-yellow-800">
                    <strong>Developer Note:</strong> This feature is assigned to another team member for implementation.
                  </p>
                </div>
              </div>
            </div>

            <!-- Leave Management Card (TODO) -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden opacity-75">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">Leave Management</h3>
                  <span class="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">TODO</span>
                </div>
                <p class="text-gray-600 mb-6">Manage leave requests and vacation tracking</p>
                <div class="flex flex-col space-y-2">
                  <button disabled class="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Requests
                    <span class="ml-2 text-xs">(Coming Soon)</span>
                  </button>
                  <button disabled class="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    New Request
                    <span class="ml-2 text-xs">(Coming Soon)</span>
                  </button>
                  <button disabled class="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    History
                    <span class="ml-2 text-xs">(Coming Soon)</span>
                  </button>
                </div>
                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-sm text-yellow-800">
                    <strong>Developer Note:</strong> This feature is assigned to another team member for implementation.
                  </p>
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
    `
  }

  async renderInstructors() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-instructors">
        <h2>👨‍🏫 Instructor Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="hr/instructors/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Instructor</a>
        </div>
        
        <div class="instructor-list">
          <h3>Current Instructors</h3>
          <div style="display: grid; gap: 10px;">
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f8f9fa;">
              <strong>Dr. John Smith</strong>
              <div>Department: Computer Science | Employee ID: EMP001</div>
              <div>Email: john.smith@university.edu</div>
              <div style="margin-top: 10px;">
                <button style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">View</button>
                <button style="background: #ffc107; color: #212529; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">Edit</button>
                <a routerLink="hr/resignation/instructor" style="background: #dc3545; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">Resignation</a>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr" style="color: #6c757d;">← Back to HR Menu</a>
        </div>
      </div>
    `
  }

  async renderCreateInstructor() {
    // Show loading state first
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Create Instructor</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">Form feature is loading, please wait...</p>
          </div>
          
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Loading Form...
              </h2>
            </div>
            
            <div class="p-8">
              <div class="text-center py-16">
                <div class="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p class="text-lg text-gray-600">Loading form components...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
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
      // Show error message
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Create Instructor</h1>
              <p class="text-xl text-red-600 max-w-2xl mx-auto">Error: Form feature could not be loaded. Please refresh the page.</p>
            </div>
            
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Error Loading Form
                </h2>
              </div>
              
              <div class="p-8">
                <div class="text-center py-16">
                  <p class="text-lg text-gray-600">Please try refreshing the page or contact support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  async renderStudents() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-students">
        <h2>👨‍🎓 Student Management</h2>
        
        <div style="margin: 15px 0;">
          <a routerLink="hr/students/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ Add New Student</a>
        </div>
        
        <div class="student-list">
          <h3>Enrolled Students</h3>
          <div style="display: grid; gap: 10px;">
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f8f9fa;">
              <strong>Alice Johnson</strong>
              <div>Student ID: STU001 | Program: Computer Science</div>
              <div>Year: 2 | Status: Active</div>
              <div style="margin-top: 10px;">
                <a routerLink="hr/students/stu001" style="background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; margin-right: 5px;">View Details</a>
                <button style="background: #ffc107; color: #212529; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">Edit</button>
                <a routerLink="hr/resignation/student" style="background: #dc3545; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px;">Resignation</a>
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr" style="color: #6c757d;">← Back to HR Menu</a>
        </div>
      </div>
    `
  }

  async renderCreateStudent() {
    // Show loading state first
    this.templateEngine.mainContainer.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Create Student</h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">Form feature is loading, please wait...</p>
          </div>
          
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Loading Form...
              </h2>
            </div>
            
            <div class="p-8">
              <div class="text-center py-16">
                <div class="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <p class="text-lg text-gray-600">Loading form components...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
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
      // Show error message
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Create Student</h1>
              <p class="text-xl text-red-600 max-w-2xl mx-auto">Error: Form feature could not be loaded. Please refresh the page.</p>
            </div>
            
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-red-600 to-pink-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Error Loading Form
                </h2>
              </div>
              
              <div class="p-8">
                <div class="text-center py-16">
                  <p class="text-lg text-gray-600">Please try refreshing the page or contact support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
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
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-student-resignation">
        <h2>📝 Student Resignation Requests</h2>
        <p>Process student withdrawal and resignation requests.</p>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr/resignation" style="color: #6c757d;">← Back to Resignations</a>
        </div>
      </div>
    `
  }

  async renderInstructorResignation() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-instructor-resignation">
        <h2>📝 Instructor Resignation Requests</h2>
        <p>Process instructor resignation requests.</p>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr/resignation" style="color: #6c757d;">← Back to Resignations</a>
        </div>
      </div>
    `
  }

  async renderLeave() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-leave">
        <h2>🏖️ Leave Management</h2>
        <p>Manage student and instructor leave requests.</p>
        
        <div style="margin: 15px 0;">
          <a routerLink="hr/leave/create" style="background: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">+ New Leave Request</a>
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr" style="color: #6c757d;">← Back to HR Menu</a>
        </div>
      </div>
    `
  }

  async renderCreateLeave() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-create-leave">
        <h2>➕ Create Leave Request</h2>
        <p>Submit a new leave request.</p>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr/leave" style="color: #6c757d;">← Back to Leave Management</a>
        </div>
      </div>
    `
  }

  async renderLeaveHistory() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-leave-history">
        <h2>📊 Leave History</h2>
        <p>Leave history functionality.</p>
        
        <div style="margin-top: 20px;">
          <a routerLink="hr/leave" style="color: #6c757d;">← Back to Leave Management</a>
        </div>
      </div>
    `
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