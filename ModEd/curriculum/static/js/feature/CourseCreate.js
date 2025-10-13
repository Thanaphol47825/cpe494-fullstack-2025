class CourseCreate {
   constructor(application) {
     this.application = application;
   }

  async handleSubmit(formData) {
    try {

    console.log("Submitting form data:", formData);
    if (!formData.Name || !formData.Name.toString().trim()) {
      alert("Please enter course name.");
      return;
    }
    if (!formData.Description || !formData.Description.toString().trim()) {
      alert("Please enter description.");
      return;
    }
    if (!formData.CurriculumId) {
      alert("Please select a curriculum.");
      return;
    }
    if (formData.CourseStatus != 0 && formData.CourseStatus != 1) {
      alert("Please select a course status.");
       return;
    }

    formData.CurriculumId = parseInt(formData.CurriculumId);
    formData.CourseStatus = parseInt(formData.CourseStatus);
    formData.Optional = !!formData.Optional;

    const resp = await fetch(RootURL + "/curriculum/Course/createCourse", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json();
      if (data.isSuccess) {
        alert("Course saved!");
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
    const formElement = await FormTemplate.getForm("CourseForm", "create");
    this.application.templateEngine.mainContainer.appendChild(formElement);

    this.form = new AdvanceFormRender(this.application.templateEngine, {
      modelPath: "curriculum/Course",
      targetSelector: "#course-form",
      submitHandler: async (formData) => {
        console.log("Form submitted:", formData);
        await this.handleSubmit(formData);
      }
    });

    await this.form.render();
  }
}

if (typeof window !== 'undefined') {
  window.CourseCreate = CourseCreate;
}
