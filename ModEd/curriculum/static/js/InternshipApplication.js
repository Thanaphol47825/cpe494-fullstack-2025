class InternshipApplication {
    constructor(application) {
        this.application = application
    }

    models = [
        { label: "create internship criteria", script: "/curriculum/static/js/InternshipCriteriaCreate.js", className: "InternshipCriteriaCreate" },
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