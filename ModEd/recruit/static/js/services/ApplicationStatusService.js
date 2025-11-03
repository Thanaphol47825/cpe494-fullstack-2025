if (typeof window !== 'undefined' && !window.ApplicationStatusService) {
  class ApplicationStatusService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      this.ENDPOINT_OPTIONS = `${this.rootURL}/recruit/GetApplicationStatusOptions`;
      this.cachedConstants = null;
    }


    async getStatusConstants(forceRefresh = false) {

      if (this.cachedConstants && !forceRefresh) {
        console.log('📋 Using cached ApplicationStatus constants:', this.cachedConstants);
        return this.cachedConstants;
      }

      try {
        console.log('🔍 Fetching ApplicationStatus constants from API...');
        const response = await fetch(this.ENDPOINT_OPTIONS);
        const data = await response.json();
        
        if (data.isSuccess && data.result) {
          const statusConstants = {};
          data.result.forEach(item => {

            const key = item.label.replace(/\s+/g, '');
            statusConstants[key] = item.value;
          });
          
          this.cachedConstants = statusConstants;
          console.log('📋 Loaded ApplicationStatus constants:', statusConstants);
          return statusConstants;
        } else {
          console.warn('API response not successful, using fallback constants');
          return this._getFallbackConstants();
        }
      } catch (error) {
        console.error('Failed to load ApplicationStatus constants:', error);
        return this._getFallbackConstants();
      }
    }

    async getStatusValue(statusKey) {
      const constants = await this.getStatusConstants();
      return constants[statusKey] || null;
    }

    async getAvailableStatusKeys() {
      const constants = await this.getStatusConstants();
      return Object.keys(constants);
    }

    async isValidStatusKey(statusKey) {
      const constants = await this.getStatusConstants();
      return statusKey in constants;
    }

    clearCache() {
      this.cachedConstants = null;
      console.log('🧹 ApplicationStatus cache cleared');
    }

    _getFallbackConstants() {
      return {
        Pending: 'Pending',
        Interview: 'Interview',
        InterviewStage: 'Interview',
        Evaluated: 'Evaluated',
        Accepted: 'Accepted',
        Rejected: 'Rejected',
        Confirmed: 'Confirmed',
        Withdrawn: 'Withdrawn',
        Student: 'Student'
      };
    }

    async getOptionsForSelect() {
      try {
        const response = await fetch(this.ENDPOINT_OPTIONS);
        const data = await response.json();
        
        if (data.isSuccess && data.result) {
          return data.result;
        }
      } catch (error) {
        console.error('Failed to load status options:', error);
      }
      
      const constants = this._getFallbackConstants();
      return Object.entries(constants).map(([key, value]) => ({
        label: value,
        value: value
      }));
    }
  }

  window.ApplicationStatusService = ApplicationStatusService;
}
