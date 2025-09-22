class InternshipCriteriaCreate {
    constructor(application) {
        this.application = application;
    }

    async render() {
        console.log("Create Internship Criteria Form");
        console.log(this.application);
        this.application.mainContainer.innerHTML = "Internship Criteria Form";
    }
}