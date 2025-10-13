if (typeof window !== 'undefined' && !window.RecruitTableTemplate) {
  class RecruitTableTemplate {
    static DEFAULTS = {
      title: 'Table',
      subtitle: '',
      tableId: 'recruit-table',
      panelTitle: 'Form',
      backLink: 'recruit',
      backText: 'Back',
      colorPrimary: '#2563eb',
      colorAccent: '#1e40af',
      iconPath: ''
    };

    static async getTable(options = {}, mode = 'manage') {
      const cfg = { ...this.DEFAULTS, ...options };
      const res = await fetch(`${RootURL}/recruit/static/view/RecruitTableTemplate.tpl`);
      const tpl = await res.text();

      const html = Mustache.render(tpl, { ...cfg, mode });
      const div = document.createElement('div');
      div.innerHTML = html.trim();
      const el = div.firstElementChild;
      el.dataset.recruitTableId = cfg.tableId;
      el.style.setProperty('--rt-primary', cfg.colorPrimary);
      el.style.setProperty('--rt-accent', cfg.colorAccent);
      return el;
    }

    static mountMessageAndResult(root, { messagesId, resultId } = {}) {
      const msgSlot = root.querySelector('#recruit-table-messages-slot');
      const resultSlot = root.querySelector('#recruit-table-result-slot');
      const msg = document.createElement('div');
      const result = document.createElement('div');
      msgSlot?.appendChild(msg);
      resultSlot?.appendChild(result);

      return {
        showMessage(m, t = 'info') {
          msg.innerHTML = `<div class="msg ${t}">${m}</div>`;
        },
        clearMessages() { msg.innerHTML = ''; },
        renderResult(d, t = 'info', n) {
          result.innerHTML = n ? `<div>${n}</div>` : '';
          const pre = document.createElement('pre');
          pre.textContent = JSON.stringify(d, null, 2);
          result.appendChild(pre);
        },
        clearResult() { result.innerHTML = ''; }
      };
    }
  }

  window.RecruitTableTemplate = RecruitTableTemplate;
}
