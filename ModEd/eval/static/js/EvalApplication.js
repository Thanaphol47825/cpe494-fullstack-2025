class EvalApplication {
  constructor(application) {
    this.application = application
  }

  async render() {
    console.log('Do something with EvalApplication.')
    this.application.mainContainer.innerHTML = 'Overwritten with EvalApplication'
    return false
  }
}
