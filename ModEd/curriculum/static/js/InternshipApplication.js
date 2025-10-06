if (typeof window !== 'undefined' && window.InternshipApplication) {} else {
    class InternshipApplication extends BaseModuleApplication {
        constructor(templateEngine) {
            super(templateEngine)
            
            // Set the base path for sub-modules
            this.setSubModuleBasePath('/curriculum/static/js')
            
            // Setup routes and navigation
            this.setupRoutes()
        }

        setupRoutes() {
            // Register main routes
            this.addRoute('', this.renderMainPage.bind(this))
            
            // Add routes for each model with sub-module loading
            this.addRouteWithSubModule('/internshipreport', this.renderInternshipReport.bind(this), 'InternshipReportCreate.js')
            this.addRouteWithSubModule('/company', this.renderCompany.bind(this), 'CompanyCreate.js')
            this.addRouteWithSubModule('/internshipmentor', this.renderInternshipMentor.bind(this), 'InternshipMentorCreate.js')
            this.addRouteWithSubModule('/internshipattendance', this.renderInternshipAttendance.bind(this), 'internshipAttendanceCreate.js')
            this.addRouteWithSubModule('/internshipcriteria', this.renderInternshipCriteria.bind(this), 'InternshipCriteriaCreate.js')
            
            // Set default route
            this.setDefaultRoute('')
        }

        models = [
            // { label: "internship application", route: "/internshipapplication" },
            { label: "internship report", route: "/internshipreport" },
            // { label: "internship evaluation", route: "/internshipevaluation" },
            { label: "Company", route: "/company" },
            { label: "Internship Mentor", route: "/internshipmentor" },
            { label: "Internship Attendance", route: "/internshipattendance" },
            { label: "Internship Criteria", route: "/internshipcriteria" },
        ]

        async renderMainPage() {
            if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
                document.head.appendChild(script);
            }

            this.templateEngine.mainContainer.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <!-- Header Section -->
                        <div class="text-center mb-12">
                            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 112-2V6m8 0H8"></path>
                                </svg>
                            </div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">Internship Management</h1>
                            <p class="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive system for managing internship programs, companies, mentors, and student progress</p>
                        </div>

                        <!-- Main Menu Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            `

            this.models.forEach(model => {
                const cardHtml = `
                    <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-center mb-4">
                                <h3 class="text-xl font-semibold text-gray-900">${model.label}</h3>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <a routerLink="curriculum${model.route}" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    Manage ${model.label}
                                </a>
                            </div>
                        </div>
                    </div>
                `
                this.templateEngine.mainContainer.innerHTML += cardHtml
            })

            this.templateEngine.mainContainer.innerHTML += `
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

        // Individual render methods for sub-routes
        async renderInternshipReport() {
            console.log("Rendering Internship Report")
            if (window.InternshipReportCreate) {
                const reportCreate = new window.InternshipReportCreate(this.templateEngine)
                await reportCreate.render()
            }
        }

        async renderCompany() {
            console.log("Rendering Company")
            if (window.CompanyCreate) {
                const companyCreate = new window.CompanyCreate(this.templateEngine)
                await companyCreate.render()
            }
        }

        async renderInternshipMentor() {
            console.log("Rendering Internship Mentor")
            if (window.InternshipMentorCreate) {
                const mentorCreate = new window.InternshipMentorCreate(this.templateEngine)
                await mentorCreate.render()
            }
        }

        async renderInternshipAttendance() {
            console.log("Rendering Internship Attendance")
            if (window.InternshipAttendanceCreate) {
                const attendanceCreate = new window.InternshipAttendanceCreate(this.templateEngine)
                await attendanceCreate.render()
            }
        }

        async renderInternshipCriteria() {
            console.log("Rendering Internship Criteria")
            if (window.InternshipCriteriaCreate) {
                const criteriaCreate = new window.InternshipCriteriaCreate(this.templateEngine)
                await criteriaCreate.render()
            }
        }

        // Override the default render method
        async render() {
            try {
                // Try to handle sub-routing first
                const handled = await this.handleRoute(this.templateEngine.getCurrentPath())
                if (handled) {
                    return true
                }

                // Default render - show main page
                await this.renderMainPage()
                return false
            } catch (error) {
                console.error('Error in InternshipApplication render:', error)
                await this.renderErrorPage(error)
                return false
            }
        }

        async renderErrorPage(error) {
            this.templateEngine.mainContainer.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div class="max-w-md w-full space-y-8">
                        <div class="text-center">
                            <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Oops! Something went wrong</h2>
                            <p class="mt-2 text-sm text-gray-600">We're sorry, but there was an error loading the page.</p>
                            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p class="text-red-800 text-sm">${error.message || error}</p>
                            </div>
                            <div class="mt-6">
                                <a routerLink="curriculum" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    Back to Internship Menu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    }

    if (typeof window !== 'undefined') {
        window.InternshipApplication = InternshipApplication;
    }
}