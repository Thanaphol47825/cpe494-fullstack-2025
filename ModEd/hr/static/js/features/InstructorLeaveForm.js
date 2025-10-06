// Instructor Leave Request Form Feature
if (typeof window !== 'undefined' && !window.HrInstructorLeaveFormFeature) {
  class HrInstructorLeaveFormFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
    }

    async render() {
      try {
        // Fetch instructors for dropdown
        const instructorsResponse = await this.apiService.fetchInstructors();
        const instructors = instructorsResponse.result || instructorsResponse || [];

        const html = this.#generateFormHTML(instructors);
        this.templateEngine.mainContainer.innerHTML = html;
        this.#attachEventListeners();
      } catch (error) {
        console.error('Error rendering instructor leave form:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_form_render' });
        }
        this.templateEngine.mainContainer.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div class="max-w-4xl mx-auto px-4">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-red-800">Error loading form: ${error.message}</p>
              </div>
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        `;
      }
    }

    #generateFormHTML(instructors) {
      const leaveTypes = ['Sick', 'Vacation', 'Personal', 'Maternity', 'Other'];
      
      return `
        <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
          <div class="max-w-4xl mx-auto px-4">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Instructor Leave Request</h1>
              <p class="text-gray-600">Submit a new leave request for an instructor</p>
            </div>

            <!-- Form Card -->
            <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <form id="instructorLeaveForm" class="space-y-6">
                
                <!-- Instructor Selection -->
                <div>
                  <label for="instructor_code" class="block text-sm font-medium text-gray-700 mb-2">
                    Instructor <span class="text-red-500">*</span>
                  </label>
                  <select 
                    id="instructor_code" 
                    name="InstructorCode" 
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an instructor</option>
                    ${instructors.map(i => `
                      <option value="${i.instructor_code}">
                        ${i.instructor_code} - ${i.first_name} ${i.last_name}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Leave Type -->
                <div>
                  <label for="leave_type" class="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type <span class="text-red-500">*</span>
                  </label>
                  <select 
                    id="leave_type" 
                    name="LeaveType" 
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select leave type</option>
                    ${leaveTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                  </select>
                </div>

                <!-- Leave Date -->
                <div>
                  <label for="leave_date" class="block text-sm font-medium text-gray-700 mb-2">
                    Leave Date <span class="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    id="leave_date" 
                    name="DateStr" 
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Reason -->
                <div>
                  <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span class="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="reason" 
                    name="Reason" 
                    rows="4" 
                    required
                    placeholder="Please provide a detailed reason for the leave request..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <!-- Status Message -->
                <div id="formStatus" class="hidden"></div>

                <!-- Actions -->
                <div class="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
                  >
                    Submit Leave Request
                  </button>
                  <a 
                    routerLink="hr/leave/instructor" 
                    class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 text-center"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>

            <!-- Back Link -->
            <div class="text-center">
              <a routerLink="hr/leave" class="text-blue-600 hover:underline">← Back to Leave Management</a>
            </div>
          </div>
        </div>
      `;
    }

    #attachEventListeners() {
      const form = document.getElementById('instructorLeaveForm');
      if (form) {
        form.addEventListener('submit', this.#handleSubmit.bind(this));
      }
    }

    async #handleSubmit(event) {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const payload = {
        InstructorCode: formData.get('InstructorCode'),
        LeaveType: formData.get('LeaveType'),
        DateStr: formData.get('DateStr'),
        Reason: formData.get('Reason')
      };

      // Validate
      if (!payload.InstructorCode || !payload.LeaveType || !payload.DateStr || !payload.Reason) {
        this.#setStatus('Please fill in all required fields', 'error');
        return;
      }

      try {
        this.#setStatus('Submitting leave request...', 'info');
        
        const response = await this.apiService.createInstructorLeaveRequest(payload);
        
        this.#setStatus('Leave request submitted successfully!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
          this.templateEngine.routerLinks.navigateTo('hr/leave/instructor');
        }, 1500);
        
      } catch (error) {
        console.error('Error submitting leave request:', error);
        this.#setStatus(`Error: ${error.message}`, 'error');
        
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'instructor_leave_submit' });
        }
      }
    }

    #setStatus(message, type = 'info') {
      const statusEl = document.getElementById('formStatus');
      if (!statusEl) return;

      const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
      };

      statusEl.className = `border rounded-lg p-4 ${styles[type] || styles.info}`;
      statusEl.textContent = message;
      statusEl.classList.remove('hidden');

      if (type === 'success') {
        setTimeout(() => statusEl.classList.add('hidden'), 3000);
      }
    }
  }

  window.HrInstructorLeaveFormFeature = HrInstructorLeaveFormFeature;
}

