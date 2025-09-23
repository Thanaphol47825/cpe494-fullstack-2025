let LOCALE = {};

class DOMObject{
	constructor(template, data, isEmbeddedTemplate=true){
		this.html;
		this.dom;
		this.data;
		this.requireTag = {};
		this.localizeTag = [];
		if (data == undefined) data = {};
		this.data = data;
		data.localize = this.localize;
		if (isEmbeddedTemplate){
			let embedded = document.getElementById(template);
			if(embedded){
				template = embedded.innerHTML;
			}else{
				let message = `Template with ID ${template} cannot be found.`
				console.error(message);
				throw message;
			}
		}
		let text = Mustache.render(template, data);
		this.html = this.createElement(text);
		if (this.html == null) return;
		this.dom = this.getObject(this.html);
		this.initTagEvent('', this.html);
		this.renderLocalize();
	}

	static getBody(){
		return document.getElementsByTagName("body")[0];
	}

	localize() {
		return function(val, render) {
			if (LOCALE[val] == undefined) {
				setTextLocale(val);
				return val;
			} else {
				return LOCALE[val];
			}
		};
	}

	createElement(text){
		text = text.trim();
		if (text.indexOf('<tr') == 0) {
			const table = document.createElement('table');
			table.insertAdjacentHTML('beforeend', text);
			return table.firstChild.firstChild;
		} else {
			const div = document.createElement('div');
			div.innerHTML = text;
			return div.firstChild; 
		}
	}

	getObject(dom){
		let tag = {}
		this.walk(dom, tag);
		return tag;
	}

	createObjectTree(tag, rel, node){
		let object = this;
		let relList = rel.split('.');
		if (relList.length > 1) {
			let currentTag = tag;
			for (let i=0; i < relList.length; i++) {
				if (currentTag[relList[i]] == undefined) currentTag[relList[i]] = {}
				if (i == relList.length-1) currentTag[relList[i]] = node;
				currentTag = currentTag[relList[i]];
			}
			initAttributeEvent(relList, node);
		} else {
			tag[rel] = node;
			object.initAttributeEvent(rel, node);
		}
		return tag;
	}

	walk(node, tag){
		let object = this;
		let rel = node.getAttribute('rel');
		if (rel != null) {
			object.createObjectTree(tag, rel, node);
		}
		object.setLocalizeTag(node);
		const children = node.children;
		for (let i = 0; i < children.length; i++) {
			let rel = children[i].getAttribute('rel');
			if (rel != null) {
				object.createObjectTree(tag, rel, children[i]);
			}
			object.walk(children[i], tag);
		}
	}

	setRequireTag(atrribute, tag){
		if (tag.getAttribute('required') == null) return;
		if (tag.getAttribute('required').length > 0) {
			let name = tag.getAttribute('required');
			if (object.requireTag[name] == undefined) object.requireTag[name] = {type: tag.type, tag: [], rel: atrribute}
			if (object.requireTag[name].tag.indexOf(tag) == -1) object.requireTag[name].tag.push(tag);
		} else if (tag.tagName == "SELECT") {
			object.requireTag[atrribute] = {type: 'select', tag: tag};
		} else {
			object.requireTag[atrribute] = {type: tag.type, tag: tag};
		}
	}

	setLocalizeTag(tag){
		if (tag.getAttribute('localize') == null) return;
		object.localizeTag.push(tag);
	}

	renderLocalize(){
		let object = this;
		let texts = [];
		for (let i in object.localizeTag) {
			let tag = object.localizeTag[i];
			if (tag.tagName == 'DIV') {
				if (LOCALE[tag.innerHTML] != undefined) tag.innerHTML = LOCALE[tag.innerHTML];
				else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			} else if (tag.tagName == 'LABEL') {
				if (LOCALE[tag.innerHTML] != undefined) tag.innerHTML = LOCALE[tag.innerHTML];
				else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			} else if (tag.tagName == 'A') {
				if (LOCALE[tag.innerHTML] != undefined) tag.innerHTML = LOCALE[tag.innerHTML];
				else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			} else if (tag.tagName == 'TEXTAREA') {
				if (LOCALE[tag.placeholder] != undefined) tag.placeholder = LOCALE[tag.placeholder];
				else if (tag.placeholder.length > 0) texts.push(tag.placeholder);
			} else if (tag.tagName == 'TD' || tag.tagName == 'TH') {
				if (LOCALE[tag.innerHTML] != undefined) tag.innerHTML = LOCALE[tag.innerHTML];
				else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
			} else if (tag.tagName == 'INPUT') {
				if (tag.type == 'text' || tag.type == 'password' || tag.type == "number") {
					if (tag.placeholder.length > 0 && LOCALE[tag.placeholder] != undefined) {
						tag.placeholder = LOCALE[tag.placeholder];
					} else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
				}
			} else if (tag.tagName == 'SELECT') {
				let length = tag.options.length;
				for (let index=0; index < length; index++) {
					let option = tag.options[index];
					if (option.text.length > 0 && LOCALE[option.text] != undefined) {
						option.text = LOCALE[option.text];
					} else if (tag.innerHTML.length > 0) texts.push(tag.innerHTML);
				}
			}
		}
	}

	initAttributeEvent(attribute, tag){
		let object = this;
		object.setRequireTag(attribute, tag);
		object.initTagEvent(attribute, tag);
		if (object.data == null || object.data == undefined || Object.keys(object.data).length == 0) return;
		let data = object.data;
		if (typeof(attribute) == 'object') {
			for (let i=0; i < attribute.length; i++) {
				if (data[attribute[i]] == undefined) return;
				if (i == attribute.length-1) {
					attribute = attribute[i];
					break;
				} else data = data[attribute[i]];
			}
		}
		if (data[attribute] == undefined) return;
		if (data._value == undefined) data._value = {};
		data._value[attribute] = data[attribute];
		if (data._tags == undefined) data._tags = {};
		if (data._tags[attribute] == undefined) data._tags[attribute] = []
		if (!data._tags[attribute].includes(tag)) data._tags[attribute].push(tag);
		
		Object.defineProperty(data, attribute, {
			get: function(){
				return this._value[attribute];
			},
			set: function(value){
				this._value[attribute] = value;
				object.setValueFromTag(data._tags[attribute], this._value[attribute]);
			}
		});

		tag.onchange = function(event) {
			console.log(this, data[attribute]);
		}
	}
	

	getData(isShowOnly, isShowError) {
		if (isShowOnly == undefined) isShowOnly = false;
		if (isShowError == undefined) isShowError = true;
		let isPass = true;
		let data = {};
		let object = this;
		for (let i in object.requireTag) {
			if (object.requireTag[i].tag.offsetParent == null && !Array.isArray(object.requireTag[i].tag)) {
				object.requireTag[i].tag.classList.remove('error');
				continue;
			}
			let classList = object.requireTag[i].tag.offsetParent.classList;
			classList = new Array(...classList);
			if ((object.requireTag[i].tag.offsetParent == null || classList.includes('hidden')) && isShowOnly) continue;
			if (object.requireTag[i].type == 'text' || object.requireTag[i].type == 'password' || object.requireTag[i].type == "number") {
				if (object.requireTag[i].tag.value.length == 0) {
					if (isShowError) object.requireTag[i].tag.classList.add('error');
					isPass = false;
				} else {
					if (object.requireTag[i].type == "number") {
						data[i] = parseFloat(object.requireTag[i].tag.value);
					} else {
						data[i] = object.requireTag[i].tag.value;
					}
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'select') {
				if (object.requireTag[i].tag.value == -1) {
					if (isShowError) object.requireTag[i].tag.classList.add('error');
					isPass = false;
				} else {
					data[i] = parseInt(object.requireTag[i].tag.value);
					if (isNaN(data[i])) data[i] = object.requireTag[i].tag.value;
					object.requireTag[i].tag.classList.remove('error');
				}
			} else if (object.requireTag[i].type == 'radio') {
				let isChecked = false;
				let value = -1;
				for (let j in object.requireTag[i].tag) {
					if (object.requireTag[i].tag[j].checked) {
						isChecked = true;
						value = parseInt(object.requireTag[i].tag[j].getAttribute('value'));
					}
				}
				if (!isChecked) isPass = false;
				else data[i] = value;
				for (let j in object.requireTag[i].tag) {
					let rel = object.requireTag[i].tag[j].getAttribute('rel');
					if (object.dom[rel+'Label'] != undefined) {
						if (isChecked) object.dom[rel+'Label'].classList.remove('error');
						else {
							if (isShowError) object.dom[rel+'Label'].classList.add('error');
						}
					}
				}
			} else if (object.requireTag[i].type == 'checkbox') {
				let isChecked = false;
				let value = [];
				for (let j in object.requireTag[i].tag) {
					if (object.requireTag[i].tag[j].checked) {
						isChecked = true;
						value.push(parseInt(object.requireTag[i].tag[j].getAttribute('value')));
					}
				}
				if (!isChecked) isPass = false;
				else data[i] = value;
				for (let j in object.requireTag[i].tag) {
					let rel = object.requireTag[i].tag[j].getAttribute('rel');
					if (object.dom[rel+'Label'] != undefined) {
						if (isChecked) object.dom[rel+'Label'].classList.remove('error');
						else { 
							if (isShowError) object.dom[rel+'Label'].classList.add('error');
						}
					}
				}
			}
		}
		for (let i in object.dom) {
			if (object.dom[i].tagName == "DIV") continue;
			if (data[i] != undefined) continue;
			data[i] = object.getValueFromTag(object.dom[i]);
		}
		return {isPass, data}
	}

	initTagEvent(attribute, tag) {
		let object = this;
		if (tag.tagName == 'LABEL') {
			if (attribute.indexOf('Label') != -1) {
				let inputKey = attribute.replace('Label', '');
				tag.onclick = function() {
					if (object.dom[inputKey] != undefined) {
						object.dom[inputKey].click();
					}
				}
			}
		}
		tag.set = function(domObject, key) {
			if (key != undefined) {
				if (this[key] == undefined) this[key] = domObject.dom;
				object.localizeTag.push(...domObject.localizeTag);
				this.appendChild(domObject.html);
			}
		}
		tag.append = function(domObject, key) {
			let item;
			if (key != undefined) {
				if (this[key] == undefined) this[key] = [];
				this[key].push(domObject.dom);
			} else {
				item = this;
				for (let i in domObject.dom) {
					if (item[i] == undefined) {
						item[i] = domObject.dom[i];
					} else if (item[i].tagName != undefined) {
						item[i] = [item[i]];
						item[i].push(domObject.dom[i]);
					} else {
						item[i].push(domObject.dom[i]);
					}
				}
			}
			object.localizeTag.push(...domObject.localizeTag);
			this.appendChild(domObject.html);
		}
		tag.prepend = function(domObject, key) {
			let item;
			if (key != undefined) {
				if (this[key] == undefined) this[key] = domObject.dom;
				else {
					if (!Array.isArray(this[key])) this[key] = [this[key]];
					this[key].unshift(domObject.dom);
				}
			} else {
				item = this;
				for (let i in domObject.dom) {
					if (item[i] == undefined) item[i] = domObject.dom[i];
					else if (item[i].tagName != undefined) {
						item[i] = [item[i]];
						item[i].unshift(domObject.dom[i]);
					} else {
						item[i].unshift(domObject.dom[i]);
					}
				}
			}
			object.localizeTag.push(...domObject.localizeTag);
			tag.insertBefore(domObject.html, tag.firstChild);
		}
		tag.hide = function() {
			this.classList.add('hidden');
		}
		tag.visibility = function(isVisibility) {
			if (isVisibility == undefined) return this.classList.contains('visibility-hidden');
			if (isVisibility) this.classList.remove('visibility-hidden');
			else this.classList.add('visibility-hidden');
		}
		tag.show = function() {
			this.classList.remove('hidden');
		}
		tag.toggle = function() {
			this.classList.toggle("hidden");
		}
		tag.html = function(html) {
			if (html == undefined) return this.innerHTML;
			if (tag.tagName == "DIV") {
				this.innerHTML = '';
				if (html.length == 0) return;
				if (typeof(html) == 'string') html = new DOMObject(html)
				this.appendChild(html);
			} else if (tag.tagName == "SELECT") {
				this.innerHTML = '';
				if (html.length == 0) return;
				if (typeof(html) == 'string') html = new DOMObject(html)
				this.appendChild(html);
			}
		}

		tag.complete = function(data, config, callback) {
			if (tag.autocompleteObject == undefined) {
				tag.autocompleteObject = new Autocomplete();
				tag.autocompleteObject.init(tag, config);
				tag.autocompleteObject.setData(data, callback);
				tag.autocompleteObject.autocomplete();
			} else {
				tag.autocompleteObject.setData(data, callback);
			}
		}

		tag.getValue = function() {
			return object.getValueFromTag(tag);
		}
	}

	getValueFromTag(tag){
		if (tag.tagName == "DIV") {
			return tag.innerHTML;
		} else if (tag.tagName == "SELECT") {
			return tag.value;
		} else if (tag.tagName == "INPUT") {
			if (tag.type == "text") return tag.value;
			if (tag.type == "password") return tag.value;
			if (tag.type == "number") {
				let value = parseFloat(tag.value);
				if (isNaN(value)) return 0;
				return value;
			} if (tag.type == "checkbox") return tag.checked;
			return tag.value;
		} else if (tag.tagName == "OPTION") {
			return tag.innerText;
		} else if (tag.tagName == "TEXTAREA") {
			return tag.value;
		} 
	}

	setValueFromTag(tags, value){
		for (let i in tags) {
			let tag = tags[i];
			this.setTagValue(tag, value);
		}
	}

	setTagValue(tag, value){
		if (tag.tagName == "DIV") {
			tag.innerHTML = value;
		} else if (tag.tagName == "SELECT") {
			tag.value = value;
		} else if (tag.tagName == "INPUT") {
			tag.value = value;
		} else if (tag.tagName == "OPTION") {
			tag.innerText = value;
		} else if (tag.tagName == "TEXTAREA") {
			tag.value = value;
		}
	}

	resetTagValue(tag){
		if (tag.tagName == "DIV") {
			tag.innerHTML = '';
		} else if (tag.tagName == "SELECT") {
			tag.value = -1;
		} else if (tag.tagName == "INPUT") {
			if (tag.type == "text") tag.value = "";
			if (tag.type == "password") tag.value = "";
			if (tag.type == "number") tag.value = 0;
			if (tag.type == "checkbox") tag.checked = false;
			tag.value = "";
		} else if (tag.tagName == "TEXTAREA") {
			tag.value = "";
		}
	}

	setData(data){
		let object = this;
		for (let i in data) {
			if (object.dom[i] != undefined) object.setTagValue(object.dom[i], data[i]);
		}
	}
}