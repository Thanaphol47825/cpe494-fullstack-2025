class CurriculumApplication {
  constructor(application) {
    this.application = application
  }

  models = [
    { label: "create curriculum", script: "/curriculum/static/js/CurriculumCreate.js", className: "CurriculumCreate" },
    // { label: "create course", script: "/curriculum/static/js/CourseCreate.js", className: "CourseCreate" },
    // { label: "create class", script: "/curriculum/static/js/ClassCreate.js", className: "ClassCreate" },
    // { label: "create class material", script: "/curriculum/static/js/ClassMaterialCreate.js", className: "ClassMaterialCreate" },
    { label: "create course plan", script: "/curriculum/static/js/CoursePlanCreate.js", className: "CoursePlanCreate" },
  ]
  async render() {
    this.application.mainContainer.innerHTML = ""

    for (const model of this.models) {
      await this.application.fetchModule(model.script)
      let button = this.application.create(`
        <a href="#" id="${model.label.replace(/\s+/g, '')}">
          ${model.label}
        </a>`)
      let modelEngine = eval(`new ${model.className}(this.application)`)
      button.onclick = () => {
        return modelEngine.render()
      }
      this.application.mainContainer.append(button)
    }

    return false
  }
}