class ApplicationReportTransferConfirmedStudentService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      this.ENDPOINT_TRANSFER_ALL = `${this.rootURL}/recruit/TransferConfirmedApplicants`;
      this.ENDPOINT_TRANSFER_ONE = `${this.rootURL}/recruit/TransferConfirmedApplicantByID`;
    }

    async transferAll() {
      try {
        const resp = await fetch(this.ENDPOINT_TRANSFER_ALL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.message || 'Transfer all confirmed applicants failed');
        }

        return {
          success: true,
          message: data.message || 'All confirmed applicants transferred successfully',
          result: data.result || null,
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async transferById(applicantId) {
      if (!applicantId) {
        return { success: false, error: 'Applicant ID is required' };
      }

      try {
        const resp = await fetch(this.ENDPOINT_TRANSFER_ONE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ applicant_id: Number(applicantId) }),
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || data?.isSuccess !== true) {
          throw new Error(data?.message || `Transfer for applicant #${applicantId} failed`);
        }

        return {
          success: true,
          message: data.message || `Applicant #${applicantId} transferred successfully`,
          result: data.result || null,
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  window.ApplicationReportTransferConfirmedStudentService = ApplicationReportTransferConfirmedStudentService;


