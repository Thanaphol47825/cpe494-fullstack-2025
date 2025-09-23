class ClassCreate {
    constructor(application) {
        this.application = application;
    }

    classTemplate = `
    <section class="bg-white rounded-2xl shadow p-6">
        <form
          id="class-create-form"
          method="post"
          action="{{ RootURL }}/curriculum/Class/createClass"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Course<span class="text-red-500">*</span></label>
            <div id="CourseSelectContainer"></div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Section <span class="text-red-500">*</span></label>
            <input name="Section" type="number" min="0" required
              class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 1" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Schedule <span class="text-red-500">*</span></label>
            <input name="Schedule" type="datetime-local" required
              class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="md:col-span-2">
            <button type="submit"
              class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Save Class
            </button>
          </div>
        </form>
    </section>
    `;

    getCourses = async () => {
        try {
            const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            if (!res.ok) {
                const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
                throw new Error(msg);
            }

            // Create select element
            const select = document.createElement("select");
            select.name = "CourseId";
            select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

            // Add default not-selected option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Select a course --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            data.result.forEach(item => {
                const option = document.createElement("option");
                option.value = item.ID;
                option.textContent = item.Name;
                select.appendChild(option);
            });

            return select;
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            return document.createTextNode("Failed to load courses");
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(this.form);
        const scheduleLocal = formData.get('Schedule');
        const scheduleISO = scheduleLocal ? new Date(scheduleLocal).toISOString() : null;
        const payload = {
            CourseId: parseInt(formData.get('CourseId')),
            Section: parseInt(formData.get('Section')),
            Schedule: scheduleISO,
        };
        try {
            const resp = await fetch(this.form.action, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await resp.json();
            if (!data?.isSuccess) {
                alert('Error: ' + (data?.result ?? 'Unknown error'));
            } else {
                alert('Save: ' + data.result);
                this.form.reset();
                this.form.CourseId.value = "";
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Submission error: ' + err.message);
        }
    }

    render = async () => {
        // clear application container
        this.application.mainContainer.innerHTML = "";

        const renderedTemplate = Mustache.render(this.classTemplate, {
            RootURL: RootURL
        });

        let formContainer = this.application.create(renderedTemplate);
        this.application.mainContainer.append(formContainer);

        this.options = await this.getCourses();
        this.selectContainer = document.getElementById("CourseSelectContainer");
        this.selectContainer.appendChild(this.options);

        this.form = document.getElementById("class-create-form");
        this.form.addEventListener("submit", this.handleSubmit);
    }
}
