class FormRender {
  constructor(application, schema, targetSelector = "MainContainer") {
    this.application = application;
    this.schema = schema;
    this.targetSelector = targetSelector; 
  }

  async render() {
    this.form = new DOMObject(this.application.template.Form, {
      action: RootURL + "handle",
      method: "POST",
    }, false);

    for (const f of this.schema) {
      const dom = new DOMObject(this.application.template.TextInput, {
        label: f.label,
        name: f.name,
        type: f.type,
      }, false);
      this.form.dom.inputContainer.append(dom);
    }

    this.form.html.addEventListener("submit", this.submit.bind(this));

    const container = document.querySelector(this.targetSelector);
    if (container) container.appendChild(this.form.html);
    else console.warn(`Container '${this.targetSelector}' not found`);

    return this.form;
  }

  submit(e) {
    e.preventDefault();
    return false;
  }
}
