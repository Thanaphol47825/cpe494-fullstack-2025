if (typeof window !== 'undefined' && !window.InternStudentSkillCreate) {
  class InternStudentSkillCreate {
    constructor(application) {
      this.application = application;

      this.rootURL = (window.__InternSkillConfig && window.__InternSkillConfig.rootURL) || '';
      this.endpoints = {
        listStudents: this.rootURL + '/curriculum/InternStudent',   
        listSkills:   this.rootURL + '/curriculum/InternSkill',    
        create:       this.rootURL + '/curriculum/CreateInternStudentSkill',
      };
    }

    async render() {
      this.application.mainContainer.innerHTML = '';

      const wrapper = this.application.create(`
        <div class="bg-gray-100 min-h-screen py-8">
          <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
            Create Intern Student Skill
          </h1>
          <form id="intern-student-skill-form" class="form-container">
            <div id="form-fields"></div>
            <button type="submit" class="form-submit-btn" style="width:100%;">
              Create Intern Student Skill
            </button>
          </form>
        </div>
      `);
      this.application.mainContainer.appendChild(wrapper);

      const fieldsContainer = document.getElementById('form-fields');

      let students = [];
      let skills = [];
      try {
        const [stuRes, sklRes] = await Promise.all([
          fetch(this.endpoints.listStudents),
          fetch(this.endpoints.listSkills),
        ]);

        const stuData = await stuRes.json();
        const sklData = await sklRes.json();

        if (stuRes.ok && stuData.isSuccess && Array.isArray(stuData.result)) {
          students = stuData.result;
        } else {
          throw new Error(stuData.error || 'failed to fetch students');
        }

        if (sklRes.ok && sklData.isSuccess && Array.isArray(sklData.result)) {
          skills = sklData.result;
        } else {
          throw new Error(sklData.error || 'failed to fetch skills');
        }
      } catch (err) {
        console.error(err);
        fieldsContainer.appendChild(this._toast('error', err.message || 'Load list failed'));
        return;
      }

      const studentOptions = students.map(s => {
        const id = s?.ID ?? s?.id ?? s?.Id;
        const code = s?.Student?.StudentCode ?? s?.StudentCode ?? s?.student_code ?? s?.StudentID ?? s?.Student?.ID ?? '';
        const first = s?.Student?.FirstName ?? s?.Student?.first_name ?? '';
        const last  = s?.Student?.LastName  ?? s?.Student?.last_name  ?? '';
        const name = [first, last].filter(Boolean).join(' ').trim();
        const label = name ? `${code ? code+' - ' : ''}${name}` : `${code ? code : ('#'+id)}`;
        return { value: String(id), label: label || String(id) };
      });

      const skillOptions = skills.map(k => {
        const id = k?.ID ?? k?.id ?? k?.Id;
        const name = k?.skill_name ?? k?.SkillName ?? `Skill #${id}`;
        return { value: String(id), label: name };
      });

    
      const levelOptions = [
        { value: "1", label: "1 - Beginner" },
        { value: "2", label: "2 - Intermediate" },
        { value: "3", label: "3 - Advanced" },
        { value: "4", label: "4 - Expert" },
        { value: "5", label: "5 - Master" },
      ];

      this._renderSelect(fieldsContainer, {
        Id: "student_id",
        Label: "Student",
        Name: "student_id",
        required: true,
        options: studentOptions,
        default: studentOptions[0]?.value || ""
      });

      this._renderSelect(fieldsContainer, {
        Id: "skill_id",
        Label: "Skill",
        Name: "skill_id",
        required: true,
        options: skillOptions,
        default: skillOptions[0]?.value || ""
      });

      this._renderSelect(fieldsContainer, {
        Id: "level",
        Label: "Skill Level",
        Name: "level",
        required: true,
        options: levelOptions,
        default: "1"
      });

      document
        .getElementById('intern-student-skill-form')
        .addEventListener('submit', this.handleSubmit.bind(this));
    }

    _renderSelect(container, field) {
      if (this.application.template && this.application.template.SelectInput && window.Mustache) {
        const html = Mustache.render(this.application.template.SelectInput, field);
        container.appendChild(this.application.create(html));
        return;
      }

      const opts = (field.options || [])
        .map(o => `<option value="${o.value}" ${String(field.default||'')===String(o.value)?'selected':''}>${o.label}</option>`)
        .join('');
      const html = `
        <div class="form-field">
          <label for="${field.Id}" class="block text-sm font-medium text-gray-700 mb-1">${field.Label}</label>
          <select id="${field.Id}" name="${field.Name}" class="form-select" ${field.required ? 'required' : ''}>
            ${opts}
          </select>
        </div>
      `;
      container.appendChild(this.application.create(html));
    }

    _toast(type, msg) {
      const color =
        type === 'success' ? { bg: '#dcfce7', border: '#86efac', text: '#166534' } :
        type === 'error' ?   { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' } :
                             { bg: '#e0f2fe', border: '#bae6fd', text: '#0c4a6e' };
      return this.application.create(`
        <div style="
          background:${color.bg};border:1px solid ${color.border};
          color:${color.text};padding:12px 14px;border-radius:10px;margin-bottom:16px;">
          <strong style="margin-right:6px;text-transform:capitalize;">${type}!</strong> ${msg}
        </div>
      `);
    }

    async handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      const jsonData = Object.fromEntries(fd.entries());

      try {
        const res = await fetch(this.endpoints.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });
        const result = await res.json();
        if (!res.ok || !result.isSuccess) throw new Error(result.error || 'Create failed');

        const ok = this._toast('success', 'Student skill created successfully.');
        form.parentNode.insertBefore(ok, form);
        setTimeout(() => { ok.remove(); form.reset(); }, 2500);
      } catch (err) {
        const fail = this._toast('error', err.message || 'Request error');
        form.parentNode.insertBefore(fail, form);
        setTimeout(() => fail.remove(), 4000);
      }
    }
  }

  window.InternStudentSkillCreate = InternStudentSkillCreate;
}
