
if (typeof window !== 'undefined' && !window.InterviewList) {
  class InterviewList {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};

      this.engine =
        this.app.templateEngine            
          ? this.app.templateEngine
          : this.app;                      

      this.container =
        this.engine?.mainContainer ||
        this.app?.mainContainer ||
        document.querySelector('#app') ||  
        null;

      this.rootURL =
        rootURL ??
        this.app?.rootURL ??
        window.RootURL ??
        window.__ROOT_URL__ ??
        '';

      this.table = null;
      this.ui = null;
    }

    _assertContainer() {
      if (!this.container) {
        console.error('InterviewList: mainContainer not found.');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer()) return false;

      window.interviewList = this;

      this.container.innerHTML = '';

      if (typeof window.RecruitTableTemplate?.getTable !== 'function') {
        console.error('RecruitTableTemplate is not available.');
        this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">RecruitTableTemplate is missing.</div>`;
        return false;
      }

      const tableEl = await window.RecruitTableTemplate.getTable({
        title: 'Interview Management',
        subtitle: 'View and manage all interviews',
        tableId: 'interview-table',
        panelTitle: 'Interview List',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath:
          'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, 'manage');

      this.container.appendChild(tableEl);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(tableEl, {
        messagesId: 'interviewTableMessages',
        resultId: 'interviewTableResult',
      });

      if (typeof window.AdvanceTableRender !== 'function') {
        console.error('AdvanceTableRender is not available.');
        this.ui?.showMessage?.('Table renderer not available', 'error');
        return false;
      }

      let interviews = [];
      try {
        console.log('Fetching interviews from:', `${this.rootURL}/recruit/GetInterviews`);
        const response = await fetch(`${this.rootURL}/recruit/GetInterviews`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Interview API response:', result);
        
        if (result.isSuccess) {
          interviews = result.result || [];
          console.log('Loaded interviews:', interviews.length, 'records');
        } else {
          console.error('API returned error:', result.message);
          this.ui?.showMessage?.('API Error: ' + (result.message || 'Unknown error'), 'error');
        }
        
        if (interviews.length === 0) {
          console.warn('No interviews found. Click "Setup Test Data" to create sample data.');
        }
      } catch (err) {
        console.error('Error loading interviews:', err);
        this.ui?.showMessage?.('Failed to load interviews: ' + err.message, 'error');
      }

      this.renderTable(interviews);

      this.addActionButtons(tableEl);

      if (interviews.length === 0) {
        this.ui?.showMessage?.(
          'No interview records found. Click "🔧 Setup Test Data" to create sample data.',
          'info'
        );
      }

      return true;
    }

    renderTable(interviews) {
      const container = document.getElementById('recruit-table-container');
      if (!container) {
        console.error('Table container not found');
        return;
      }

      const tableHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${interviews.map(interview => this.renderTableRow(interview)).join('')}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = tableHTML;
      
      this._bindTableActions(container);
    }

    _bindTableActions(container) {
      if (!container) return;
      
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (!action || !id) return;

        if (action === 'edit') this.edit(id);
        else if (action === 'delete') this.deleteInterview(id);
      });
    }

    renderTableRow(interview) {
      const instructorName = interview.Instructor 
        ? `${interview.Instructor.first_name || ''} ${interview.Instructor.last_name || ''}`.trim()
        : `ID: ${interview.instructor_id}`;

      const applicantName = interview.ApplicationReport?.Applicant
        ? `${interview.ApplicationReport.Applicant.first_name || ''} ${interview.ApplicationReport.Applicant.last_name || ''}`.trim()
        : `Report ID: ${interview.application_report_id}`;

      const scheduledDate = interview.scheduled_appointment 
        ? new Date(interview.scheduled_appointment).toLocaleDateString()
        : '-';

      const score = interview.total_score ? interview.total_score.toFixed(1) : '-';

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${interview.ID}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${instructorName}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${applicantName}</td>
          <td class="px-6 py-4 whitespace-nowrap">${this.getStatusBadge(interview.interview_status)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${scheduledDate}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${score}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div style="white-space:nowrap;">
              <button class="text-indigo-600 hover:text-indigo-900 font-medium text-sm" data-action="edit" data-id="${interview.ID}" style="margin-right:8px;">Edit</button>
              <button class="text-red-600 hover:text-red-900 font-medium text-sm" data-action="delete" data-id="${interview.ID}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }

    addActionButtons(root) {
      let toolbar = root.querySelector('.recruit-toolbar');
      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'recruit-toolbar flex gap-2 mb-4';
        const header = root.querySelector('.recruit-header');
        if (header) {
          header.after(toolbar);
        } else {
          root.prepend(toolbar);
        }
      }

      toolbar.innerHTML = `
        <button id="btnCreateInterview" class="btn" style="background: #10b981; color: white;">
          ➕ Create New
        </button>
        <button id="btnSetupData" class="btn" style="background: #f59e0b; color: white;">
          🔧 Setup Test Data
        </button>
        <button id="btnRefresh" class="btn" style="background: #6366f1; color: white;">
          🔄 Refresh
        </button>
      `;

      document.getElementById('btnCreateInterview')?.addEventListener('click', () => this.goToCreate());
      document.getElementById('btnSetupData')?.addEventListener('click', () => this.setupTestData());
      document.getElementById('btnRefresh')?.addEventListener('click', () => this.refresh());
    }

    getStatusBadge(status) {
      const colors = {
        'Scheduled': 'bg-blue-100 text-blue-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        'Evaluated': 'bg-purple-100 text-purple-800',
        'Accepted': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Cancelled': 'bg-gray-100 text-gray-800'
      };
      const color = colors[status] || 'bg-gray-100 text-gray-800';
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}">${status || 'N/A'}</span>`;
    }

    async edit(id) {
      window.location.hash = `#recruit/interview/edit/${id}`;
    }

    async deleteInterview(id) {
      if (!confirm(`Are you sure you want to delete Interview #${id}?`)) return;

      try {
        const response = await fetch(`${this.rootURL}/recruit/DeleteInterview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(id) })
        });

        const result = await response.json();

        if (result.isSuccess) {
          this.ui?.showMessage('Interview deleted successfully!', 'success');
          await this.refresh();
        } else {
          this.ui?.showMessage('Delete failed: ' + (result.message || ''), 'error');
        }
      } catch (err) {
        console.error('Delete error:', err);
        this.ui?.showMessage('Error: ' + err.message, 'error');
      }
    }

    async setupTestData() {
      if (!confirm('This will create test data for all related tables. Continue?')) return;

      this.ui?.showMessage('Setting up test data...', 'info');

      try {
        const response = await fetch(`${this.rootURL}/recruit/SetupTestData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.isSuccess) {
          this.ui?.showMessage('✅ Test data created successfully!', 'success');
          await this.refresh();
        } else {
          this.ui?.showMessage('❌ Failed: ' + (result.message || result.result), 'error');
        }
      } catch (err) {
        this.ui?.showMessage('❌ Error: ' + err.message, 'error');
      }
    }

    goToCreate() {
      window.location.hash = '#recruit/interview/create';
    }

    async refresh() {
      this.ui?.showMessage('Refreshing...', 'info');
      try {
        const response = await fetch(`${this.rootURL}/recruit/GetInterviews`);
        const result = await response.json();
        const interviews = result.isSuccess ? result.result : [];
        this.renderTable(interviews);
        this.ui?.clearMessages();
        this.ui?.showMessage('Refreshed successfully', 'success');
        setTimeout(() => this.ui?.clearMessages(), 2000);
      } catch (err) {
        this.ui?.showMessage('Failed to refresh: ' + err.message, 'error');
      }
    }
  }

  window.InterviewList = InterviewList;
}

