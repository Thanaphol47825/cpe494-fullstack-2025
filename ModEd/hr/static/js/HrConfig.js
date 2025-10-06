// HR Module Configuration
class HrConfig {
  static getConfig() {
    return {
      module: {
        name: 'hr',
        version: '1.0.0',
        displayName: 'Human Resources',
        description: 'Manage instructors, students, and HR processes'
      },
      
      api: {
        baseUrl: '/hr',
        endpoints: {
          instructors: '/hr/instructors',
          students: '/hr/students',
          metadata: {
            instructor: '/api/modelmeta/hr/instructors',
            student: '/api/modelmeta/hr/students'
          }
        }
      },
      
      validation: {
        student: {
          required: ['student_code', 'first_name', 'last_name', 'email'],
          email: true,
          maxLength: {
            student_code: 20,
            first_name: 50,
            last_name: 50,
            email: 100
          }
        },
        instructor: {
          required: ['instructor_code', 'first_name', 'last_name', 'email'],
          email: true,
          maxLength: {
            instructor_code: 20,
            first_name: 50,
            last_name: 50,
            email: 100
          }
        }
      },
      
      ui: {
        theme: 'modern',
        animations: true,
        debugMode: false,
        errorDisplay: 'inline'
      },
      
      features: {
        dynamicForms: true,
        validation: true,
        errorHandling: true,
        logging: true,
        navigation: 'spa'
      }
    }
  }
  
  static getFeatureConfig(feature) {
    const config = this.getConfig()
    return config.features[feature] || false
  }
  
  static isFeatureEnabled(feature) {
    return this.getFeatureConfig(feature) === true
  }
  
  static getValidationRules(type) {
    const config = this.getConfig()
    return config.validation[type] || {}
  }
  
  static getAPIEndpoint(endpoint) {
    const config = this.getConfig()
    return config.api.endpoints[endpoint] || null
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.HrConfig = HrConfig
}

console.log("📋 HrConfig loaded")
