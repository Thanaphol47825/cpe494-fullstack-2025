const DATA_TYPE = {
	INTEGER: 1,
	FLOAT: 2,
	DOUBLE: 3,
	STRING: 4
};

const INPUT_TYPE = {
	TEXT: 10,
	SELECT: 20,
	RADIO: 30,
	CHECK_BOX: 40
};

class TemplateEngine{
	constructor(){
	}

	async fetchTemplate(){
		let URL = RootURL+"template";
		let response = await fetch(URL);
		this.template = await response.json();

		this.model = [
			{
				"name": "name",
				"type":  DATA_TYPE.STRING,
				"label": "Name",
				"input": {
					"type": INPUT_TYPE.TEXT
				}
			}, {
				"name": "surname",
				"type":  DATA_TYPE.STRING,
				"label": "Name"
			}
		];
	}

	async render(){
		await this.fetchTemplate();
		this.container = new DOMObject(this.template.MainContainer, {
			"title": "ModEd BackOffice",
		}, false);
		this.body = document.body;
		this.body.append(this.container.html);
		this.form = new FormRender(this, this.model);
		await this.form.render();
		this.table = new TableRender(this, this.model);
		await this.table.render();
		this.setElement(this.form.form);

		let object = this;
		this.container.dom.show.onclick = () => {object.container.dom.container.show();}
		let container = this.container.dom.container;
		this.container.dom.hide.onclick = container.hide.bind(container);
		this.container.dom.form.onclick = () => {
			object.setElement(object.form.form);
		}
		this.container.dom.table.onclick = () => {
			object.setElement(object.table.table);
		}
	}

	create(code){
		let element = document.createElement('div');
		element.innerHTML = code;
		return element.children[0];
	}

	setElement(element){
		this.container.dom.container.innerHTML = '';
		this.container.dom.container.append(element)
	}
}