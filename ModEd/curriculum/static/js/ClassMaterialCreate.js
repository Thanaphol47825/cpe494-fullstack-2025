class ClassMaterialCreate {
    constructor(application) {
        this.application = application;
    }

    classMaterialTemplate = `
    <form
        id="classMaterialForm"
        method="post"
        action="{{ RootURL }}/curriculum/ClassMaterial/createClassMaterial"
        class="flex flex-col gap-6"
    >
        <div>
            <label class="block text-sm font-medium mb-1"> <span class="text-red-500">Class</span></label>
            <div id="classSelectContainer"></div>
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">File Name</label>
            <input required name="FileName" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Class Material File Name" />
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">File Path</label>
            <input required name="FilePath" type="text" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="/path/to/your/file" />
        </div>

        <div class="md:col-span-2">
            <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save Class Material</button>
        </div>
    </form>
    `

    getClasses = async () => {
        try {
            const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
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
            select.name = "ClassId";
            select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

            // Add default not-selected option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Select a class --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            data.result.forEach(item => {
                const option = document.createElement("option");
                option.value = item.ID;

                let formattedSchedule = "";
                if (item.Schedule) {
                    const d = new Date(item.Schedule);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    formattedSchedule = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
                }

                option.textContent = item.Course.Name + " - " + formattedSchedule;
                select.appendChild(option);
            });
            return select;
        } catch (err) {
            console.error("Failed to fetch classes:", err);
            return document.createTextNode("Failed to load classes");
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault(); // prevent default form submission
        const formData = new FormData(this.form);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.ClassId) {
            alert("Please select a class.");
            return;
        }
        payload.ClassId = parseInt(payload.ClassId);

        try {
            const res = await fetch(this.form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.isSuccess) {
                alert("Class Material saved!");
                this.form.reset();
                this.form.ClassId.value = "";
            } else {
                alert("Error: " + (data.result || "Failed to save"));
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };

    render = async () => {
        // clear application container
        this.application.mainContainer.innerHTML = "";

        const renderedTemplate = Mustache.render(this.classMaterialTemplate, {
            RootURL: RootURL
        });

        let formContainer = this.application.create(renderedTemplate)
        this.application.mainContainer.append(formContainer)

        this.options = await this.getClasses();
        this.selectContainer = document.getElementById("classSelectContainer");
        this.selectContainer.appendChild(this.options);
        
        this.form = document.getElementById("classMaterialForm");
        this.form.addEventListener("submit", this.handleSubmit);
    }
}