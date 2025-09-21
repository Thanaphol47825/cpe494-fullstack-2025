class CurriculumCreate {
    constructor(application) {
        console.log(application);
        this.application = application;
    }

    async render() {
        console.log("Create Curriculum Form");
        console.log(this.application);
        this.application.mainContainer.innerHTML = "Test Curriculum Form";
    }
}