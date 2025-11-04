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

    // VerifyApplicationEligibility - ตรวจเกณฑ์รอบเบื้องต้น
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

    // ConfirmAcceptance - ยืนยันสิทธิ์เมื่อผ่าน
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
