if (typeof window !== 'undefined' && !window.InterviewForm) {
  class InterviewForm {
    constructor(applicationOrEngine, rootURL) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || this.app?.mainContainer || document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? window.__ROOT_URL__ ?? '';
      this.form = null;
      this.ui = null;
      this.currentEditId = null;
      this.interviewService = null;
      this.statusService = null;
      this.returnRoute = null;
      this.scheduler = null;
    }

    async render(editId = null) {
      if (!this.container) return false;

      this.interviewService = new window.InterviewService(this.rootURL);
      this.statusService = new window.ApplicationStatusService(this.rootURL);
      this.container.innerHTML = '';
      this.currentEditId = editId;

      const cameFromApplicationReportTable = RecruitFormTemplate.getNavigationSource('interviewFormSource') === 'applicationReportTable';
      const cameFromTable = RecruitFormTemplate.checkIfCameFromTable('interviewFormSource');
      
      if (cameFromApplicationReportTable) {
        this.returnRoute = { link: 'recruit/applicationreport/list', text: 'Back to Application Report Table' };
      } else if (cameFromTable) {
        this.returnRoute = { link: 'recruit/interview/list', text: 'Back to Interview Table' };
      } else {
        this.returnRoute = { link: 'recruit', text: 'Back to Recruit Menu' };
      }

      const isEdit = editId != null;
      const formEl = await RecruitFormTemplate.getForm({
        title: 'Interview',
        subtitle: isEdit ? `Edit interview #${editId}` : 'Add a new interview',
        formId: 'interview-form',
        backLink: this.returnRoute.link,
        backText: this.returnRoute.text,
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      }, isEdit ? 'edit' : 'create');

      this.container.appendChild(formEl);

      if (!isEdit) {
        const helpDiv = this._createHelpMessage();
        const formContainer = formEl.querySelector('#interview-form');
        if (formContainer?.parentNode) {
          formContainer.parentNode.insertBefore(helpDiv, formContainer);
        }
      }

      this.ui = RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'interviewMessages',
        resultId: 'interviewResult',
      });

      this.form = new window.AdvanceFormRender(this.engine, {
        modelPath: 'recruit/interview',
        targetSelector: '#interview-form',
        submitHandler: (fd) => this.handleSubmit(fd),
        autoFocus: true,
        validateOnBlur: true,
      });

      await this.form.render();

      this.scheduler = window.InterviewScheduler.fromSessionStorage(this.form);
      if (!isEdit && this.scheduler.isScheduling()) {
        const preFillData = this.scheduler.getPreFillData();
        if (preFillData) {
          this.form.setData(preFillData);
          const infoMessage = this.scheduler.getInfoMessage();
          if (infoMessage) this.ui?.showMessage(infoMessage, 'info');
        }
        this.scheduler.applySchedulingRestrictions(200);
        this.scheduler.cleanupSession();
      }

      if (!isEdit) {
        const formContainer = document.getElementById('interview-form');
        if (formContainer) {
          const setupButton = this._createSetupTestDataButton();
          formContainer.appendChild(setupButton);
        }
      }
      
      if (isEdit) {
        await this.loadInterviewData(editId);
      }
      
      return true;
    }

    _createHelpMessage() {
      const helpDiv = document.createElement('div');
      helpDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4';

      const h3 = document.createElement('h3');
      h3.className = 'font-semibold text-blue-900 mb-2 flex items-center gap-2';
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'w-5 h-5';
      iconSpan.textContent = 'ℹ️';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = 'ข้อมูลที่ต้องมีก่อนสร้าง Interview';
      
      h3.appendChild(iconSpan);
      h3.appendChild(titleSpan);

      const ul = document.createElement('ul');
      ul.className = 'text-sm text-blue-800 space-y-1 ml-7';

      // List item 1
      const li1 = document.createElement('li');
      li1.appendChild(document.createTextNode('✓ '));
      const strong1 = document.createElement('strong');
      strong1.textContent = 'Instructor';
      li1.appendChild(strong1);
      li1.appendChild(document.createTextNode(' (อาจารย์) - จาก Common Module'));

      // List item 2
      const li2 = document.createElement('li');
      li2.appendChild(document.createTextNode('✓ '));
      const strong2 = document.createElement('strong');
      strong2.textContent = 'Application Report';
      li2.appendChild(strong2);
      li2.appendChild(document.createTextNode(' (รายงานการสมัคร) - ต้องสร้างก่อน'));

      // List item 3
      const li3 = document.createElement('li');
      li3.appendChild(document.createTextNode('💡 หรือกดปุ่ม '));
      const strong3 = document.createElement('strong');
      strong3.textContent = '" Setup Test Data"';
      li3.appendChild(strong3);
      li3.appendChild(document.createTextNode(' ด้านล่างเพื่อสร้างข้อมูลทดสอบ'));

      ul.appendChild(li1);
      ul.appendChild(li2);
      ul.appendChild(li3);

      helpDiv.appendChild(h3);
      helpDiv.appendChild(ul);
      return helpDiv;
    }

    _createSetupTestDataButton() {
      const setupButton = document.createElement('button');
      setupButton.type = 'button';
      setupButton.className = 'w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2';
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'w-5 h-5';
      iconSpan.textContent = '➕';
      
      const labelSpan = document.createElement('span');
      labelSpan.textContent = '🔧 Setup Test Data (สร้างข้อมูลทดสอบทั้งหมด)';
      
      setupButton.appendChild(iconSpan);
      setupButton.appendChild(labelSpan);
      setupButton.addEventListener('click', () => this.setupTestData());
      return setupButton;
    }

    async loadInterviewData(id) {
      if (!id) return;
      this.ui?.showMessage(`Loading interview #${id}...`, 'info');
      
      const result = await this.interviewService.getById(id);
      if (result.success) {
        const formData = { ...result.data };
        if (formData.scheduled_appointment) {
          formData.scheduled_appointment = new Date(formData.scheduled_appointment).toISOString().slice(0, 16);
        }
        if (formData.evaluated_at) {
          formData.evaluated_at = new Date(formData.evaluated_at).toISOString().slice(0, 16);
        }
        this.form.setData(formData);
        this.ui?.showMessage(`Editing interview ID ${id}`, 'info');
      } else {
        this.ui?.showMessage(`Error loading interview: ${result.error}`, 'error');
      }
    }

    async handleSubmit(formData) {
      const isEdit = this.currentEditId != null;
      this.ui?.showMessage(`${isEdit ? 'Updating' : 'Creating'} interview...`, 'info');

      const result = await this.interviewService.save(formData, this.currentEditId);
      
      if (result.success) {
        const action = isEdit ? 'updated' : 'created';
        const message = `Interview ${action} successfully!${result.id ? ' ID: ' + result.id : ''}`;
        
        this.ui?.clearMessages();
        this.ui?.renderResult(result.data, 'success', message);
        
        if (!isEdit) RecruitFormTemplate.resetFormFields(this.form);
        

        if (!isEdit && this.scheduler?.isScheduling()) {
          try {
            const statusConstants = await this.statusService.getStatusConstants();
            if (statusConstants['Interview']) {
              await this.scheduler.updateApplicationReportStatus(formData.application_report_id, 'Interview', this.rootURL);
            }
          } catch (error) {
            console.error('Failed to update application report status:', error);
          }
        }
        
        RecruitFormTemplate.dispatchChangeEvent('interviewChanged', { action: isEdit ? 'update' : 'create', id: result.id, data: result.data });
        
        setTimeout(() => {
          const returnRoute = this.returnRoute?.link || 'recruit/interview/list';
          RecruitFormTemplate.navigateTo(returnRoute);
          RecruitFormTemplate.clearNavigationSource('interviewFormSource');
        }, 2000);
        
        return true;
      } else {
        this.ui?.showMessage(result.error, 'error');
        this.ui?.renderResult({ error: result.error }, 'error');
        return false;
      }
    }

    async setupTestData() {
      if (!confirm('สร้างข้อมูลทดสอบทั้งหมด (Faculty, Department, Instructor, Applicant, ApplicationRound, ApplicationReport)?\n\nข้อมูลที่มีอยู่จะไม่ถูกลบ (ON CONFLICT DO NOTHING)')) {
        return;
      }

      this.ui?.showMessage('กำลังสร้างข้อมูลทดสอบ...', 'info');
      const result = await this.interviewService.setupTestData();

      if (result.success) {
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
        this.ui?.showMessage('❌ ล้มเหลว: ' + result.error, 'error');
      }
    }

    setFormData(data) {
      if (this.form && data) this.form.setData(data);
    }

    getFormData() {
      return this.form?.getFormData ? this.form.getFormData() : {};
    }
  }

  window.InterviewForm = InterviewForm;
}
