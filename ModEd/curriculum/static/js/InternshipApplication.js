class InternshipApplication {
    constructor(application) {
        this.application = application
    }

    models = [
        { label: "internship application", script: "/curriculum/static/js/InternshipApplicationCreate.js", className: "InternshipApplicationCreate" },
        { label: "internship report", script: "/curriculum/static/js/InternshipReportCreate.js", className: "InternshipReportCreate" },
        { label: "internship evaluation", script: "/curriculum/static/js/InternshipEvaluationCreate.js", className: "InternshipEvaluationCreate" },
        { label: "internship mentor", script: "/curriculum/static/js/InternshipMentorCreate.js", className: "InternshipMentorCreate" },
        { label: "internship attendance", script: "/curriculum/static/js/InternshipAttendanceCreate.js", className: "InternshipAttendanceCreate" },
        { label: "internship criteria", script: "/curriculum/static/js/InternshipCriteriaCreate.js", className: "InternshipCriteriaCreate" },
    ]

    async render() {
        this.application.mainContainer.innerHTML = ""

        for (const model of this.models) {
            await this.application.fetchModule(model.script)
            let button = this.application.create(`
                <a href="#" id="${model.label.replace(/\s+/g, '')}">
                ${model.label}
                </a>
            `)
            let modelEngine = eval(`new ${model.className}(this.application)`)
            button.onclick = () => {
                return modelEngine.render()
            }
            this.application.mainContainer.append(button)
        }

        return false
    }
}