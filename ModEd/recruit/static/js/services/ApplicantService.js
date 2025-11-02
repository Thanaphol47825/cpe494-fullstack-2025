if (typeof window !== 'undefined' && !window.ApplicantService) {
  class ApplicantService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      
      this.ENDPOINT_LIST    = `${this.rootURL}/recruit/GetApplicants`;
      this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetApplicant/${id}`;
      this.ENDPOINT_CREATE  = `${this.rootURL}/recruit/CreateApplicant`;
      this.ENDPOINT_UPDATE  = `${this.rootURL}/recruit/UpdateApplicant`;
      this.ENDPOINT_DELETE  = `${this.rootURL}/recruit/DeleteApplicant`;
    }

    transformData(formData) {
      const toRFC3339 = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? `${dateStr}T00:00:00Z` : d.toISOString();
      };

      return {
        ...formData,
        birth_date: toRFC3339(formData.birth_date),
        start_date: toRFC3339(formData.start_date),
      };
    }

    async getAll() {
      try {
        const resp = await fetch(this.ENDPOINT_LIST);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Failed to load applicants');
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
          throw new Error(payload?.message || `Unable to load applicant #${id}`);
        }
        
        const applicant = payload?.result || payload || {};
        return { success: true, data: applicant };
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
  }

  window.ApplicantService = ApplicantService;
}