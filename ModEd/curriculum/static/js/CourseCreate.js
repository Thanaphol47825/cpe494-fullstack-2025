class CourseCreate {
   constructor(application) {
     this.application = application;
   }

  async getCurriculums() {
    try {
      const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const select = document.createElement("select");
      select.name = "CurriculumId";
      select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select a curriculum --";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      const list = Array.isArray(data?.result) ? data.result : [];
      list.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ID;
        option.textContent = item.Name;
        select.appendChild(option);
      });

      return select;
    } catch (err) {
      console.error("Failed to fetch curriculums:", err);
      return document.createTextNode("Failed to load curriculums");
    }
  }

  async submit() {
    try {
      const form = document.getElementById("course-create-form");
      const formData = new FormData(form);
      const payload = {
        Name: (formData.get('Name') || '').toString().trim(),
        Description: (formData.get('Description') || '').toString().trim(),
        CurriculumId: parseInt(formData.get('CurriculumId') || '0', 10),
        Optional: (formData.get('Optional') || '') === 'true',
        CourseStatus: parseInt(formData.get('CourseStatus') || '0', 10),
      };

      const resp = await fetch(`${RootURL}/curriculum/Course/createCourse`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!data.isSuccess) {
        alert('Error: ' + (data.result || 'failed to create course'));
      } else {
        alert('Save: success');
        form.reset();
      }
    } catch (err) {
      alert('Network error');
    }
  }

 courseCreateTemplate = `
    <div class="max-w-3xl mx-auto py-10 px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Add Course</h1>
      </header>
      <section class="bg-white rounded-2xl shadow p-6">
        <form id="course-create-form" class="flex flex-col gap-4">
          <div>
            <label>Name<span class="text-red-500">*</span></label>
            <input name="Name" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2"/>
          </div>
          <div>
            <label>Description</label>
            <textarea name="Description" class="w-full rounded-md border border-gray-300 px-3 py-2"></textarea>
          </div>
          <div>
            <label>Curriculum<span class="text-red-500">*</span></label>
            <div id="curriculumSelectContainer"></div>
          </div>
          <div>
            <label>Optional<span class="text-red-500">*</span></label>
            <select name="Optional" required class="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">-- Select type --</option>
              <option value="false">Required</option>
              <option value="true">Optional</option>
            </select>
          </div>
          <div>
            <label>Course Status<span class="text-red-500">*</span></label>
            <select name="CourseStatus" required class="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">-- Select status --</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div class="pt-2">
            <button id="btn-create-course" type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md">
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  `;

  async render() {
    this.application.mainContainer.innerHTML = "";
    const view = this.application.create(Mustache.render(this.courseCreateTemplate));
    this.application.mainContainer.append(view);

    const container = document.getElementById("curriculumSelectContainer");
    if (container) {
      container.append(await this.getCurriculums());
    }

    const submitBtn = document.getElementById("btn-create-course");
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.submit();
    });
  }
}
