class CourseCreate {
   constructor(application) {
     this.application = application;
   }
   getCurriculumsOption = async () => {
    const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ([]));
    const list = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : []);

    return list.map(item => ({
      value: item.ID,
      label: item.Name || `#${item.ID}`
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const form = document.getElementById("curriculum-form");
    const btn = form.querySelector('button[type="submit"]');
    const original = btn?.textContent;
    btn?.setAttribute("disabled", "true");
    if (btn) btn.textContent = "Saving...";
    try {
      const formData = new FormData(form);
      const payload = {
        Name: (formData.get('Name') || '').toString().trim(),
        Description: (formData.get('Description') || '').toString().trim(),
        CurriculumId: parseInt(formData.get('CurriculumId') || '0', 10),
        Optional: (formData.get('Optional') || '') === 'true',
        CourseStatus: parseInt(formData.get('CourseStatus') || '0', 10),
      };

      if (!payload.Name) {
        alert('Please enter course name');
        return;
      }
      if (!Number.isInteger(payload.CurriculumId) || payload.CurriculumId <= 0) {
        alert('Please select a curriculum');
        return;
      }
      if (![0,1].includes(payload.CourseStatus)) {
        alert('Please select course status');
        return;
      }

      const resp = await fetch(`${RootURL}/curriculum/Course/createCourse`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await resp.json(); } catch {}

      if (!resp.ok) {
        const msg = data?.message || data?.error?.message || data?.error || `Request failed (${resp.status})`;
        alert('Error: ' + msg);
        return;
      }

      if (!data.isSuccess) {
        alert('Error: ' + (data.result || 'failed to create course'));
      } else {
        alert('Save: success');
        form.reset();
      }
    } catch (err) {
      alert('Network error');
    } finally {
      btn?.removeAttribute("disabled");
      if (btn) btn.textContent = original || "Create Course";
    } 
  }

  formWrapperTemplate = `
    <div class="bg-gray-100 min-h-screen py-8">
      <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">Course</h1>
      <form method="POST" id="curriculum-form" class="form-container">
        <div id="form-fields"></div>
        <button type="submit" class="form-submit-btn">Create Course</button>
      </form>
      <div style="margin-top: 20px;">
        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
      </div>
    </div>
  `;

  render = async () => {
    this.application.templateEngine.mainContainer.innerHTML = "";
    const view = this.application.templateEngine.create(Mustache.render(this.formWrapperTemplate, {}));
    this.application.templateEngine.mainContainer.append(view);

    const curriculumsOption = await this.getCurriculumsOption();
    const fields = [
      { Id: "name", Label: "Name", Type: "text", Name: "Name", Required: true, Placeholder: "Enter Course Name" },
      { Id: "description", Label: "Description", Type: "text", Name: "Description", Placeholder: "Enter Course Description" },
      { Id: "curriculum_id", Label: "Curriculum", Type: "select", Name: "CurriculumId", Required: true, options: curriculumsOption },
      {
        Id: "optional", Label: "Optional", Type: "select", Name: "Optional", Required: true,
        options: [
          { label: "Required", value: "false" },
          { label: "Optional", value: "true" }
        ]
      },
      {
        Id: "status", Label: "Course Status", Type: "select", Name: "CourseStatus", Required: true,
        options: [
          { label: "Active", value: 1 },
          { label: "Inactive", value: 0 }
        ]
      },
    ];

    const fieldsContainer = document.getElementById('form-fields');
    fields.forEach(field => {
      let inputHTML = '';

      if (field.Type === "select" && this.application.templateEngine.template?.Select) {
        inputHTML = Mustache.render(this.application.templateEngine.template.Select, field);
      } else if (field.Type === "select" && this.application.templateEngine.template?.SelectInput) {
        inputHTML = Mustache.render(this.application.templateEngine.template.SelectInput, field);
      } else if (this.application.templateEngine.template?.Input) {
        inputHTML = Mustache.render(this.application.templateEngine.template.Input, field);
      }

      if (inputHTML) {
        fieldsContainer.appendChild(this.application.templateEngine.create(inputHTML));
      }
    });

    const formHandler = document.getElementById('curriculum-form');
    formHandler.addEventListener('submit', this.handleSubmit.bind(this));
  };
}

if (typeof window !== 'undefined') {
  window.CourseCreate = CourseCreate;
}
