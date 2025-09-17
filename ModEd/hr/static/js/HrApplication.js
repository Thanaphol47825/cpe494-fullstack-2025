class HrApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with HrApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with HrApplication'
    return false
  }
}
