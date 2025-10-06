if (typeof window !== "undefined" && !window.CurriculumEdit) {
    class CurriculumEdit {
        constructor(application) {
            this.application = application;
        }

        async getDepartmentsOption() {
            const res = await fetch(`${RootURL}/common/departments/getall`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let select = []
            if (data.result == undefined) {
                data.forEach(item => {
                    select.push({ value: item.ID, label: item.name })
                });
            } else {
                data.result.forEach(item => {
                    select.push({ value: item.ID, label: item.name })
                });
            }

            return select;
        }

        async getCurriculumById(id) {
            const res = await fetch(
                `${RootURL}/curriculum/Curriculum/getCurriculum/${id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = await res.json().catch(() => []);

            return data.result || {};
        }

        async render() {
            const url = new URL(window.location.href);
            const pathnameSegments = url.href.split('/').filter(segment => segment !== '');

            if (pathnameSegments.length > 0) {
                this.id = pathnameSegments[pathnameSegments.length - 1];
            }

            this.application.mainContainer.innerHTML = "";

            const formWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                        Curriculum
                    </h1>
                    <form method="POST" id="curriculum-form"
                            class="form-container">
                        <div id="form-fields"></div>
                        <button type="submit" class="form-submit-btn">
                            Update Curriculum
                        </button>
                    </form>
                    <div style="margin-top: 20px;">
                        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(formWrapper);

            const departmentsOption = await this.getDepartmentsOption();
            const fields = [
                {
                    Id: "name",
                    Label: "Name",
                    Type: "text",
                    Name: "Name",
                    Required: true,
                    Placeholder: "Enter Curriculum Name",
                },
                {
                    Id: "start_year",
                    Label: "Start Year",
                    Type: "text",
                    Name: "StartYear",
                    Required: true,
                    Placeholder: "25xx",
                },
                {
                    Id: "end_year",
                    Label: "End Year",
                    Type: "text",
                    Name: "EndYear",
                    Required: true,
                    Placeholder: "25xx",
                },
                {
                    Id: "department_id",
                    Label: "Department",
                    Type: "select",
                    Name: "DepartmentId",
                    required: true,
                    options: departmentsOption,
                },
                {
                    Id: "program_type_id",
                    Label: "Program Type",
                    Type: "select",
                    Name: "ProgramType",
                    required: true,
                    options: [
                        { label: "Regular", value: 0 },
                        { label: "International", value: 1 },
                    ],
                },
            ];

            const fieldsContainer = document.getElementById("form-fields");
            fieldsContainer.innerHTML = "";

            fields.forEach((field) => {
                let inputHTML = "";

                if (
                    field.Type === "select" &&
                    this.application.template &&
                    this.application.template.SelectInput
                ) {
                    inputHTML = Mustache.render(
                        this.application.template.SelectInput,
                        field
                    );
                } else if (
                    this.application.template &&
                    this.application.template.Input
                ) {
                    inputHTML = Mustache.render(this.application.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });


            const data = await this.getCurriculumById(this.id);
            fields.forEach((field) => {
                if (field.Type === "select") {
                    const el = document.getElementById(field.Id)
                    const val = data[field.Name];

                    const target = val == null ? "" : String(val);
                    el.value = target;

                    for (const opt of el.options) {
                        const match = String(opt.value) === target;
                        opt.selected = match;
                        if (match) opt.setAttribute('selected', 'selected');
                        else opt.removeAttribute('selected');
                    }
                }
                else {
                    document.getElementById(field.Id).value = data[field.Name] || "";
                }
            });
            let formHandler = document.getElementById("curriculum-form");
            formHandler.onsubmit = this.handleSubmit.bind(this);
        }

        async handleSubmit(e) {
            e.preventDefault();

            try {
                const getForm = document.getElementById("curriculum-form");
                const formData = new FormData(getForm);
                const payload = {
                    ID: parseInt(this.id),
                    Name: formData.get("Name"),
                    StartYear: parseInt(formData.get("StartYear")),
                    EndYear: parseInt(formData.get("EndYear")),
                    DepartmentId: parseInt(formData.get("DepartmentId")),
                    ProgramType: parseInt(formData.get("ProgramType")),
                };
                if (!payload.DepartmentId) {
                    alert("Please select a department.");
                    return;
                }
                if (payload.ProgramType != 0 && payload.ProgramType != 1) {
                    alert("Please select a program type.");
                    return;
                }

                const resp = await fetch(
                    RootURL + "/curriculum/Curriculum/updateCurriculum",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

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

    if (typeof window !== "undefined") {
        window.CurriculumEdit = CurriculumEdit;
    }
}
