if (typeof window !== 'undefined' && !window.InternshipReportCreate) {
  class InternshipReportCreate {
    constructor(application) {
      this.application = application;
      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || '';
      this.endpoints = {
        create: this.rootURL + '/curriculum/CreateInternshipReport',
      };
    }

    async render() {
      console.log("Create Internship Report Form");
      console.log(this.application);

      this.application.mainContainer.innerHTML = '';

      const formWrapper = this.application.create(`
        <div class="bg-gray-100 min-h-screen py-8">
          <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
            Create Internship Report
          </h1>
          <form id="internship-report-form" class="form-container">
            <div id="form-fields"></div>
            <button type="submit" class="form-submit-btn" style="width:100%;">
              Create Report
            </button>
          </form>
        </div>
      `);

      this.application.mainContainer.appendChild(formWrapper);

      const fieldsContainer = document.getElementById('form-fields');

      const field = {
        Id: "ReportScore",
        Label: "Report Score",
        Type: "number",
        Name: "ReportScore",
        Min: 0,
        Max: 100,
        Step: 1,
        Placeholder: "0-100"
      };

      let inputHTML = '';
      if (this.application.template && this.application.template.Input && window.Mustache) {
        inputHTML = Mustache.render(this.application.template.Input, field);
      } else {
        inputHTML = `
          <div class="form-field">
            <label for="${field.Id}" class="block text-sm font-medium text-gray-700 mb-1">${field.Label}</label>
            <input id="${field.Id}" name="${field.Name}" type="number"
              min="${field.Min}" max="${field.Max}" step="${field.Step}"
              placeholder="${field.Placeholder}" required class="form-input" />
          </div>
        `;
      }
      fieldsContainer.appendChild(this.application.create(inputHTML));

      const form = document.getElementById('internship-report-form');
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    _toast(type, msg) {
      const color =
        type === 'success' ? { bg: '#dcfce7', border: '#86efac', text: '#166534' } :
        type === 'error'   ? { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' } :
                             { bg: '#e0f2fe', border: '#bae6fd', text: '#0c4a6e' };
      return this.application.create(`
        <div style="
          background:${color.bg};border:1px solid ${color.border};
          color:${color.text};padding:12px 14px;border-radius:10px;margin-bottom:16px;">
          <strong style="margin-right:6px;text-transform:capitalize;">${type}!</strong> ${msg}
        </div>
      `);
    }

    async handleSubmit(event) {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form); 

      const submitBtn = form.querySelector('button[type="submit"]');
      const oldText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';

      try {
        const response = await fetch(this.endpoints.create, {
          method: 'POST',
          body: formData
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result?.isSuccess === false) {
          throw new Error(result?.error || 'Failed to create report');
        }

        const ok = this._toast('success', 'Report created successfully.');
        form.parentNode.insertBefore(ok, form);
        setTimeout(() => { ok.remove(); form.reset(); }, 2500);

      } catch (error) {
        console.error('Error:', error);
        const fail = this._toast('error', error.message || 'Request error');
        form.parentNode.insertBefore(fail, form);
        setTimeout(() => fail.remove(), 4000);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText;
      }
    }
  }

  window.InternshipReportCreate = InternshipReportCreate;
}
