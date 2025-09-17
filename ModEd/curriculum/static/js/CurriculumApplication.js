class CurriculumApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with CurriculumApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with CurriculumApplication'
    return false
  }
}
