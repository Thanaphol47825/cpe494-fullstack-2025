class InternshipApplication {
    constructor(application) {
        this.application = application
    }

    models = [
        // { label: "internship application", script: "/curriculum/static/js/InternshipApplicationCreate.js", className: "InternshipApplicationCreate" },
        { label: "internship report", script: "/curriculum/static/js/InternshipReportCreate.js", className: "InternshipReportCreate",route: "/internshipreport" },
        // { label: "internship evaluation", script: "/curriculum/static/js/InternshipEvaluationCreate.js", className: "InternshipEvaluationCreate" },
        { label: "Company", script: "/curriculum/static/js/CompanyCreate.js", className: "CompanyCreate", route: "/company" },
        { label: "Internship Mentor", script: "/curriculum/static/js/InternshipMentorCreate.js", className: "InternshipMentorCreate", route: "/internshipmentor" },
        { label: "Internship Attendance", script: "/curriculum/static/js/internshipAttendanceCreate.js", className: "InternshipAttendanceCreate", route: "/internshipattendance" },
        { label: "Internship Criteria", script: "/curriculum/static/js/InternshipCriteriaCreate.js", className: "InternshipCriteriaCreate", route: "/internshipcriteria" },
    ]

    async render() {
        
        if (!document.querySelector('script[src*="tailwindcss"]') && !document.querySelector('link[href*="tailwind"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            document.head.appendChild(script);
        }

        this.application.mainContainer.innerHTML = "<h2 class='text-2xl font-bold text-gray-800 mb-4'>Internship Models</h2>"

        for (const model of this.models) {
            await this.application.fetchModule(model.script)
            let button = this.application.create(`
                <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow mr-2 mb-2" id="${model.label.replace(/\s+/g, '')}">
                ${model.label}
                </button>
            `)
            let modelEngine = eval(`new ${model.className}(this.application)`)
            button.onclick = (e) => {
                e.preventDefault()
                return modelEngine.render()
            }
            this.application.mainContainer.append(button)
        }

        return false
    }
}