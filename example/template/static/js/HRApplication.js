class HRApplication{
    constructor(application){
        console.log(application);
        this.application = application;
    }

    async render(){
        console.log("Do something with HR.");
        console.log(this.application);
        this.application.mainContainer.innerHTML = "Overwritten with HR";
        return false;
    }
}