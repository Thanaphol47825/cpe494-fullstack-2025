class ProjectApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with ProjectApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with ProjectApplication'
    return false
  }
}
