class FormRender{
	constructor(application, model){
		this.application = application;
		this.model = model;
	}

	async render(){
		this.form = new DOMObject(this.application.template.Form, {
			"action": RootURL+"handle",
			"method": "POST",
		}, false);
		this.input = {};
		this.input.name = new DOMObject(this.application.template.TextInput, {
			"label": "Name",
			"name": "name",
		}, false);
		this.form.dom.inputContainer.append(this.input.name);
		this.form.html.addEventListener("submit", this.submit.bind(this));
		return this.form;
	}

	submit(event){
		event.preventDefault();
		// console.log(document.getElementById("NameInput").value);
		console.log(this.input.name.dom.input.value);
		return false;
	}
}