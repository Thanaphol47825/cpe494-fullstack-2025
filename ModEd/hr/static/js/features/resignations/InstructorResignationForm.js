// Instructor Resignation Form Feature using Core Module's FormRender
if (typeof HrInstructorResignationFormFeature === 'undefined') {
class HrInstructorResignationFormFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    this.templateEngine.mainContainer.innerHTML = "";
    await this.#createDynamicInstructorResignationForm();
    return true;
  }

  async #createDynamicInstructorResignationForm() {
    try {
      // Use hardcoded schema since API endpoint doesn't exist
      const schema = [
        {
          type: "text",
          name: "instructor_code",
          label: "Instructor Code",
          required: true,
          placeholder: "Enter instructor code (e.g., INS001)"
        },
        {
          type: "textarea",
          name: "reason",
          label: "Reason for Resignation",
          required: true,
          placeholder: "Please provide detailed reason for resignation"
        },
        {
          type: "date",
          name: "effective_date",
          label: "Effective Date",
          required: true
        },
        {
          type: "textarea",
          name: "additional_notes",
          label: "Additional Notes",
          required: false,
          placeholder: "Any additional information or notes"
        }
      ];

      // Create page structure with manual form
      const pageHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">Create Instructor Resignation</h1>
              <p class="text-xl text-gray-600 max-w-2xl mx-auto">Submit instructor resignation request</p>
            </div>

            <!-- Form Container -->
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div class="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                  <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Instructor Resignation Information
                </h2>
              </div>
              
              <div class="p-8">
                <form id="instructorResignationForm" class="space-y-6">
                  <!-- Instructor Code -->
                  <div>
                    <label for="instructor_code" class="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Code <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="instructor_code" 
                      name="instructor_code" 
                      required
                      placeholder="Enter instructor code (e.g., INS001)"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <!-- Reason for Resignation -->
                  <div>
                    <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Resignation <span class="text-red-500">*</span>
                    </label>
                    <textarea 
                      id="reason" 
                      name="reason" 
                      required
                      rows="4"
                      placeholder="Please provide detailed reason for resignation"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <!-- Effective Date -->
                  <div>
                    <label for="effective_date" class="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      id="effective_date" 
                      name="effective_date" 
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <!-- Additional Notes -->
                  <div>
                    <label for="additional_notes" class="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea 
                      id="additional_notes" 
                      name="additional_notes" 
                      rows="3"
                      placeholder="Any additional information or notes"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <!-- Submit Button -->
                  <div class="pt-4">
                    <button 
                      type="submit" 
                      class="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Submit Resignation Request
                    </button>
                  </div>
                </form>
                
                <!-- Status Message -->
                <div class="text-center mt-6">
                  <span id="formStatus" class="text-sm font-medium text-gray-500"></span>
                </div>
              </div>
            </div>

            <!-- Result Box -->
            <div id="resultBox" class="hidden mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Form Submission Result
                </h3>
              </div>
              <div class="p-6">
                <div id="resultContent"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Set the page HTML
      this.templateEngine.mainContainer.innerHTML = pageHTML;

      // Attach form submit handler
      const form = this.templateEngine.mainContainer.querySelector('#instructorResignationForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          this.#handleFormSubmit(data);
        });
      }

    } catch (error) {
      console.error('Error creating instructor resignation form:', error);
      this.#showError(error.message);
    }
  }

  async #handleFormSubmit(formData) {
    try {
      // Show loading state
      this.#updateFormStatus('Submitting resignation request...', 'text-blue-600');
      
      // Prepare the data for submission - match backend field names
      const submissionData = {
        InstructorCode: formData.instructor_code,
        Reason: formData.reason
        // Note: Backend only accepts InstructorCode and Reason
        // effective_date and additional_notes are not used by the API
      };

      // Submit to API
      const response = await fetch(`${this.rootURL}/hr/resignation-instructor-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      
      // Show success message
      this.#showSuccess(result);
      
    } catch (error) {
      console.error('Error submitting instructor resignation:', error);
      this.#showError(error.message);
    }
  }

  #showSuccess(result) {
    // Check if mainContainer exists before trying to update
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error('Template engine or main container not available for success display');
      return;
    }

    this.#updateFormStatus('Resignation request submitted successfully!', 'text-green-600');
    
    const resultBox = this.templateEngine.mainContainer.querySelector('#resultBox');
    const resultContent = this.templateEngine.mainContainer.querySelector('#resultContent');
    
    if (resultBox && resultContent) {
      resultContent.innerHTML = `
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h4 class="text-xl font-semibold text-gray-900 mb-2">Resignation Request Submitted</h4>
        <p class="text-gray-600 mb-4">Your instructor resignation request has been submitted successfully and is pending review.</p>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-green-800">
            <strong>Message:</strong> ${result.message || 'Request submitted successfully'}<br>
            <strong>Status:</strong> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Review</span>
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="hr/resignation/instructor" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View All Requests
          </a>
          <button onclick="location.reload()" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Submit Another
          </button>
        </div>
      </div>
    `;
    
      resultBox.classList.remove('hidden');
    }
  }

  #showError(message) {
    // Check if mainContainer exists before trying to update
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error('Template engine or main container not available for error display');
      return;
    }

    this.#updateFormStatus(`Error: ${message}`, 'text-red-600');
    
    const resultBox = this.templateEngine.mainContainer.querySelector('#resultBox');
    const resultContent = this.templateEngine.mainContainer.querySelector('#resultContent');
    
    if (resultBox && resultContent) {
      resultContent.innerHTML = `
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h4 class="text-xl font-semibold text-gray-900 mb-2">Submission Failed</h4>
          <p class="text-gray-600 mb-4">There was an error submitting your resignation request.</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-red-800">${message}</p>
          </div>
          <button onclick="location.reload()" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Try Again
          </button>
        </div>
      `;
      
      resultBox.classList.remove('hidden');
    } else {
      // Fallback: show simple error message
      this.templateEngine.mainContainer.innerHTML = `
        <div class="min-h-screen bg-red-50 flex items-center justify-center">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p class="text-gray-600 mb-4">${message}</p>
              <button onclick="location.reload()" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  #updateFormStatus(message, className = 'text-gray-600') {
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error('Template engine or main container not available for status update');
      return;
    }

    const statusElement = this.templateEngine.mainContainer.querySelector('#formStatus');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `text-sm font-medium ${className}`;
    }
  }
}

// Register the class globally
if (typeof window !== 'undefined') {
  window.HrInstructorResignationFormFeature = HrInstructorResignationFormFeature;
}
}
