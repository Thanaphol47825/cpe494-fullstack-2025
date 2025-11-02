if (typeof window !== 'undefined' && !window.ApplicantImportService) {
  class ApplicantImportService {
    constructor(rootURL) {
      this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || '';
      this.ENDPOINT_IMPORT = `${this.rootURL}/recruit/ImportApplicantsFromFile`;
    }

    async selectFile() {
      return new Promise((resolve) => {
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.accept = '.csv,.json,text/csv,application/json';
        picker.style.display = 'none';
        document.body.appendChild(picker);

        picker.onchange = () => {
          const file = picker.files?.[0] || null;
          document.body.removeChild(picker);
          resolve(file);
        };

        picker.click();
      });
    }

    validateFile(file) {
      if (!file) {
        return { valid: false, error: 'No file selected' };
      }

      const allowedTypes = ['text/csv', 'application/json', '.csv', '.json'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const mimeType = file.type;

      if (!allowedTypes.includes(mimeType) && !allowedTypes.includes(fileExtension)) {
        return { 
          valid: false, 
          error: 'Invalid file type. Please select a CSV or JSON file.' 
        };
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return { 
          valid: false, 
          error: 'File too large. Maximum size is 10MB.' 
        };
      }

      return { valid: true };
    }

    async importFromFile(file = null) {
      try {
        if (!file) {
          file = await this.selectFile();
        }

        const validation = this.validateFile(file);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }

        const formData = new FormData();
        formData.append('file', file, file.name);

        const resp = await fetch(this.ENDPOINT_IMPORT, { 
          method: 'POST', 
          body: formData 
        });

        const data = await resp.json().catch(() => ({}));
        
        if (!resp.ok || data?.isSuccess === false) {
          throw new Error(data?.message || 'Import failed');
        }

        const count = Array.isArray(data?.result)
          ? data.result.length
          : (data?.result?.count ?? 0);

        return { 
          success: true, 
          count, 
          filename: file.name,
          data: data?.result 
        };

      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async importWithProgress(onProgress, file = null) {
      if (onProgress) onProgress('Selecting file...');
      
      if (!file) {
        file = await this.selectFile();
        if (!file) {
          return { success: false, error: 'No file selected' };
        }
      }

      if (onProgress) onProgress('Validating file...');
      
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      if (onProgress) onProgress('Uploading file...');
      
      return await this.importFromFile(file);
    }

    getSupportedFormats() {
      return [
        { extension: '.csv', mimeType: 'text/csv', description: 'CSV files' },
        { extension: '.json', mimeType: 'application/json', description: 'JSON files' }
      ];
    }
  }

  window.ApplicantImportService = ApplicantImportService;
}