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

    static navigateTo(route) {
      if (window.RouterLinks) {
        new window.RouterLinks().navigateTo(route);
      } else {
        window.location.hash = route;
      }
    }

    static setNavigationSource(key, value) {
      sessionStorage.setItem(key, value);
    }

    static getNavigationSource(key) {
      return sessionStorage.getItem(key);
    }

    static clearNavigationSource(key) {
      sessionStorage.removeItem(key);
    }

    static checkIfCameFromTable(sourceKey) {
      return this.getNavigationSource(sourceKey) === 'table';
    }

    static dispatchChangeEvent(entityName, action, id, data) {
      window.dispatchEvent(new CustomEvent(`${entityName.toLowerCase()}Changed`, { 
        detail: { action, id, data }
      }));
    }

    static async getDefaultColumns() {
      const res = await fetch(`${RootURL}/recruit/static/view/ActionButtonsTemplate.tpl`);
      const template = await res.text();
      
      return [
        {
          name: 'actions',
          label: 'Actions',
          template: template.trim()
        }
      ];
    }

    static modalTemplate = null;
    static modalStylesLoaded = false;
    static schemaCache = {};

    static async loadModalTemplate() {
      if (this.modalTemplate) return this.modalTemplate;
      
      const res = await fetch(`${RootURL}/recruit/static/view/DetailsModal.tpl`);
      this.modalTemplate = await res.text();
      return this.modalTemplate;
    }

    static async ensureModalStyles() {
      if (this.modalStylesLoaded) return;
      
      const res = await fetch(`${RootURL}/recruit/static/view/ModalStyles.css`);
      const css = await res.text();
      
      const style = document.createElement('style');
      style.id = 'recruit-modal-styles';
      style.textContent = css;
      document.head.appendChild(style);
      
      this.modalStylesLoaded = true;
    }

    static async showDetailsModal(data) {
      await this.ensureModalStyles();
      await this.loadModalTemplate();
      
      const html = Mustache.render(this.modalTemplate, data);
      
      const modal = document.createElement('div');
      modal.innerHTML = html.trim();
      const modalElement = modal.firstElementChild;
      
      document.body.appendChild(modalElement);
      
      modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
          modalElement.remove();
        }
      });

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          modalElement.remove();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }

    static async fetchSchema(modelPath) {
      if (this.schemaCache[modelPath]) {
        return this.schemaCache[modelPath];
      }
      
      try {
        const res = await fetch(`${RootURL}/api/modelmeta/${modelPath}`);
        const schema = await res.json();
        this.schemaCache[modelPath] = schema;
        return schema;
      } catch (error) {
        console.error(`[RecruitTableTemplate] Error fetching schema for ${modelPath}:`, error);
        return [];
      }
    }

    static async formatForModal(data, modelPath, modalTitle, additionalFields = [], excludeFields = []) {
      const schema = await this.fetchSchema(modelPath);
      
      const fields = [
        { label: 'ID', value: data.id || data.ID || 'N/A' },
        ...additionalFields
      ];
      
      schema.forEach(field => {
        if (field.display !== false && !excludeFields.includes(field.name)) {
          const value = data[field.name] || 'N/A';
          const fieldData = { 
            label: field.label, 
            value: value
          };
          
          if (field.type === 'url' && value !== 'N/A') {
            fieldData.isLink = true;
            fieldData.hasValue = true;
          }
          
          if (field.type === 'text' && field.name === 'address') {
            fieldData.fullWidth = true;
          }
          
          fields.push(fieldData);
        }
      });
      
      return {
        modalTitle: modalTitle,
        sections: [
          {
            sectionTitle: 'Information',
            fields: fields
          }
        ]
      };
    }

    static async formatWithCustomSections(data, modelPath, modalTitle, customSections) {
      const schema = await this.fetchSchema(modelPath);
      const schemaMap = {};
      
      schema.forEach(field => {
        schemaMap[field.name] = field;
      });
      
      const sections = customSections.map(section => {
        const fields = section.fields.map(fieldConfig => {
          if (typeof fieldConfig === 'string') {
            const schemaField = schemaMap[fieldConfig];
            if (schemaField && schemaField.display !== false) {
              const value = data[fieldConfig] || 'N/A';
              const fieldData = {
                label: schemaField.label,
                value: value
              };
              
              if (schemaField.type === 'url' && value !== 'N/A') {
                fieldData.isLink = true;
                fieldData.hasValue = true;
              }
              
              return fieldData;
            }
            return null;
          } else {
            return fieldConfig;
          }
        }).filter(f => f !== null);
        
        return {
          sectionTitle: section.sectionTitle,
          gridClass: section.gridClass,
          fields: fields
        };
      });
      
      return {
        modalTitle: modalTitle,
        sections: sections
      };
    }
  }

  window.RecruitTableTemplate = RecruitTableTemplate;
}
