if (typeof window !== 'undefined' && !window.InterviewService) {
  class InterviewService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      
      this.ENDPOINT_LIST    = `${this.rootURL}/recruit/GetInterviews`;
      this.ENDPOINT_GET_ONE = (id) => `${this.rootURL}/recruit/GetInterview/${id}`;
      this.ENDPOINT_CREATE  = `${this.rootURL}/recruit/CreateInterview`;
      this.ENDPOINT_UPDATE  = `${this.rootURL}/recruit/UpdateInterview`;
      this.ENDPOINT_DELETE  = `${this.rootURL}/recruit/DeleteInterview`;
      this.ENDPOINT_SETUP_TEST = `${this.rootURL}/recruit/SetupTestData`;
      
      // My Interview endpoints (for Instructor)
      this.ENDPOINT_MY_INTERVIEWS = `${this.rootURL}/recruit/my/interviews`;
      this.ENDPOINT_MY_PENDING = `${this.rootURL}/recruit/my/interviews/pending`;
      this.ENDPOINT_MY_EVALUATED = `${this.rootURL}/recruit/my/interviews/evaluated`;
      this.ENDPOINT_MY_UPDATE = (id) => `${this.rootURL}/recruit/my/interview/${id}`;
    }

    transformData(formData) {
      const toRFC3339 = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Handle criteria_scores - can be object or JSON string
      let criteriaScores = formData.criteria_scores;
      if (criteriaScores && typeof criteriaScores === 'string') {
        try {
          criteriaScores = JSON.parse(criteriaScores);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }

      return {
        ...formData,
        scheduled_appointment: toRFC3339(formData.scheduled_appointment),
        evaluated_at: toRFC3339(formData.evaluated_at),
        instructor_id: formData.instructor_id ? parseInt(formData.instructor_id) : 0,
        application_report_id: formData.application_report_id ? parseInt(formData.application_report_id) : 0,
        total_score: formData.total_score ? parseFloat(formData.total_score) : 0,
        criteria_scores: criteriaScores,
      };
    }

    transformRowData(item) {
      const instructor = item.Instructor || item.instructor;
      const applicationReport = item.ApplicationReport || item.application_report;
      const applicant = applicationReport?.applicant || applicationReport?.Applicant;
      
      const instructorName = instructor ? `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() : 'N/A';
      const applicantName = applicant ? `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() : 'N/A';
      
      return {
        ...item,
        instructor_name: String(instructorName),
        instructor_email: String(instructor?.email || 'N/A'),
        applicant_name: String(applicantName),
        applicant_email: String(applicant?.email || 'N/A'),
        scheduled_appointment_display: item.scheduled_appointment ? String(new Date(item.scheduled_appointment).toLocaleString()) : 'N/A',
        evaluated_at_display: item.evaluated_at ? String(new Date(item.evaluated_at).toLocaleString()) : 'N/A'
      };
    }

    async getAll() {
      try {
        const resp = await fetch(this.ENDPOINT_LIST);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Failed to load interviews');
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
          throw new Error(payload?.message || `Unable to load interview #${id}`);
        }
        
        const interview = payload?.result || payload || {};
        return { success: true, data: interview };
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

    async setupTestData() {
      try {
        const resp = await fetch(this.ENDPOINT_SETUP_TEST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.message || data?.result || 'Failed to setup test data');
        }

        return { success: true, data: data.result };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // My Interview methods (for Instructor)
    async getMyInterviews() {
      try {
        const resp = await fetch(this.ENDPOINT_MY_INTERVIEWS);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.result || data?.message || 'Failed to load my interviews');
        }
        
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async getMyPendingInterviews() {
      try {
        const resp = await fetch(this.ENDPOINT_MY_PENDING);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.result || data?.message || 'Failed to load pending interviews');
        }
        
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async getMyEvaluatedInterviews() {
      try {
        const resp = await fetch(this.ENDPOINT_MY_EVALUATED);
        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.result || data?.message || 'Failed to load evaluated interviews');
        }
        
        const rows = (data?.result || []).map(r => ({ ...r, ID: r.ID ?? r.Id ?? r.id }));
        return { success: true, data: rows };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Update my interview with scores (for Instructor evaluation)
    async updateMyInterview(interviewId, criteriaScores, totalScore) {
      if (!interviewId) {
        return { success: false, error: 'Interview ID is required' };
      }

      try {
        const payload = {
          criteria_scores: criteriaScores || {},
          total_score: parseFloat(totalScore) || 0
        };

        const resp = await fetch(this.ENDPOINT_MY_UPDATE(interviewId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.result || data?.message || 'Failed to update interview');
        }

        return { success: true, data: data.result };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  window.InterviewService = InterviewService;
}
