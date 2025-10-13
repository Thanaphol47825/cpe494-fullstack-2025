if (typeof window !== 'undefined' && !window.InternshipApplication) {
    class InternshipApplication extends BaseModuleApplication {
        constructor(templateEngine) {
            super(templateEngine)
            
            this.setSubModuleBasePath('/curriculum/static/js')
            this.setupRoutes()
        }

        setupRoutes() {
            this.addRoute('', this.renderMainPage.bind(this))
            
            this.addRouteWithSubModule('/internshipreport', this.renderInternshipReport.bind(this), 'InternshipReportCreate.js')
            this.addRouteWithSubModule('/company', this.renderCompany.bind(this), 'CompanyCreate.js')
            this.addRouteWithSubModule('/internshipmentor', this.renderInternshipMentor.bind(this), 'InternshipMentorCreate.js')
            this.addRouteWithSubModule('/internshipattendance', this.renderInternshipAttendance.bind(this), 'InternshipAttendanceCreate.js')
            this.addRouteWithSubModule('/internshipcriteria', this.renderInternshipCriteria.bind(this), 'InternshipCriteriaCreate.js')
            this.addRouteWithSubModule('/internstudent', this.renderInternStudentList.bind(this), 'InternStudentList.js')
            this.addRouteWithSubModule('/internstudent/create', this.renderInternStudentCreate.bind(this), 'InternStudentCreate.js')
            this.addRouteWithSubModule('/internshipworkexperience/create', this.renderInternshipWorkExperience.bind(this), 'InternWorkExperienceCreate.js')
            this.addRouteWithSubModule('/internskill', this.renderInternSkill.bind(this), 'InternSkillCreate.js')
            this.addRouteWithSubModule('/internstudent/edit/:id', this.renderInternStudentEdit.bind(this), 'InternStudentEdit.js');

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
            { label: "Intern Student", route: "/internstudent" },
            { label: "Intern Student Create", route: "/internstudent/create"},
            { label: "Internship Work Experience Create", route: "/internshipworkexperience/create" },
            { label: "Intern Skill", route: "/internskill" },

        ]

        async renderMainPage() {
            if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
                document.head.appendChild(script);
            }

            let cardsHTML = '';
            this.models.forEach(model => {
                cardsHTML += `
                    <div class="group relative bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-slate-200 overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div class="relative p-8">
                            <div class="flex flex-col items-center text-center space-y-4">
                                <div class="w-16 h-16 bg-gradient-to-r ${this.getGradientForModel(model.label)} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-6">
                                    ${this.getIconForModel(model.label)}
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">${model.label}</h3>
                                    <p class="text-sm text-slate-500 mt-2 leading-relaxed">${this.getDescriptionForModel(model.label)}</p>
                                </div>
                                <div class="w-full pt-4">
                                    <a routerLink="internship${model.route}" class="w-full inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-xl bg-gradient-to-r ${this.getGradientForModel(model.label)} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group-hover:scale-110">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                        Manage
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            this.templateEngine.mainContainer.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
                    <!-- Background Pattern -->
                    <div class="absolute inset-0 opacity-30">
                        <div class="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full filter blur-3xl"></div>
                        <div class="absolute top-40 right-20 w-48 h-48 bg-purple-200 rounded-full filter blur-3xl"></div>
                        <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-indigo-200 rounded-full filter blur-3xl"></div>
                    </div>
                    
                    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <!-- Hero Header -->
                        <div class="text-center mb-16">
                            <div class="flex justify-center mb-8">
                                <div class="relative">
                                    <div class="w-24 h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 112-2V6m8 0H8"></path>
                                        </svg>
                                    </div>
                                    <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6">
                                Internship Management
                            </h1>
                            <p class="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
                                End-to-end internship management, company, mentor and evaluation
                                <br class="hidden md:block">
                            </p>

                        </div>

                        <!-- Navigation Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                            ${cardsHTML}
                        </div>
                    </div>
                </div>
            `;
        }

        getIconForModel(label) {
            const icons = {
                'internship report': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
                'Company': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>',
                'Internship Mentor': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>',
                'Internship Attendance': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>',
                'Internship Criteria': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>'
            }
            return icons[label] || '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'
        }

        getDescriptionForModel(label) {
            const descriptions = {
                'internship report': '',
                'Company': '',
                'Internship Mentor': '',
                'Internship Attendance': '',
                'Internship Criteria': ''
            }
            return descriptions[label] || ''
        }

        getGradientForModel(label) {
            const gradients = {
                'internship report': 'from-emerald-500 to-teal-600',
                'Company': 'from-blue-500 to-cyan-600', 
                'Internship Mentor': 'from-purple-500 to-indigo-600',
                'Internship Attendance': 'from-orange-500 to-red-600',
                'Internship Criteria': 'from-pink-500 to-rose-600'
            }
            return gradients[label] || 'from-gray-500 to-gray-600'
        }

        async renderInternshipReport() {
            console.log("Rendering Internship Report")
            if (window.InternshipReportCreate) {
                const reportCreate = new window.InternshipReportCreate(this.templateEngine)
                await reportCreate.render()
            } else {
                console.error("InternshipReportCreate class not found")
            }
        }

        async renderCompany() {
            console.log("Rendering Company")
            if (window.CompanyCreate) {
                const companyCreate = new window.CompanyCreate(this.templateEngine)
                await companyCreate.render()
            } else {
                console.error("CompanyCreate class not found")
            }
        }

        async renderInternStudentCreate() {
            console.log("Rendering Intern Student")
            if (window.InternStudentCreate) {
                const internStudentCreate = new window.InternStudentCreate(this.templateEngine)
                await internStudentCreate.render()
            } else {
                console.error("InternStudentCreate class not found")
            }
        }

        async renderInternStudentList() {
            console.log("Rendering Intern Student List")
            if (window.InternStudentList) {
                const internStudentList = new window.InternStudentList(this.templateEngine)
                await internStudentList.render()
            } else {
                console.error("InternStudentCreate class not found")
            }
        }
        
        async renderInternStudentEdit() {
            console.log("Rendering Intern Student Edit Form");
            const currentPath = this.templateEngine.getCurrentPath();
            const pathParts = currentPath.split('/');
            const internId = pathParts[pathParts.length - 1];
            
            if (window.InternStudentEdit) {
                const internStudentEdit = new window.InternStudentEdit(this.templateEngine, internId);
                await internStudentEdit.render();
            } else {
                console.error("InternStudentEdit class not found");
            }
        }

        async renderInternshipMentor() {
            console.log("Rendering Internship Mentor")
            if (window.InternshipMentorCreate) {
                const mentorCreate = new window.InternshipMentorCreate(this.templateEngine)
                await mentorCreate.render()
            } else {
                console.error("InternshipMentorCreate class not found")
            }
        }

        async renderInternshipAttendance() {
            console.log("Rendering Internship Attendance")
            if (window.InternshipAttendanceCreate) {
                const attendanceCreate = new window.InternshipAttendanceCreate(this.templateEngine)
                await attendanceCreate.render()
            } else {
                console.error("InternshipAttendanceCreate class not found")
            }
        }

        async renderInternshipCriteria() {
            console.log("Rendering Internship Criteria")
            if (window.InternshipCriteriaCreate) {
                const criteriaCreate = new window.InternshipCriteriaCreate(this.templateEngine)
                await criteriaCreate.render()
            } else {
                console.error("InternshipCriteriaCreate class not found")
            }
        }

        async renderInternshipWorkExperience() {
            console.log("Rendering Internship Work Experience")
            if (window.InternWorkExperienceCreate) {
                const workExperienceCreate = new window.InternWorkExperienceCreate(this.templateEngine)
                await workExperienceCreate.render()
            } else {
                console.error("InternWorkExperienceCreate class not found")
            }
        }

        async renderInternSkill() {
  console.log("Rendering Intern Skill")
  if (window.InternSkillCreate) {
    const page = new window.InternSkillCreate(this.templateEngine)
    await page.render()
  } else {
    console.error("InternSkillCreate class not found")
  }
}


        async render() {
            try {
                const handled = await this.handleRoute(this.templateEngine.getCurrentPath())
                if (handled) {
                    return true
                }

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