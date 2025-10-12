(function (global) {
  if (global.RecruitFormTemplate) return;

  class RecruitFormTemplate {
    static FORM_CONFIGS = {
      ApplicantForm: {
        title: "Applicant",
        subtitle: "Add a new applicant",
        formId: "applicant-form",
        backLink: "recruit",
        backText: "Back to Recruit Menu",
        colorPrimary: "#059669",   
        colorAccent: "#0f766e",    
        iconPath:
          "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
      },
    };

    static async getForm(formKey, mode = "create") {
      const cfg = this.FORM_CONFIGS[formKey];
      if (!cfg) throw new Error(`RecruitFormTemplate: Unknown formKey "${formKey}"`);
      return await this._renderTemplate(cfg, mode);
    }

    static async _renderTemplate(cfg, mode) {
      const root = global.__ROOT_URL__ || global.RootURL || "";
      const res = await fetch(`${root}/recruit/static/view/RecruitFormTemplate.tpl`);
      if (!res.ok) throw new Error(`Failed to load RecruitFormTemplate.tpl (${res.status})`);
      const tpl = await res.text();

      const html = global.Mustache.render(tpl, { ...cfg, mode });
      const wrap = document.createElement("div");
      wrap.innerHTML = html.trim();
      return wrap.firstElementChild;
    }
  }

  global.RecruitFormTemplate = RecruitFormTemplate;
})(window);
