// HR Validation Utilities
if (typeof window !== 'undefined' && !window.HrValidator) {
  class HrValidator {
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    static validateRequired(fields, data) {
      const missing = fields.filter(field => !data[field] || data[field].trim() === '')
      return {
        isValid: missing.length === 0,
        missing: missing
      }
    }

    static validateStudentData(data) {
      const required = ['student_code', 'first_name', 'last_name', 'email']
      const validation = this.validateRequired(required, data)
      
      if (!validation.isValid) {
        return { isValid: false, errors: [`Missing required fields: ${validation.missing.join(', ')}`] }
      }

      if (data.email && !this.validateEmail(data.email)) {
        return { isValid: false, errors: ['Invalid email format'] }
      }

      return { isValid: true, errors: [] }
    }

    static validateInstructorData(data) {
      const required = ['instructor_code', 'first_name', 'last_name', 'email']
      const validation = this.validateRequired(required, data)
      
      if (!validation.isValid) {
        return { isValid: false, errors: [`Missing required fields: ${validation.missing.join(', ')}`] }
      }

      if (data.email && !this.validateEmail(data.email)) {
        return { isValid: false, errors: ['Invalid email format'] }
      }

      return { isValid: true, errors: [] }
    }
  }
  
  window.HrValidator = HrValidator
}
