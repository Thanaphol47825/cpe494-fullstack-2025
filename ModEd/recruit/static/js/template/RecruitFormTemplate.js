if (typeof window !== 'undefined' && !window.RecruitFormTemplate) {
  class RecruitFormTemplate {
    static DEFAULTS = {
      title: 'Form',
      subtitle: '',
      formId: 'recruit-form',
      backLink: 'recruit',
      backText: 'Back',
      colorPrimary: '#059669',
      colorAccent: '#0f766e',
      iconPath: ''
    };

    static async getForm(options = {}, mode = 'create') {
      const cfg = { ...this.DEFAULTS, ...options };

      const res = await fetch(`${RootURL}/recruit/static/view/RecruitFormTemplate.tpl`);
      const tpl = await res.text();

      const html = Mustache.render(tpl, { ...cfg, mode });
      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const el = temp.firstElementChild;

      if (!el) throw new Error('Empty RecruitFormTemplate output');

      el.dataset.recruitFormId = cfg.formId;
      el.style.setProperty('--rf-primary', cfg.colorPrimary);
      el.style.setProperty('--rf-accent', cfg.colorAccent);
      return el;
    }

    static mountMessageAndResult(root, { messagesId, resultId } = {}) {
      const msgSlot = root.querySelector('#recruit-form-messages-slot');
      const resultSlot = root.querySelector('#recruit-form-result-slot');

      const msg = document.createElement('div');
      msg.id = messagesId || 'recruit-messages';
      const result = document.createElement('div');
      result.id = resultId || 'recruit-result';
      result.style.marginTop = '12px';

      msgSlot?.appendChild(msg);
      resultSlot?.appendChild(result);

      const escape = (s) =>
        String(s)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');

      return {
        showMessage(m, type = 'info') {
          msg.innerHTML = `<div class="msg ${type}">${escape(m)}</div>`;
        },
        clearMessages() {
          msg.innerHTML = '';
        },
        renderResult(data, type = 'info', notice) {
          result.innerHTML = '';
          if (notice)
            result.innerHTML = `<div class="notice ${type}">${notice}</div>`;
          const pre = document.createElement('pre');
          pre.textContent = JSON.stringify(data, null, 2);
          result.appendChild(pre);
        },
        clearResult() {
          result.innerHTML = '';
        }
      };
    }
  }

  window.RecruitFormTemplate = RecruitFormTemplate;
}
