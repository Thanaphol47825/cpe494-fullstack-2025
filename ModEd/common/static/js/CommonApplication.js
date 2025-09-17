class CommonApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with CommonApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with CommonApplication'
    return false
  }
}
