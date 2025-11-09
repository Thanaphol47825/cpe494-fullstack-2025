if (typeof window !== 'undefined' && !window.ApplicationReportService) {
  class ApplicationReportService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      
      this.ENDPOINT_LIST    = `${this.rootURL}/recruit/GetApplicationReports`;
      this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetApplicationReport/${id}`;
      this.ENDPOINT_CREATE  = `${this.rootURL}/recruit/CreateApplicationReport`;
      this.ENDPOINT_UPDATE  = `${this.rootURL}/recruit/UpdateApplicationReport`;
      this.ENDPOINT_DELETE  = `${this.rootURL}/recruit/DeleteApplicationReport`;
      this.ENDPOINT_VERIFY_ELIGIBILITY = `${this.rootURL}/recruit/VerifyApplicationEligibility`;
      this.ENDPOINT_CONFIRM_ACCEPTANCE = `${this.rootURL}/recruit/ConfirmAcceptance`;
      this.ENDPOINT_PROGRAM_TYPES = `${this.rootURL}/recruit/GetProgramTypeOptions`;
      
      this.programTypeMap = {};
      this.actionsTemplate = null;
      this.hiddenButtonTemplate = null;
    }

    async loadActionsTemplate() {
      if (this.actionsTemplate) {
        return this.actionsTemplate;
      }
      const response = await fetch(`${this.rootURL}/recruit/static/view/ApplicationReportTableActions.tpl`);
      if (!response.ok) {
        throw new Error(`Failed to load actions template: ${response.status} ${response.statusText}`);
      }
      this.actionsTemplate = await response.text();
      return this.actionsTemplate;
    }

    async loadHiddenButtonTemplate() {
      if (this.hiddenButtonTemplate) {
        return this.hiddenButtonTemplate;
      }
      const response = await fetch(`${this.rootURL}/recruit/static/view/HiddenButtonTemplate.tpl`);
      if (!response.ok) {
        throw new Error(`Failed to load hidden button template: ${response.status} ${response.statusText}`);
      }
      this.hiddenButtonTemplate = await response.text();
      return this.hiddenButtonTemplate;
    }

    async loadProgramTypes() {
      try {
        const response = await fetch(this.ENDPOINT_PROGRAM_TYPES);
        const result = await response.json();
        
        if (result.isSuccess && result.result) {

          result.result.forEach(option => {
            this.programTypeMap[option.value] = option.label;
          });
        }
        return this.programTypeMap;
      } catch (error) {
        console.error('Failed to load program types:', error);
        return {};
      }
    }

    async getCustomColumns() {

      await this.loadActionsTemplate();

      return [
        {
          name: 'applicant_name',
          label: 'Applicant Name',
          template: `{applicant_first_name} {applicant_last_name}`
        },
        {
          name: 'applicant_email',
          label: 'Email',
          template: `{applicant_email}`
        },
        {
          name: 'round_name',
          label: 'Application Round',
          template: `{round_name}`
        },
        {
          name: 'faculty_name',
          label: 'Faculty',
          template: `{faculty_name}`
        },
        {
          name: 'department_name',
          label: 'Department',
          template: `{department_name}`
        },
        {
          name: 'program_label',
          label: 'Program',
          template: `{program_label}`
        },
        {
          name: 'actions',
          label: 'Actions',
          template: this.actionsTemplate
        }
      ];
    }

    transformRowData(item) {
      return {
        ...item,
        applicant_first_name: item.applicant?.first_name || '',
        applicant_last_name: item.applicant?.last_name || '',
        applicant_email: item.applicant?.email || '',
        round_name: item.application_round?.round_name || '',
        faculty_name: item.faculty?.name || '',
        department_name: item.department?.name || '',
        program_label: this.programTypeMap[item.program] || item.program || 'N/A'
      };
    }

    applyButtonVisibilityRules(template, rowData, statusConstants) {
      let result = template;
      
      const status = (rowData.application_statuses || '').toUpperCase();
      const pendingStatus = (statusConstants.Pending || 'Pending').toUpperCase();
      const acceptedStatus = (statusConstants.Accepted || 'Accepted').toUpperCase();
      
      const createHiddenButton = (className, content) => {
        return this.hiddenButtonTemplate
          .replace('{className}', className)
          .replace('{content}', content);
      };
      
      if (status !== pendingStatus && status !== '') {
        result = result.replace(
          /(<button[^>]*class="al-btn-verify[^>]*>🔍 Verify<\/button>)/,
          createHiddenButton('al-btn-verify', '🔍 Verify')
        );
      }
      
      if (status !== acceptedStatus) {
        result = result.replace(
          /(<button[^>]*class="al-btn-confirm[^>]*>✅ Confirm<\/button>)/,
          createHiddenButton('al-btn-confirm', '✅ Confirm')
        );
      }
      
      if (status !== pendingStatus) {
        result = result.replace(
          /(<button[^>]*class="al-btn-schedule[^>]*>Schedule<\/button>)/,
          createHiddenButton('al-btn-schedule', 'Schedule')
        );
      }
      
      return result;
    }
    
    transformData(formData) {
      const parseNum = (val) => {
        if (val === null || val === undefined || val === '') return null;
        const n = parseInt(val, 10);
        return isNaN(n) ? null : n;
      };

      const programMap = {
        Regular: 0,
        International: 1,
      };
      
      const programValue =
        typeof formData.program === "string"
          ? programMap[formData.program] ?? 0
          : Number(formData.program) || 0;

      const toRFC3339 = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      return {
        applicant_id: parseNum(formData.applicant_id),
        application_rounds_id: parseNum(formData.application_rounds_id),
        faculty_id: parseNum(formData.faculty_id),
        department_id: parseNum(formData.department_id),
        program: programValue,
        application_statuses: formData.application_statuses || 'Pending',
      };
    }


    async getAll() {
      try {
        const resp = await fetch(this.ENDPOINT_LIST);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Failed to load application reports');
        }
        
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async getById(id) {
      if (!id) {
        return { success: false, error: 'ID is required' };
      }

      try {
        const resp = await fetch(this.ENDPOINT_GET_ONE(id));
        const payload = await resp.json().catch(() => ({}));
        
        if (!resp.ok || payload?.isSuccess === false) {
          throw new Error(payload?.message || `Unable to load application report #${id}`);
        }
        
        const report = payload?.result || payload || {};
        return { success: true, data: report };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async create(formData) {
      try {
        const payload = this.transformData(formData);
        
        const resp = await fetch(this.ENDPOINT_CREATE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
          throw new Error(msg);
        }

        const result = data.result ?? {};
        const id = result?.ID ?? result?.Id ?? result?.id ?? 
                  (Array.isArray(result) ? result[0]?.ID ?? result[0]?.Id ?? result[0]?.id : null);

        return { success: true, data: result, id };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async update(formData, id = null) {
      try {
        const resolvedId = formData?.ID ?? formData?.Id ?? formData?.id ?? id;
        if (!resolvedId) {
          throw new Error('ID is required for update');
        }

        const payload = {
          ...this.transformData(formData),
          ID: Number(resolvedId),
          id: Number(resolvedId)
        };
        
        const resp = await fetch(this.ENDPOINT_UPDATE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
          throw new Error(msg);
        }

        const result = data.result ?? {};
        return { success: true, data: result, id: resolvedId };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async delete(id) {
      if (!id) {
        return { success: false, error: 'ID is required' };
      }

      try {
        const resp = await fetch(this.ENDPOINT_DELETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) })
        });
        
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Delete failed');
        }

        return { success: true, id };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async save(formData, editId = null) {
      const resolvedId = formData?.ID ?? formData?.Id ?? formData?.id ?? editId;
      
      if (resolvedId != null) {
        return await this.update(formData, resolvedId);
      } else {
        return await this.create(formData);
      }
    }

    async verifyEligibility(applicationReportId) {
      if (!applicationReportId) {
        return { success: false, error: 'Application Report ID is required' };
      }

      try {
        const resp = await fetch(this.ENDPOINT_VERIFY_ELIGIBILITY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ application_report_id: Number(applicationReportId) })
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.message || 'Failed to verify eligibility');
        }

        return { success: true, message: data.message || 'Eligibility verified successfully' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async confirmAcceptance(applicationReportId) {
      if (!applicationReportId) {
        return { success: false, error: 'Application Report ID is required' };
      }

      try {
        const resp = await fetch(this.ENDPOINT_CONFIRM_ACCEPTANCE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ application_report_id: Number(applicationReportId) })
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.message || 'Failed to confirm acceptance');
        }

        return { success: true, message: data.message || 'Acceptance confirmed successfully' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  window.ApplicationReportService = ApplicationReportService;
}
