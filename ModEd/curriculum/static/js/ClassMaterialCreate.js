class ClassMaterialCreate {
    constructor(application) {
        this.application = application;
    }

    getClassesOption = async () => {
        const res = await fetch(`${RootURL}/curriculum/Class/getClasses`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ([]));

        let select = []
        data.result.forEach(item => {
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

            let label = item.Course.Name + " - " + formattedSchedule;

            select.push({ value: item.ID, label: label });
        });
        return select;
    }

    handleSubmit = async (e) => {
        e.preventDefault(); // prevent default form submission
        const form = document.getElementById('curriculum-form');
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.ClassId) {
            alert("Please select a class.");
            return;
        }
        payload.ClassId = parseInt(payload.ClassId);

        try {
            const res = await fetch(`${RootURL}/curriculum/ClassMaterial/createClassMaterial`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.isSuccess) {
                alert("Class Material saved!");
                form.reset();
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

        // create form wrapper
        const formWrapper = this.application.create(`
            <div class="bg-gray-100 min-h-screen py-8">
                <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Class Material
                </h1>
                <form method="POST" id="curriculum-form"
                        class="form-container">
                    <div id="form-fields"></div>
                    <button type="submit" class="form-submit-btn">
                        Create Class Material
                    </button>
                </form>
                <div style="margin-top: 20px;">
                    <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                </div>
            </div>
        `);
        this.application.mainContainer.appendChild(formWrapper);

        // fetch class options
        const classesOption = await this.getClassesOption();

        // define form fields
        const fields = [
            {
                Id: "ClassId", Label: "Class", Type: "select", Name: "ClassId", required: true,
                options: classesOption
            },
            { Id: "file_name", Label: "File Name", Type: "text", Name: "FileName", Required: true, Placeholder: "Enter Class Material File Name" },
            { Id: "file_path", Label: "File Path", Type: "text", Name: "FilePath", Required: true, Placeholder: "Enter Class Material File Path" },
        ];

        // render form template
        const fieldsContainer = document.getElementById('form-fields');
        fields.forEach(field => {
        let inputHTML = '';

            if (field.Type === "select" && this.application.template && this.application.template.Select) {
                inputHTML = Mustache.render(this.application.template.Select, field);
            }

            else if (this.application.template && this.application.template.Input) {
                inputHTML = Mustache.render(this.application.template.Input, field);
            }

            if (inputHTML) {
                const inputElement = this.application.create(inputHTML);
                fieldsContainer.appendChild(inputElement);
            }
        });

        let formHandler = document.getElementById('curriculum-form');
        formHandler.addEventListener('submit', this.handleSubmit.bind(this));
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ClassMaterialCreate = ClassMaterialCreate;
}