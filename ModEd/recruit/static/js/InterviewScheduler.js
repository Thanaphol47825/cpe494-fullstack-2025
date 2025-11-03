if (typeof window !== 'undefined' && !window.InterviewScheduler) {
  class InterviewScheduler {
    constructor(form, sessionData = {}) {
      this.form = form;
      this.sessionData = sessionData;
      this.formHtml = null;
      this.isScheduleMode = false;
      
      this.fieldsToLock = ['application_report_id', 'interview_status'];
      this.fieldsToHide = ['criteria_scores', 'total_score', 'evaluated_at'];
      
      this.lockStyles = {
        backgroundColor: '#f3f4f6',
        cursor: 'not-allowed',
        opacity: '0.6'
      };
    }


    static fromSessionStorage(form) {
      const sessionData = {
        applicationReportId: sessionStorage.getItem('prefilledApplicationReportId'),
        interviewStatus: sessionStorage.getItem('prefilledInterviewStatus'),
        source: sessionStorage.getItem('interviewFormSource')
      };
      
      return new InterviewScheduler(form, sessionData);
    }


    isScheduling() {
      this.isScheduleMode = this.sessionData.applicationReportId && this.sessionData.interviewStatus;
      return this.isScheduleMode;
    }


    getPreFillData() {
      if (!this.isScheduling()) return null;
      
      const data = {
        application_report_id: this.sessionData.applicationReportId
      };
      
      if (this.sessionData.interviewStatus) {
        data.interview_status = this.sessionData.interviewStatus;
      }
      
      return data;
    }


    applySchedulingRestrictions(delay = 200) {
      if (!this.isScheduling()) return;
      
      setTimeout(() => {
        this._initializeFormHtml();
        
        if (!this.formHtml) {
          console.error('❌ InterviewScheduler: Form HTML not found');
          return;
        }
        
        console.log('🔒 Applying scheduling restrictions', {
          formHtml: this.formHtml,
          mode: 'schedule'
        });
        
        this._lockFields();
        this._hideFields();
        
        console.log('✅ Scheduling restrictions applied successfully');
      }, delay);
    }


    _initializeFormHtml() {
      this.formHtml = this.form.form?.html || this.form.html;
    }


    _lockFields() {
      this.fieldsToLock.forEach(fieldName => {
        const field = this.formHtml.querySelector(`[name="${fieldName}"]`);
        
        if (field) {
          this._applyLockStyles(field);
          console.log(`✓ Locked ${fieldName} field`);
        }
      });
    }


    _applyLockStyles(field) {
      field.disabled = true;
      
      Object.entries(this.lockStyles).forEach(([property, value]) => {
        field.style[property] = value;
      });
    }


    _hideFields() {
      this.fieldsToHide.forEach(fieldName => {
        const field = this.formHtml.querySelector(`[name="${fieldName}"]`);
        
        if (field) {
          const container = this._findFieldContainer(field);
          
          if (container) {
            container.style.display = 'none';
            console.log(`✓ Hidden ${fieldName}`);
          }
        }
      });
    }


    _findFieldContainer(field) {
      let parent = field.parentElement;
      

      while (parent && !parent.classList.contains('form-group') && parent.tagName !== 'FORM') {
        parent = parent.parentElement;
      }
      

      if (parent && parent.tagName !== 'FORM') {
        return parent;
      }
      
      return field.parentElement;
    }


    cleanupSession() {
      sessionStorage.removeItem('prefilledApplicationReportId');
      sessionStorage.removeItem('prefilledInterviewStatus');
      sessionStorage.removeItem('interviewFormSource');
      
      console.log('🧹 Session storage cleaned up');
    }


    getInfoMessage() {
      if (!this.isScheduling()) return null;
      
      return `Application Report #${this.sessionData.applicationReportId} pre-selected for interview`;
    }


    addFieldToLock(fieldName) {
      if (!this.fieldsToLock.includes(fieldName)) {
        this.fieldsToLock.push(fieldName);
      }
    }


    addFieldToHide(fieldName) {
      if (!this.fieldsToHide.includes(fieldName)) {
        this.fieldsToHide.push(fieldName);
      }
    }


    setLockStyles(styles) {
      this.lockStyles = { ...this.lockStyles, ...styles };
    }


    async updateApplicationReportStatus(applicationReportId, statusKey = 'Interview', rootURL = '') {
      if (!applicationReportId) {
        console.warn('No applicationReportId provided for status update');
        return { success: false, error: 'Missing applicationReportId' };
      }
      
      console.log('🔄 Starting status update:', { applicationReportId, statusKey, rootURL });
      
      try {
        if (!window.ApplicationReportService) {
          console.error('ApplicationReportService not available');
          return { success: false, error: 'ApplicationReportService not loaded' };
        }

        if (!window.ApplicationStatusService) {
          console.error('ApplicationStatusService not available');
          return { success: false, error: 'ApplicationStatusService not loaded' };
        }
        
        const statusService = new window.ApplicationStatusService(rootURL);
        const statusConstants = await statusService.getStatusConstants();
        
        const newStatus = statusConstants[statusKey];
        
        if (!newStatus) {
          const availableKeys = await statusService.getAvailableStatusKeys();
          console.error(`❌ Invalid status key: "${statusKey}". Available keys:`, availableKeys);
          return { 
            success: false, 
            error: `Invalid status key: "${statusKey}". Must be one of: ${availableKeys.join(', ')}` 
          };
        }
        
        console.log(`📝 Status mapping: "${statusKey}" → "${newStatus}"`);
        
        const reportService = new window.ApplicationReportService(rootURL);
        
        console.log('📥 Fetching current application report...');
        const reportResult = await reportService.getById(applicationReportId);
        if (!reportResult.success) {
          console.error('Failed to fetch application report:', reportResult.error);
          return { success: false, error: reportResult.error };
        }
        
        console.log('📄 Current report data:', reportResult.data);
        
        const updatedData = {
          ...reportResult.data,
          application_statuses: newStatus
        };
        
        console.log('📤 Sending update with data:', updatedData);
        
        const updateResult = await reportService.update(updatedData, applicationReportId);
        
        console.log('📬 Update result:', updateResult);
        
        if (updateResult.success) {
          console.log(`✅ ApplicationReport #${applicationReportId} status updated to "${newStatus}"`);
          
          window.dispatchEvent(new CustomEvent('applicationReportChanged', {
            detail: { 
              action: 'statusUpdate', 
              id: applicationReportId, 
              newStatus: newStatus,
              data: updateResult.data 
            }
          }));
          
          return { success: true, data: updateResult.data };
        } else {
          console.error('Failed to update application report status:', updateResult.error);
          return { success: false, error: updateResult.error };
        }
      } catch (error) {
        console.error('Error updating application report status:', error);
        return { success: false, error: error.message };
      }
    }
  }

  window.InterviewScheduler = InterviewScheduler;
}
