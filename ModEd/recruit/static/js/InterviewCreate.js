
if (typeof window !== 'undefined' && !window.InterviewCreate) {
  class InterviewCreate {
    constructor(applicationOrEngine, rootURL, interviewId = null) {
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

      this.interviewId = interviewId;
      this.form = null;
      this.ui = null;
    }

    _assertContainer() {
      if (!this.container) {
        console.error('InterviewCreate: mainContainer not found.');
        return false;
      }
      return true;
    }

    async render() {
      if (!this._assertContainer()) return false;

      this.container.innerHTML = '';

      if (typeof window.RecruitFormTemplate?.getForm !== 'function') {
        console.error('RecruitFormTemplate is not available. Make sure RecruitFormTemplate.js is loaded first.');
        this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">RecruitFormTemplate is missing.</div>`;
        return false;
      }

      const formEl = await window.RecruitFormTemplate.getForm({
        title: this.interviewId ? 'Edit Interview' : 'Create Interview',
        subtitle: this.interviewId ? 'Update interview information' : 'Add a new interview',
        formId: 'interview-form',
        backLink: 'recruit/interview/list',
        backText: 'Back to Interview List',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath:
          'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, this.interviewId ? 'edit' : 'create');

      this.container.appendChild(formEl);

      if (!this.interviewId) {
        const helpDiv = document.createElement('div');
        helpDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4';
        helpDiv.innerHTML = `
          <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            ข้อมูลที่ต้องมีก่อนสร้าง Interview
          </h3>
          <ul class="text-sm text-blue-800 space-y-1 ml-7">
            <li>✓ <strong>Instructor</strong> (อาจารย์) - จาก Common Module</li>
            <li>✓ <strong>Application Report</strong> (รายงานการสมัคร) - ต้องสร้างก่อน</li>
            <li>💡 หรือกดปุ่ม <strong>"🔧 Setup Test Data"</strong> ด้านล่างเพื่อสร้างข้อมูลทดสอบ</li>
          </ul>
        `;
        const formContainer = formEl.querySelector('#interview-form');
        if (formContainer && formContainer.parentNode) {
          formContainer.parentNode.insertBefore(helpDiv, formContainer);
        }
      }

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'interviewMessages',
        resultId: 'interviewResult',
      });

      if (typeof window.AdvanceFormRender !== 'function') {
        console.error('AdvanceFormRender is not available.');
        this.ui?.showMessage?.('Form renderer not available', 'error');
        return false;
      }

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/interview',
        targetSelector: '#interview-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();

      if (!this.interviewId) {
        const formContainer = document.getElementById('interview-form');
        if (formContainer) {
          const setupButton = document.createElement('button');
          setupButton.type = 'button';
          setupButton.className = 'w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2';
          setupButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            🔧 Setup Test Data (สร้างข้อมูลทดสอบทั้งหมด)
          `;
          setupButton.addEventListener('click', () => this.setupTestData());
          formContainer.appendChild(setupButton);
        }
      }

      // Load existing data if editing
      if (this.interviewId) {
        await this.loadExistingData(this.interviewId);
      }

      return true;
    }

    async loadExistingData(id) {
      try {
        console.log('Loading interview data for ID:', id);
        const resp = await fetch(`${this.rootURL}/recruit/GetInterview/${id}`);
        const data = await resp.json();
        
        console.log('Interview data received:', data);
        
        if (data.isSuccess && data.result) {
          const interview = data.result;
          
          this.setFormValue('instructor_id', interview.instructor_id);
          this.setFormValue('application_report_id', interview.application_report_id);
          this.setFormValue('scheduled_appointment', 
            interview.scheduled_appointment ? 
              new Date(interview.scheduled_appointment).toISOString().slice(0, 16) : '');
          this.setFormValue('interview_status', interview.interview_status);
          this.setFormValue('total_score', interview.total_score);
          this.setFormValue('evaluated_at', 
            interview.evaluated_at ? 
              new Date(interview.evaluated_at).toISOString().slice(0, 16) : '');
          this.setFormValue('criteria_scores', interview.criteria_scores);
          
          this.ui?.showMessage?.('Data loaded successfully', 'success');
          setTimeout(() => this.ui?.clearMessages(), 2000);
        }
      } catch (err) {
        console.error("Error loading interview:", err);
        this.ui?.showMessage?.('Failed to load interview data: ' + err.message, 'error');
      }
    }

    setFormValue(name, value) {
      const element = document.querySelector(`#interview-form [name="${name}"]`);
      if (element) {
        element.value = value || '';
        console.log(`Set ${name} =`, value);
      } else {
        console.warn(`Form field not found: ${name}`);
      }
    }

    async handleSubmit(formData) {
      this.ui?.showMessage('Saving interview...', 'info');

      const payload = this.transformData(formData);

      let resp, data;
      try {
        const url = this.interviewId 
          ? `${this.rootURL}/recruit/UpdateInterview`
          : `${this.rootURL}/recruit/CreateInterview`;

        if (this.interviewId) {
          payload.id = parseInt(this.interviewId);
        }

        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        this.ui?.showMessage('Network error while saving interview.', 'error');
        this.ui?.renderResult({ error: 'Network error' }, 'error');
        return false;
      }

      try { data = await resp.json(); } catch { data = {}; }

      if (!resp.ok || data?.isSuccess !== true) {
        const msg = data?.message || `Request failed (${resp.status}${resp.statusText ? ' ' + resp.statusText : ''})`;
        this.ui?.showMessage(msg, 'error');
        this.ui?.renderResult(data, 'error');
        return false;
      }

      const resultArr = Array.isArray(data.result) ? data.result : (data.result ? [data.result] : []);
      const id = resultArr[0]?.ID ?? resultArr[0]?.Id ?? resultArr[0]?.id;

      this.ui?.clearMessages();
      this.ui?.renderResult(resultArr, 'success', 
        this.interviewId 
          ? `Interview updated successfully!${id ? ' ID: ' + id : ''}` 
          : `Interview created successfully!${id ? ' ID: ' + id : ''}`
      );

      if (!this.interviewId) {
        this.safeFormReset();
      }
      
      return true;
    }

    transformData(formData) {
      const toRFC3339 = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
      };

      return {
        ...formData,
        scheduled_appointment: toRFC3339(formData.scheduled_appointment),
        evaluated_at: toRFC3339(formData.evaluated_at),
        instructor_id: formData.instructor_id ? parseInt(formData.instructor_id) : 0,
        application_report_id: formData.application_report_id ? parseInt(formData.application_report_id) : 0,
        total_score: formData.total_score ? parseFloat(formData.total_score) : 0,
      };
    }

    safeFormReset() {
      const root = document.getElementById('interview-form');
      if (!root) return;

      root.querySelectorAll('input, select, textarea').forEach((el) => {
        const tag = (el.tagName || '').toLowerCase();
        const type = (el.type || '').toLowerCase();

        if (tag === 'input') {
          if (type === 'checkbox' || type === 'radio') el.checked = false;
          else el.value = '';
        } else if (tag === 'select') {
          el.selectedIndex = 0;
        } else if (tag === 'textarea') {
          el.value = '';
        }
      });
    }

    async setupTestData() {
      if (!confirm('สร้างข้อมูลทดสอบทั้งหมด (Faculty, Department, Instructor, Applicant, ApplicationRound, ApplicationReport)?\n\nข้อมูลที่มีอยู่จะไม่ถูกลบ (ON CONFLICT DO NOTHING)')) {
        return;
      }

      this.ui?.showMessage('กำลังสร้างข้อมูลทดสอบ...', 'info');

      try {
        const response = await fetch(`${this.rootURL}/recruit/SetupTestData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.isSuccess) {
          this.ui?.clearMessages();
          this.ui?.showMessage('✅ สร้างข้อมูลทดสอบสำเร็จ!', 'success');
          this.ui?.renderResult({
            message: 'ข้อมูลที่สร้าง:',
            faculties: 'Faculty IDs: 1, 2',
            departments: 'Department IDs: 1, 2, 3',
            instructors: 'Instructor IDs: 1, 2, 3 (ใช้ได้)',
            applicants: 'Applicant IDs: 1-5',
            application_rounds: 'Round IDs: 1, 2',
            application_reports: 'Report IDs: 1-5 (ใช้ได้)',
            hint: 'ตอนนี้สามารถใส่ Instructor ID (1-3) และ Application Report ID (1-5) ได้เลย'
          }, 'success');
        } else {
          this.ui?.showMessage('❌ ล้มเหลว: ' + (result.message || result.result), 'error');
        }
      } catch (err) {
        this.ui?.showMessage('❌ Error: ' + err.message, 'error');
      }
    }
  }

  window.InterviewCreate = InterviewCreate;
}

