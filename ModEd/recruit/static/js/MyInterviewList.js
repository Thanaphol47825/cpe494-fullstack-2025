// My Interview List for Instructor - ดูคิวสัมภาษณ์ (ทั้งหมด/ค้างประเมิน/ประเมินแล้ว)
if (typeof window !== 'undefined' && !window.MyInterviewList) {
  class MyInterviewList {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || 
                      this.app?.mainContainer || 
                      document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? '';
      
      this.service = null;
      this.ui = null;
      this.currentFilter = 'all'; 
    }

    async render(filter = 'all') {
      if (!this.container) return false;

      this.service = new window.InterviewService(this.rootURL);
      this.currentFilter = filter;
      this.container.innerHTML = '';

      const tableEl = await window.RecruitTableTemplate.getTable({
        title: '📋 คิวสัมภาษณ์ของฉัน',
        subtitle: filter === 'pending' ? 'คิวที่ค้างประเมิน' : 
                  filter === 'evaluated' ? 'คิวที่ประเมินแล้ว' : 
                  'ทั้งหมด',
        tableId: 'my-interview-table',
        panelTitle: 'My Interview Queue',
        backLink: 'recruit',
        backText: 'Back to Recruit Menu',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, 'manage');

      this.container.appendChild(tableEl);

      this.ui = window.RecruitTableTemplate.mountMessageAndResult(tableEl, {
        messagesId: 'myInterviewMessages',
        resultId: 'myInterviewResult',
      });

      this.addFilterButtons(tableEl);

      await this.loadInterviews();

      return true;
    }

    addFilterButtons(root) {
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
        <button id="btnFilterAll" class="btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                style="background: ${this.currentFilter === 'all' ? '#6366f1' : '#e5e7eb'}; color: ${this.currentFilter === 'all' ? 'white' : '#374151'};">
          📋 ทั้งหมด
        </button>
        <button id="btnFilterPending" class="btn ${this.currentFilter === 'pending' ? 'active' : ''}" 
                style="background: ${this.currentFilter === 'pending' ? '#f59e0b' : '#e5e7eb'}; color: ${this.currentFilter === 'pending' ? 'white' : '#374151'};">
          ⏳ ค้างประเมิน
        </button>
        <button id="btnFilterEvaluated" class="btn ${this.currentFilter === 'evaluated' ? 'active' : ''}" 
                style="background: ${this.currentFilter === 'evaluated' ? '#10b981' : '#e5e7eb'}; color: ${this.currentFilter === 'evaluated' ? 'white' : '#374151'};">
          ✅ ประเมินแล้ว
        </button>
        <button id="btnRefresh" class="btn" style="background: #6366f1; color: white;">
          🔄 Refresh
        </button>
      `;

      document.getElementById('btnFilterAll')?.addEventListener('click', () => this.render('all'));
      document.getElementById('btnFilterPending')?.addEventListener('click', () => this.render('pending'));
      document.getElementById('btnFilterEvaluated')?.addEventListener('click', () => this.render('evaluated'));
      document.getElementById('btnRefresh')?.addEventListener('click', () => this.loadInterviews());
    }

    async loadInterviews() {
      this.ui?.showMessage('กำลังโหลดข้อมูล...', 'info');

      let result;
      if (this.currentFilter === 'pending') {
        result = await this.service.getMyPendingInterviews();
      } else if (this.currentFilter === 'evaluated') {
        result = await this.service.getMyEvaluatedInterviews();
      } else {
        result = await this.service.getMyInterviews();
      }

      if (result.success) {
        this.renderTable(result.data || []);
        this.ui?.clearMessages();
        if (result.data.length === 0) {
          this.ui?.showMessage('ไม่พบข้อมูลสัมภาษณ์', 'info');
        }
      } else {
        this.ui?.showMessage(`เกิดข้อผิดพลาด: ${result.error}`, 'error');
      }
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สมัคร</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">นัดหมาย</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คะแนนรวม</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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

        if (action === 'evaluate') this.evaluateInterview(id);
        else if (action === 'view') this.viewInterview(id);
      });
    }

    renderTableRow(interview) {
      const applicantName = interview.ApplicationReport?.Applicant
        ? `${interview.ApplicationReport.Applicant.first_name || ''} ${interview.ApplicationReport.Applicant.last_name || ''}`.trim()
        : `Report ID: ${interview.application_report_id}`;

      const scheduledDate = interview.scheduled_appointment 
        ? new Date(interview.scheduled_appointment).toLocaleString('th-TH')
        : '-';

      const score = interview.total_score ? interview.total_score.toFixed(1) : '-';

      const isEvaluated = interview.interview_status === 'Evaluated' || interview.total_score > 0;
      const actionButton = isEvaluated 
        ? `<button class="text-blue-600 hover:text-blue-900 font-medium text-sm" data-action="view" data-id="${interview.ID}">👁️ ดูผล</button>`
        : `<button class="text-green-600 hover:text-green-900 font-medium text-sm" data-action="evaluate" data-id="${interview.ID}">📝 ประเมิน</button>`;

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${interview.ID}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${applicantName}</td>
          <td class="px-6 py-4 whitespace-nowrap">${this.getStatusBadge(interview.interview_status)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${scheduledDate}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${score}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            ${actionButton}
          </td>
        </tr>
      `;
    }

    getStatusBadge(status) {
      const colors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Evaluated': 'bg-purple-100 text-purple-800',
        'Accepted': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };
      const color = colors[status] || 'bg-gray-100 text-gray-800';
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}">${status || 'N/A'}</span>`;
    }

    async evaluateInterview(interviewId) {
      // Navigate to evaluation form
      if (window.RecruitTableTemplate) {
        window.RecruitTableTemplate.navigateTo(`recruit/interview/evaluate/${interviewId}`);
      } else {
        window.location.hash = `#recruit/interview/evaluate/${interviewId}`;
      }
    }

    async viewInterview(interviewId) {
      if (window.RecruitTableTemplate) {
        window.RecruitTableTemplate.navigateTo(`recruit/interview/edit/${interviewId}`);
      } else {
        window.location.hash = `#recruit/interview/edit/${interviewId}`;
      }
    }
  }

  window.MyInterviewList = MyInterviewList;
}

