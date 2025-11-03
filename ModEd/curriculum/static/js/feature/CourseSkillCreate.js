class CourseSkillCreate {
   constructor(application) {
     this.application = application;
   }

  async handleSubmit(formData) {
    try {

    console.log("Submitting form data:", formData);
    if (!formData.CourseId) {
      alert("Please select a course.");
      return;
    }
    if (!formData.SkillId) {
      alert("Please select at least one skill.");
      return;
    }

    // Check if SkillId is array (multiple selection)
    if (Array.isArray(formData.SkillId)) {
      if (formData.SkillId.length > 3) {
        alert("You can select maximum 3 skills only.");
        return;
      }
      if (formData.SkillId.length === 0) {
        alert("Please select at least one skill.");
        return;
      }
    }

    formData.CourseId = parseInt(formData.CourseId);
    // Handle both single and multiple SkillId
    if (Array.isArray(formData.SkillId)) {
      formData.SkillId = formData.SkillId.map(id => parseInt(id));
    } else {
      formData.SkillId = parseInt(formData.SkillId);
    }

    const resp = await fetch(RootURL + "/curriculum/CourseSkill/createCourseSkill", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json();
      if (data.isSuccess) {
        alert("Course Skill saved!");
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
    const formElement = await FormTemplate.getForm("CourseSkillForm", "create");
    this.application.templateEngine.mainContainer.appendChild(formElement);

    this.form = new AdvanceFormRender(this.application.templateEngine, {
      modelPath: "curriculum/courseskill",
      targetSelector: "#courseskill-form",
      submitHandler: async (formData) => {
        console.log("Form submitted:", formData);
        await this.handleSubmit(formData);
      }
    });

    await this.form.render();
  }
}

if (typeof window !== 'undefined') {
  window.CourseSkillCreate = CourseSkillCreate;
}
