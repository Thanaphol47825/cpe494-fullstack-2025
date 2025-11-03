class SkillCreate {
   constructor(application) {
     this.application = application;
   }

  async handleSubmit(formData) {
    try {

    console.log("Submitting form data:", formData);
    if (!formData.Name || !formData.Name.toString().trim()) {
      alert("Please enter skill name.");
      return;
    }
    if (!formData.Description || !formData.Description.toString().trim()) {
      alert("Please enter description.");
      return;
    }

    const resp = await fetch(RootURL + "/curriculum/Skill/createSkill", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json();
      if (data.isSuccess) {
        alert("Skill saved!");
      } else {
        alert("Error: " + (data.result || "Failed to save"));
      }
    } catch (err) {
      alert("Error: " + (error || "Failed to save"));
    } 
    return false;
  }

  async render() {
    this.application.templateEngine.mainContainer.innerHTML = "";
    const formElement = await FormTemplate.getForm("SkillForm", "create");
    this.application.templateEngine.mainContainer.appendChild(formElement);

    this.form = new AdvanceFormRender(this.application.templateEngine, {
      modelPath: "curriculum/skill",
      targetSelector: "#skill-form",
      submitHandler: async (formData) => {
        console.log("Form submitted:", formData);
        await this.handleSubmit(formData);
      }
    });

    await this.form.render();
  }
}

if (typeof window !== 'undefined') {
  window.SkillCreate = SkillCreate;
}
