class TemplateEngine{
	constructor(){
	}

	async fetchTemplate(){
		let URL = RootURL+"template";
		let response = await fetch(URL);
		this.template = await response.json();
	}

	async render(){
		this.mainContainer = document.getElementById("MainContainer");
		await this.fetchTemplate();
		let formContainer = this.create(Mustache.render(this.template.Form, {
			"action": RootURL+"handle",
			"method": "POST",
		}));
		this.mainContainer.append(formContainer);
		this.form = document.getElementById("MainForm");
		this.input = {};
		this.input.name = this.create(Mustache.render(this.template.TextInput, {
			"label": "Name",
			"name": "name",
			"ID": "NameInput"
		}));
		this.form.append(this.input.name);
		this.form.append(this.create(this.template.Submit));
		this.form.addEventListener("submit", this.submit)
	}

	create(code){
		let element = document.createElement('div');
		element.innerHTML = code;
		return element;
	}

	submit(event){
		event.preventDefault();
		console.log(document.getElementById("NameInput").value);
		return false;
	}
}