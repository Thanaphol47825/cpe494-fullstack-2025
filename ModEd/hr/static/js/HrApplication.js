// Prevent duplicate declaration
if (typeof window !== 'undefined' && window.HrApplication) {
  // Skip re-declaration silently
  console.log('HrApplication already exists, skipping re-declaration');
} else {
class HrApplication extends BaseModuleApplication {
  constructor(templateEngine) {
    super(templateEngine)
    
    // Set the base path for sub-modules
    this.setSubModuleBasePath('/hr/static/js/components')
    
    this.setupRoutes()
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
    console.log('🔧 Setting up custom navigation for HR module')
    
    // Override routerLink behavior to use full URL navigation
    document.addEventListener('click', (e) => {
      console.log('🔍 Click detected:', e.target)
      const target = e.target.closest('[routerLink]')
      console.log('🔍 RouterLink target:', target)
      
      if (target && target.closest('#MainContainer')) {
        console.log('🔍 RouterLink clicked in MainContainer')
        e.preventDefault()
        const route = target.getAttribute('routerLink')
        console.log('🔍 Route to navigate:', route)
        this.navigateToFullURL(route)
      } else {
        console.log('🔍 RouterLink not in MainContainer or no routerLink found')
        console.log('🔍 MainContainer exists:', !!document.querySelector('#MainContainer'))
        console.log('🔍 All routerLink elements:', document.querySelectorAll('[routerLink]'))
      }
    })
  }

  navigateToFullURL(route) {
    console.log('🚀 navigateToFullURL called with route:', route)
    
    if (!route || route === '') {
      console.log('🚀 SPA Navigation to HR main page')
      // Use SPA navigation instead of full page reload
      this.renderMainPage()
      return
    }

    // For other routes, use full URL navigation
    const cleanRoute = route.startsWith('/') ? route : `/${route}`
    console.log('🚀 Navigating to:', cleanRoute)
    window.location.href = cleanRoute
  }

  async renderMainPage() {
    this.templateEngine.mainContainer.innerHTML = `
      <div class="hr-main">
        <h2>👥 Human Resources Management</h2>
        <p>Manage instructors, students, and HR processes.</p>
        
        <div class="hr-menu" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
          
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>👨‍🏫 Instructors</h4>
            <p>Manage teaching staff</p>
            <a routerLink="hr/instructors" style="color: #007bff;">View All</a> |
            <a routerLink="hr/instructors/create" style="color: #28a745;">Add New</a>
          </div>
          
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>👨‍🎓 Students</h4>
            <p>Manage student records</p>
            <a routerLink="hr/students" style="color: #007bff;">View All</a> |
            <a routerLink="hr/students/create" style="color: #28a745;">Add New</a>
          </div>
          
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>📝 Resignation</h4>
            <p>Handle resignation requests</p>
            <a routerLink="hr/resignation" style="color: #007bff;">View Requests</a>
          </div>
          
          <div class="card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <h4>🏖️ Leave Management</h4>
            <p>Manage leave requests</p>
            <a routerLink="hr/leave" style="color: #007bff;">View Requests</a> |
            <a routerLink="hr/leave/create" style="color: #28a745;">New Request</a> |
            <a routerLink="hr/leave/history" style="color: #6c757d;">History</a>
          </div>
          
        </div>
        
        <div style="margin-top: 20px;">
          <a routerLink="" style="color: #6c757d;">← Back to Main Menu</a>
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
    // Redirect to the actual form page
    window.location.href = '/hr/instructors/create';
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
    // Redirect to the actual form page
    window.location.href = '/hr/students/create';
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
    // Get current path from URL pathname instead of hash
    const currentPath = window.location.pathname
    console.log('🎯 HrApplication.render() called with path:', currentPath)
    console.log('🎯 Current URL:', window.location.href)
    return await this.handleRoute(currentPath)
  }
}

if (typeof window !== 'undefined') {
  window.HrApplication = HrApplication;
}
}