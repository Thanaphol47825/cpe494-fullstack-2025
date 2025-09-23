class TableRender{
	constructor(application, model){
		this.application = application;
		this.model = model;
	}

	async render(){
		let data = [
			{
				"ID": 111,
				"name": "Kittipong",
				"surname": "Piyawanno"
			}, {
				"ID": 112,
				"name": "Steve",
				"surname": "Roger"
			}, {
				"ID": 113,
				"name": "Luffy",
				"surname": "Monkey D."
			}
		];
		this.table = new DOMObject(this.application.template.Table, {}, false);
		this.row = [];
		for(var i of data){
			let row = new DOMObject(this.application.template.TableRow, i, false);
			((item) => {
				row.dom.ID.onclick = () => {
					alert(`Hello ${item.name} ${item.surname}`);
					return false;
				}
			})(i);
			this.row.push(row);
			this.table.dom.body.append(row);
		}
		return this.table;
	}
}