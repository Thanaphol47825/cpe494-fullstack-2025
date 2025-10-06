// HR Error Handler Class
if (typeof window !== 'undefined' && !window.HrErrorHandler) {
  class HrErrorHandler {
    constructor() {
      this.errors = []
      this.maxErrors = 100
    }

    logError(error, context = {}) {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        message: error.message || error,
        stack: error.stack,
        context: context,
        module: 'hr'
      }
      
      this.errors.push(errorEntry)
      
      // Keep only recent errors
      if (this.errors.length > this.maxErrors) {
        this.errors.shift()
      }
      
      console.error('🚨 HR Error:', errorEntry)
      return errorEntry
    }

    getErrors() {
      return this.errors
    }

    clearErrors() {
      this.errors = []
    }

    hasErrors() {
      return this.errors.length > 0
    }
  }
  
  window.HrErrorHandler = HrErrorHandler
}
