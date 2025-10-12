if (typeof window !== 'undefined' && !window.ClassMaterialCreate) {
    class ClassMaterialCreate {
        constructor(application) {
            this.application = application;
        }

        async handleSubmit(formData) {
            try {
                console.log("Submitting form data:", formData);
                if (!formData.ClassId) {
                    alert("Please select a class.");
                    return;
                }
                formData.ClassId = parseInt(formData.ClassId);

                const resp = await fetch(RootURL + "/curriculum/ClassMaterial/createClassMaterial", {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await resp.json();
                if (data.isSuccess) {
                    alert("Class Material saved!");
                } else {
                    alert("Error: " + (data.result || "Failed to save"));
                }
            } catch (error) {
                alert("Error: " + (error || "Failed to save"));
            }

            return false;
        }

        async render() {
            // clear application container
            this.application.templateEngine.mainContainer.innerHTML = "";
            
            // ใช้ FormTemplate แทน embedded HTML (ตอนนี้ return Promise<DOM element> แล้ว)
            const formElement = await FormTemplate.getForm('ClassMaterialForm', 'create');
            this.application.templateEngine.mainContainer.appendChild(formElement);

            this.form = new AdvanceFormRender(this.application.templateEngine, {
                modelPath: "curriculum/classmaterial",
                targetSelector: "#class-material-form",
                submitHandler: async (formData) => {
                    console.log("Form submitted:", formData);
                    await this.handleSubmit(formData);
                }
            });

            await this.form.render();
        }
    }

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ClassMaterialCreate = ClassMaterialCreate;
    }
}