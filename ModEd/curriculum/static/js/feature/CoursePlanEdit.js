if (typeof window !== 'undefined' && !window.CoursePlanEdit) {
    class CoursePlanEdit {
        constructor(application) {
            this.application = application;
        }

        async render(params = {}) {
            // minimal edit page scaffold — replace with AdvanceFormRender usage for editing
            this.application.mainContainer.innerHTML = "";
            const wrapper = this.application.create(`
                <div class="max-w-3xl mx-auto py-8">
                    <h1 class="text-2xl font-bold text-center mb-6">Edit Course Plans</h1>
                    <div id="edit-form-wrap">Loading...</div>
                    <div style="margin-top:16px; text-align:center;">
                        <a routerLink="curriculum" style="color:#6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(wrapper);

            // Optional: initialize AdvanceFormRender in edit mode if available
            if (typeof AdvanceFormRender === 'function') {
                this.form = new AdvanceFormRender(this.application, {
                    modelPath: "curriculum/coursePlan",
                    targetSelector: "#edit-form-wrap",
                    recordId: params.id || null, // adjust per AdvanceFormRender API
                    mode: "edit",
                    submitHandler: async (formData) => {
                        // reuse same submission logic as create if appropriate
                        const createCmp = new window.CoursePlanCreate(this.application);
                        await createCmp.handleSubmit(formData);
                    }
                });
                try { await this.form.render(); } catch (e) { console.warn(e); }
            } else {
                const el = wrapper.querySelector('#edit-form-wrap');
                if (el) el.innerText = "Edit form renderer not available.";
            }
        }
    }

    if (typeof window !== 'undefined') {
        window.CoursePlanEdit = CoursePlanEdit;
    }
}
