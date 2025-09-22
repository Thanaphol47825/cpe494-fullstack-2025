class CurriculumCreate {
  constructor(application) {
    this.application = application;
  }

  async getDepartments() {
    const res = await fetch(`${RootURL}/common/departments/getall`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ([]));

    const select = document.createElement("select");
    select.name = "DepartmentId";
    select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    // Add default not-selected option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select a department --";
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    if (data.result == undefined) {
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ID;
        option.textContent = item.name;
        select.appendChild(option);
      });
    } else {
      data.result.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ID;
        option.textContent = item.name;
        select.appendChild(option);
      });
    }

    return select;
  }

  curricumCreateTemplalte = `<div class="max-w-3xl mx-auto py-10 px-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Add Curriculum</h1>
    </header>

    <section class="bg-white rounded-2xl shadow p-6">
      <form
        id="curriculum-create-form"
        class="flex flex-col gap-4"
      >
        <div>
          <label class="text-sm font-medium mb-1">Name<span class="text-red-500">*</span></label>
          <input name="Name" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Curriculum Name" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">Start Year<span class="text-red-500">*</span></label>
          <input name="StartYear" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="25xx" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">End Year<span class="text-red-500">*</span></label>
          <input name="EndYear" type="text" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="25xx" />
        </div>

        <div>
          <label class="text-sm font-medium mb-1">Department</label>
          <div id="departmentSelectContainer"></div>
        </div>

        <div>
          <label class="text-sm font-medium mb-1">ProgramType</label>
          <select name="ProgramType" class="w-full rounded-md border border-gray-300 px-3 py-2">
            <option value="">-- Select a program type --</option>
            <option value=0>Regular</option>
            <option value=1>International</option>
          </select>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button id='btn-create-curriculum' type="submit" class="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 focus:ring-blue-500">Save</button>
        </div>
      </form>
    </section>

  </div>`;

  async render() {
    this.application.mainContainer.innerHTML = ""

    let formContainer = this.application.create(Mustache.render(this.curricumCreateTemplalte));
    this.application.mainContainer.append(formContainer);

    this.options = await this.getDepartments();
    this.selectContainer = document.getElementById("departmentSelectContainer");;
    this.selectContainer.append(this.options);

    let submitButton = document.getElementById("btn-create-curriculum");
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.submit();
    });
  }

  async submit() {
    try {
      const getForm = document.getElementById("curriculum-create-form");
      const formData = new FormData(getForm);
      const payload = {
        Name: formData.get('Name'),
        StartYear: parseInt(formData.get('StartYear')),
        EndYear: parseInt(formData.get('EndYear')),
        DepartmentId: parseInt(formData.get('DepartmentId')),
        ProgramType: parseInt(formData.get('ProgramType')),
      };
      if (!payload.DepartmentId) {
        alert("Please select a department.");
        return;
      }
      if (payload.ProgramType != 0 && payload.ProgramType != 1) {
        alert("Please select a program type.");
        return;
      }

      const resp = await fetch(RootURL + "/curriculum/Curriculum/createCurriculum", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (data.isSuccess) {
        alert("Curriculum saved!");
      } else {
        alert("Error: " + (data.result || "Failed to save"));
      }
    } catch (error) {
      alert("Error: " + (error || "Failed to save"));
    }

    return false;
  }
}