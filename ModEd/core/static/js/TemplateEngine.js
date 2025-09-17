class TemplateEngine {
  constructor() {}

  async fetchModule(path) {
    let URL = RootURL + path
    let script = document.createElement('script')
    script.src = URL
    document.head.appendChild(script)
    return new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
    })
  }

  async render() {
    this.mainContainer = document.getElementById('MainContainer')

    for (const module of modules) {
      await this.fetchModule(module.script)
      let button = this.create(`
        <a href="#" id="${module.label}">
          ${module.label}
        </a>`)
      let moduleEngine = eval(`new ${module.className}(this)`)
      button.onclick = () => {
        return moduleEngine.render()
      }
      this.mainContainer.append(button)
    }
  }

  create(code) {
    let element = document.createElement('div')
    element.innerHTML = code
    return element
  }
}
