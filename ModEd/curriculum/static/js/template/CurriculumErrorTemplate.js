if (typeof window !== 'undefined' && !window.CurriculumErrorTemplate) {
  class CurriculumErrorTemplate {
    
    /**
     * Default error configurations
     */
    static ERROR_TYPES = {
      'MODULE_NOT_LOADED': {
        title: 'Module Loading Error',
        type: 'Module Not Found',
        suggestions: [
          'Check if the module file exists in the correct directory',
          'Verify that the module is properly exported',
          'Try refreshing the page to reload all modules',
          'Check the browser console for more detailed error messages'
        ]
      },
      'RENDER_ERROR': {
        title: 'Rendering Error',
        type: 'Template Rendering Failed',
        suggestions: [
          'Verify that all required data is available',
          'Check the template file for syntax errors',
          'Ensure all dependencies are loaded correctly',
          'Review the error details below for specific issues'
        ]
      },
      'DATA_ERROR': {
        title: 'Data Error',
        type: 'Data Processing Failed',
        suggestions: [
          'Verify the data format is correct',
          'Check if the backend API is responding',
          'Ensure all required fields are present',
          'Try reloading the data'
        ]
      },
      'PERMISSION_ERROR': {
        title: 'Permission Error',
        type: 'Access Denied',
        suggestions: [
          'Check if you have the correct role assigned',
          'Contact your administrator for access',
          'Verify your session is still active',
          'Try logging out and logging back in'
        ]
      },
      'GENERIC': {
        title: 'Error Occurred',
        type: 'Something Went Wrong',
        suggestions: [
          'Try refreshing the page',
          'Clear your browser cache',
          'Check your internet connection',
          'Contact support if the problem persists'
        ]
      }
    };

    /**
     * Render error page with custom or default configuration
     * @param {Object} options - Error configuration options
     * @returns {Promise<HTMLElement>} - Rendered error element
     */
    static async render(options = {}) {
      try {
        // Load template file
        const response = await fetch(`${RootURL}/curriculum/static/view/ErrorTemplate.tpl`);
        const templateContent = await response.text();

        // Determine error type configuration
        const errorType = options.errorType || 'GENERIC';
        const defaultConfig = this.ERROR_TYPES[errorType] || this.ERROR_TYPES['GENERIC'];

        // Merge options with defaults
        const templateData = {
          errorTitle: options.title || defaultConfig.title,
          errorType: options.type || defaultConfig.type,
          errorMessage: options.message || 'An unexpected error occurred while processing your request.',
          technicalDetails: options.technicalDetails || options.error?.message || '',
          suggestions: options.suggestions || defaultConfig.suggestions,
          backRoute: options.backRoute || '',
          retryAction: options.retryAction || '',
          timestamp: options.timestamp || new Date().toLocaleString()
        };

        // Render with Mustache
        const renderedHTML = Mustache.render(templateContent, templateData);

        // Create DOM element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderedHTML.trim();

        return tempDiv.firstChild;

      } catch (error) {
        console.error('Error rendering error template:', error);
        
        // Fallback error display
        return this.createFallbackError(options);
      }
    }

    /**
     * Create a simple fallback error element if template loading fails
     */
    static createFallbackError(options = {}) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'p-8 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-2xl mx-auto my-8';
      
      const title = document.createElement('h2');
      title.className = 'text-2xl font-bold text-red-800 mb-2';
      title.textContent = options.title || 'Error';
      
      const message = document.createElement('p');
      message.className = 'text-red-700 mb-4';
      message.textContent = options.message || 'An error occurred.';
      
      const homeButton = document.createElement('button');
      homeButton.setAttribute('routerLink', '/curriculum');
      homeButton.className = 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700';
      homeButton.textContent = 'Go to Home';
      
      errorDiv.appendChild(title);
      errorDiv.appendChild(message);
      errorDiv.appendChild(homeButton);
      
      return errorDiv;
    }

    /**
     * Quick error rendering methods for common scenarios
     */
    static async moduleNotLoaded(moduleName, backRoute = '') {
      return await this.render({
        errorType: 'MODULE_NOT_LOADED',
        message: `The module "${moduleName}" could not be loaded. This might be due to a missing file or network issue.`,
        technicalDetails: `Module: ${moduleName}\nExpected location: /curriculum/static/js/`,
        backRoute: backRoute
      });
    }

    static async renderError(errorMessage, backRoute = '') {
      return await this.render({
        errorType: 'RENDER_ERROR',
        message: errorMessage,
        backRoute: backRoute
      });
    }

    static async dataError(errorMessage, backRoute = '') {
      return await this.render({
        errorType: 'DATA_ERROR',
        message: errorMessage,
        backRoute: backRoute
      });
    }

    static async permissionError(backRoute = '') {
      return await this.render({
        errorType: 'PERMISSION_ERROR',
        message: 'You do not have permission to access this resource. Please check your role or contact an administrator.',
        backRoute: backRoute
      });
    }

    /**
     * Display error in a specific container
     */
    static async displayError(container, options = {}) {
      const errorElement = await this.render(options);
      container.innerHTML = '';
      container.appendChild(errorElement);
    }

    /**
     * Display module not loaded error in container
     */
    static async displayModuleNotLoaded(container, moduleName, backRoute = '') {
      const errorElement = await this.moduleNotLoaded(moduleName, backRoute);
      container.innerHTML = '';
      container.appendChild(errorElement);
    }
  }

  // Make available globally
  if (typeof window !== 'undefined') {
    window.CurriculumErrorTemplate = CurriculumErrorTemplate;
  }
}
