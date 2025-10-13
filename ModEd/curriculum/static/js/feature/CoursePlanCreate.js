if (typeof window !== 'undefined' && !window.CoursePlanCreate) {
  class CoursePlanCreate {
    constructor(application) {
      this.application = application;
    }

    async handleSubmit(formData) {
      try {
        console.log("Submitting CoursePlan form data:", formData);

        // --- Basic validation ---
        if (!formData.CourseId) {
          alert("Please select a course.");
          return false;
        }
        if (!formData.date) {
          alert("Please select date & time.");
          return false;
        }
        if (!formData.week) {
          alert("Please enter week number.");
          return false;
        }

        // Normalize types
        const courseId = parseInt(formData.CourseId);
        const week = parseInt(formData.week);

        // Convert datetime-local (browser local) -> RFC3339 (ISO)
        let dateISO = null;
        const dt = new Date(formData.date);
        if (!isNaN(dt.getTime())) {
          dateISO = dt.toISOString();
        } else {
          alert("Invalid date/time format.");
          return false;
        }

        const payload = {
          CourseId: courseId,
          date: dateISO,
          week,
          topic: formData.topic || "",
          description: formData.description || ""
        };

        const resp = await fetch(RootURL + "/curriculum/CoursePlan/createCoursePlan", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await resp.json().catch(() => ({}));
        if (data?.isSuccess) {
          alert("Course Plan saved!");
          // reset form if the element exists
          // const formEl = document.querySelector('#course-plan-form');
          // if (formEl) formEl.reset();
        } else {
          alert("Error: " + (data?.result || data?.message || `Failed to save (HTTP ${resp.status})`));
        }
      } catch (error) {
        alert("Error: " + (error?.message || error || "Failed to save"));
      }

      // prevent default submit navigation
      return false;
    }

    async render() {
      // clear application container
      this.application.templateEngine.mainContainer.innerHTML = "";

      const formElement = await FormTemplate.getForm('CoursePlanForm', 'create');
      this.application.templateEngine.mainContainer.appendChild(formElement);

      // ใช้ AdvanceFormRender ตาม model meta path "curriculum/courseplan"
      this.form = new AdvanceFormRender(this.application.templateEngine, {
        modelPath: "curriculum/courseplan",
        targetSelector: "#course-plan-form",
        submitHandler: this.handleSubmit.bind(this),
      });

      await this.form.render();
    }
  }

  // Make available globally
  window.CoursePlanCreate = CoursePlanCreate;
}