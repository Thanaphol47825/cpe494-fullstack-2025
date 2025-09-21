class CurriculumApplication {
  constructor(application) {
    this.application = application
  }

  model = ["Create Curriculum", "Create Class", "Create Class Material", "Create Student", "Create Instructor", "Test"]

  async render() {
    this.application.mainContainer.innerHTML = ""
    
    this.model.forEach((item) => {
      let button = this.application.create(
        `<a href="#" id="${item.replace(/\s+/g, '')}">
          ${item}
        </a>`,
      )
      button.onclick = () => console.log(eval(`new ${item.replace(/\s+/g, '')}(this).render()`))
      
      this.application.mainContainer.append(button)
    })

    return false
  }
}