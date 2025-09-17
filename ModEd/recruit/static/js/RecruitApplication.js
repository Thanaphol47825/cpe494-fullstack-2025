class RecruitApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with RecruitApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with RecruitApplication'
    return false
  }
}
