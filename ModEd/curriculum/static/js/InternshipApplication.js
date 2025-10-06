if (typeof window !== 'undefined' && window.HrApplication) { } else {
    class InternshipApplication extends BaseModuleApplication {
        constructor(application) {
            super(application)

            this.setupRoutes()
        }

        setupRoutes() {
            this.setSubModuleBasePath('/curriculum/static/js')
            
            // Set default route to show the main module list
            this.setDefaultRoute('')
            
            // Add routes for each model
            this.addRoute('', this.render.bind(this)) // Main module list
            this.addRouteWithSubModule('/internshipreport', this.renderInternshipReport.bind(this), 'InternshipReportCreate.js')
            this.addRouteWithSubModule('/company', this.renderCompany.bind(this), 'CompanyCreate.js')
            this.addRouteWithSubModule('/internshipmentor', this.renderInternshipMentor.bind(this), 'InternshipMentorCreate.js')
            this.addRouteWithSubModule('/internshipattendance', this.renderInternshipAttendance.bind(this), 'internshipAttendanceCreate.js')
            this.addRouteWithSubModule('/internshipcriteria', this.renderInternshipCriteria.bind(this), 'InternshipCriteriaCreate.js')
        }

        models = [
            // { label: "internship application", script: "/curriculum/static/js/InternshipApplicationCreate.js", className: "InternshipApplicationCreate" },
            { label: "internship report", script: "/curriculum/static/js/InternshipReportCreate.js", className: "InternshipReportCreate", route: "/internshipreport" },
            // { label: "internship evaluation", script: "/curriculum/static/js/InternshipEvaluationCreate.js", className: "InternshipEvaluationCreate" },
            { label: "Company", script: "/curriculum/static/js/CompanyCreate.js", className: "CompanyCreate", route: "/company" },
            { label: "Internship Mentor", script: "/curriculum/static/js/InternshipMentorCreate.js", className: "InternshipMentorCreate", route: "/internshipmentor" },
            { label: "Internship Attendance", script: "/curriculum/static/js/internshipAttendanceCreate.js", className: "InternshipAttendanceCreate", route: "/internshipattendance" },
            { label: "Internship Criteria", script: "/curriculum/static/js/InternshipCriteriaCreate.js", className: "InternshipCriteriaCreate", route: "/internshipcriteria" },
        ]

        async render() {
            // Try to handle sub-routing first
            const handled = await this.handleRoute(this.application.getCurrentPath())
            if (handled) {
                return true
            }

            // Default render - show module list
            return this.renderModuleList()
        }

        async renderModuleList() {
            if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
                document.head.appendChild(script);
            }

            this.application.mainContainer.innerHTML = "<h2 class='text-2xl font-bold text-gray-800 mb-4'>Internship Models</h2>"

            for (const model of this.models) {
                await this.application.fetchModule(model.script)
                let button = this.application.create(`
                    <button routerLink="${this.getModuleBasePath()}${model.route}" type="button" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow mr-2 mb-2" id="${model.label.replace(/\s+/g, '')}">
                    ${model.label}
                    </button>
                `)
                this.application.mainContainer.append(button)
            }

            return false
        }

        // Individual render methods for sub-routes
        async renderInternshipReport() {
            console.log("Rendering Internship Report")
            if (window.InternshipReportCreate) {
                const reportCreate = new window.InternshipReportCreate(this.application)
                await reportCreate.render()
            }
        }

        async renderCompany() {
            console.log("Rendering Company")
            if (window.CompanyCreate) {
                const companyCreate = new window.CompanyCreate(this.application)
                await companyCreate.render()
            }
        }

        async renderInternshipMentor() {
            console.log("Rendering Internship Mentor")
            if (window.InternshipMentorCreate) {
                const mentorCreate = new window.InternshipMentorCreate(this.application)
                await mentorCreate.render()
            }
        }

        async renderInternshipAttendance() {
            console.log("Rendering Internship Attendance")
            if (window.InternshipAttendanceCreate) {
                const attendanceCreate = new window.InternshipAttendanceCreate(this.application)
                await attendanceCreate.render()
            }
        }

        async renderInternshipCriteria() {
            console.log("Rendering Internship Criteria")
            if (window.InternshipCriteriaCreate) {
                const criteriaCreate = new window.InternshipCriteriaCreate(this.application)
                await criteriaCreate.render()
            }
        }
    }
}