// Leave History Feature - Combined view using AdvanceTableRender
if (typeof window !== 'undefined' && !window.HrLeaveHistoryFeature) {
  class HrLeaveHistoryFeature {
    constructor(templateEngine, rootURL) {
      this.templateEngine = templateEngine;
      this.rootURL = rootURL;
      this.apiService = new HrApiService(rootURL);
      this.errorHandler = window.HrErrorHandler || null;
      this.studentTable = null;
      this.instructorTable = null;
      this.studentRequests = [];
      this.instructorRequests = [];
    }

    async render() {
      try {
        // Ensure templates are loaded
        if (!this.templateEngine.template) {
          await this.templateEngine.fetchTemplate();
        }

        // Load all requests first
        await this.#loadAllRequests();

        // Calculate statistics
        const stats = this.#calculateStatistics();

        // Set up container using DOM APIs (no HTML strings)
        this.templateEngine.mainContainer.innerHTML = '';
        const pageContainer = this.#createPageContainer(stats);
        this.templateEngine.mainContainer.appendChild(pageContainer);

        // Render student table
        this.studentTable = new window.AdvanceTableRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveStudent',
          data: this.studentRequests,
          targetSelector: '#student-table-container',
          customColumns: [
            {
              name: 'type',
              label: 'Type',
              template: '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Student</span>'
            }
          ]
        });
        await this.studentTable.render();

        // Render instructor table
        this.instructorTable = new window.AdvanceTableRender(this.templateEngine, {
          modelPath: 'hr/RequestLeaveInstructor',
          data: this.instructorRequests,
          targetSelector: '#instructor-table-container',
          customColumns: [
            {
              name: 'type',
              label: 'Type',
              template: '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Instructor</span>'
            }
          ]
        });
        await this.instructorTable.render();

      } catch (error) {
        console.error('Error rendering leave history:', error);
        if (this.errorHandler) {
          this.errorHandler.handleError(error, { context: 'leave_history_render' });
        }
        this.templateEngine.mainContainer.innerHTML = '';
        const errorPage = this.#createErrorPage(error.message || 'Unable to load leave history.');
        this.templateEngine.mainContainer.appendChild(errorPage);
      }
    }

    async #loadAllRequests() {
      try {
        const [studentResponse, instructorResponse] = await Promise.all([
          this.apiService.fetchStudentLeaveRequests(),
          this.apiService.fetchInstructorLeaveRequests()
        ]);

        this.studentRequests = this.#normalizeRequests(studentResponse);
        this.instructorRequests = this.#normalizeRequests(instructorResponse);
      } catch (error) {
        console.error('Error loading requests:', error);
        this.studentRequests = Array.isArray(this.studentRequests) ? this.studentRequests : [];
        this.instructorRequests = Array.isArray(this.instructorRequests) ? this.instructorRequests : [];
      }
    }

    #normalizeRequests(response) {
      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.result)) {
        return response.result;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    }

    #createPageContainer(stats) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-7xl mx-auto px-4';
      
      // Header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'mb-8';
      
      const h1 = document.createElement('h1');
      h1.className = 'text-3xl font-bold text-gray-900 mb-2';
      h1.textContent = 'Leave Request History';
      
      const p = document.createElement('p');
      p.className = 'text-gray-600';
      p.textContent = 'Complete history of all leave requests';
      
      headerDiv.appendChild(h1);
      headerDiv.appendChild(p);
      
      // Statistics Cards
      const statsGrid = document.createElement('div');
      statsGrid.className = 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8';
      
      // Total card
      statsGrid.appendChild(this.#createStatCard('Total', stats.total, 'blue', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'));
      
      // Approved card
      statsGrid.appendChild(this.#createStatCard('Approved', stats.approved, 'green', 'M5 13l4 4L19 7'));
      
      // Pending card
      statsGrid.appendChild(this.#createStatCard('Pending', stats.pending, 'yellow', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'));
      
      // Rejected card
      statsGrid.appendChild(this.#createStatCard('Rejected', stats.rejected, 'red', 'M6 18L18 6M6 6l12 12'));
      
      // Student section
      const studentSection = document.createElement('div');
      studentSection.className = 'mb-8';
      
      const studentHeader = document.createElement('div');
      studentHeader.className = 'mb-4';
      
      const studentH2 = document.createElement('h2');
      studentH2.className = 'text-2xl font-bold text-gray-900 mb-2';
      studentH2.textContent = 'Student Leave Requests';
      
      const studentP = document.createElement('p');
      studentP.className = 'text-gray-600';
      studentP.textContent = `${stats.studentTotal} student leave request${stats.studentTotal !== 1 ? 's' : ''}`;
      
      studentHeader.appendChild(studentH2);
      studentHeader.appendChild(studentP);
      
      const studentTableContainer = document.createElement('div');
      studentTableContainer.id = 'student-table-container';
      studentTableContainer.className = 'bg-white rounded-2xl shadow-lg p-6';
      
      const studentLoading = document.createElement('div');
      studentLoading.className = 'text-center py-8 text-gray-500';
      studentLoading.textContent = 'Loading...';
      studentTableContainer.appendChild(studentLoading);
      
      studentSection.appendChild(studentHeader);
      studentSection.appendChild(studentTableContainer);
      
      // Instructor section
      const instructorSection = document.createElement('div');
      instructorSection.className = 'mb-8';
      
      const instructorHeader = document.createElement('div');
      instructorHeader.className = 'mb-4';
      
      const instructorH2 = document.createElement('h2');
      instructorH2.className = 'text-2xl font-bold text-gray-900 mb-2';
      instructorH2.textContent = 'Instructor Leave Requests';
      
      const instructorP = document.createElement('p');
      instructorP.className = 'text-gray-600';
      instructorP.textContent = `${stats.instructorTotal} instructor leave request${stats.instructorTotal !== 1 ? 's' : ''}`;
      
      instructorHeader.appendChild(instructorH2);
      instructorHeader.appendChild(instructorP);
      
      const instructorTableContainer = document.createElement('div');
      instructorTableContainer.id = 'instructor-table-container';
      instructorTableContainer.className = 'bg-white rounded-2xl shadow-lg p-6';
      
      const instructorLoading = document.createElement('div');
      instructorLoading.className = 'text-center py-8 text-gray-500';
      instructorLoading.textContent = 'Loading...';
      instructorTableContainer.appendChild(instructorLoading);
      
      instructorSection.appendChild(instructorHeader);
      instructorSection.appendChild(instructorTableContainer);
      
      // Back button
      const backButtonContainer = document.createElement('div');
      backButtonContainer.className = 'mt-6 text-center';
      
      const backLink = document.createElement('a');
      backLink.className = 'inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200';
      backLink.setAttribute('routerLink', 'hr/leave');
      backLink.textContent = 'Back to Leave Management';
      backButtonContainer.appendChild(backLink);
      
      innerDiv.appendChild(headerDiv);
      innerDiv.appendChild(statsGrid);
      innerDiv.appendChild(studentSection);
      innerDiv.appendChild(instructorSection);
      innerDiv.appendChild(backButtonContainer);
      pageDiv.appendChild(innerDiv);
      
      return pageDiv;
    }
    
    #createStatCard(label, value, color, svgPath) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-lg p-6';
      
      const flexDiv = document.createElement('div');
      flexDiv.className = 'flex items-center';
      
      const iconDiv = document.createElement('div');
      iconDiv.className = `flex-shrink-0 bg-${color}-100 rounded-lg p-3`;
      
      const svg = document.createElement('svg');
      svg.className = `w-8 h-8 text-${color}-600`;
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('viewBox', '0 0 24 24');
      
      const path = document.createElement('path');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('d', svgPath);
      svg.appendChild(path);
      iconDiv.appendChild(svg);
      
      const textDiv = document.createElement('div');
      textDiv.className = 'ml-4';
      
      const labelP = document.createElement('p');
      labelP.className = 'text-sm font-medium text-gray-600';
      labelP.textContent = label;
      
      const valueP = document.createElement('p');
      valueP.className = `text-2xl font-bold text-${color === 'yellow' ? 'yellow-600' : color === 'red' ? 'red-600' : color === 'green' ? 'green-600' : 'gray-900'}`;
      valueP.textContent = value;
      
      textDiv.appendChild(labelP);
      textDiv.appendChild(valueP);
      
      flexDiv.appendChild(iconDiv);
      flexDiv.appendChild(textDiv);
      card.appendChild(flexDiv);
      
      return card;
    }
    
    #createErrorPage(message) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = 'max-w-7xl mx-auto px-4';
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 mb-4';
      
      const p = document.createElement('p');
      p.className = 'text-red-800';
      p.textContent = `Error loading leave history: ${message}`;
      errorDiv.appendChild(p);
      
      const backLink = document.createElement('a');
      backLink.className = 'text-blue-600 hover:underline';
      backLink.setAttribute('routerLink', 'hr/leave');
      backLink.textContent = '← Back to Leave Management';
      
      innerDiv.appendChild(errorDiv);
      innerDiv.appendChild(backLink);
      pageDiv.appendChild(innerDiv);
      
      return pageDiv;
    }

    #calculateStatistics() {
      const allRequests = [...this.studentRequests, ...this.instructorRequests];
      const approved = allRequests.filter(r => (r.Status || r.status) === 'Approved').length;
      const pending = allRequests.filter(r => (r.Status || r.status) === 'Pending').length;
      const rejected = allRequests.filter(r => (r.Status || r.status) === 'Rejected').length;

      return {
        total: allRequests.length,
        approved,
        pending,
        rejected,
        studentTotal: this.studentRequests.length,
        instructorTotal: this.instructorRequests.length
      };
    }
  }

  window.HrLeaveHistoryFeature = HrLeaveHistoryFeature;
}
