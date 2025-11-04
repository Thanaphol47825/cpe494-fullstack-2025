if (typeof window !== 'undefined' && !window.InterviewEvaluateForm) {
  class InterviewEvaluateForm {
    constructor(applicationOrEngine, rootURL, interviewId) {
      this.app = applicationOrEngine || {};
      this.engine = this.app.templateEngine || this.app;
      this.container = this.engine?.mainContainer || 
                      this.app?.mainContainer || 
                      document.querySelector('#app');
      this.rootURL = rootURL ?? this.app?.rootURL ?? window.RootURL ?? '';
      this.interviewId = interviewId;
      this.service = null;
      this.ui = null;
      this.interviewData = null;
    }

    async render() {
      if (!this.container || !this.interviewId) return false;

      this.service = new window.InterviewService(this.rootURL);
      this.container.innerHTML = '';

      const loadResult = await this.service.getById(this.interviewId);
      if (!loadResult.success) {
        this.container.innerHTML = `<div class="p-4 text-red-700 bg-red-50 rounded">${loadResult.error}</div>`;
        return false;
      }

      this.interviewData = loadResult.data;

      const formEl = await window.RecruitFormTemplate.getForm({
        title: '📝 ประเมินผู้สมัคร',
        subtitle: `กรอกคะแนนตามเกณฑ์สำหรับ Interview #${this.interviewId}`,
        formId: 'interview-evaluate-form',
        backLink: 'recruit/my/interviews',
        backText: 'Back to My Interviews',
        colorPrimary: '#6366f1',
        colorAccent: '#4f46e5',
        iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
      }, 'edit');

      this.container.appendChild(formEl);

      this.ui = window.RecruitFormTemplate.mountMessageAndResult(formEl, {
        messagesId: 'interviewEvaluateMessages',
        resultId: 'interviewEvaluateResult',
      });

      await this.createCriteriaForm(formEl);

      return true;
    }

    async createCriteriaForm(formEl) {
      const formContainer = formEl.querySelector('#interview-evaluate-form');
      if (!formContainer) return;

      let criteriaScores = {};
      if (this.interviewData.criteria_scores) {
        try {
          if (typeof this.interviewData.criteria_scores === 'string') {
            criteriaScores = JSON.parse(this.interviewData.criteria_scores);
          } else {
            criteriaScores = this.interviewData.criteria_scores;
          }
        } catch (e) {
          console.warn('Failed to parse criteria_scores:', e);
        }
      }

      const defaultCriteria = ['communication', 'technical', 'motivation'];
      
      const criteriaHTML = `
        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 class="font-semibold text-blue-900 mb-2">📋 เกณฑ์การประเมิน</h3>
            <p class="text-sm text-blue-800">กรอกคะแนนแต่ละเกณฑ์ (0-10)</p>
          </div>
          
          ${defaultCriteria.map(criterion => `
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ${this.formatCriterionName(criterion)}
              </label>
              <input 
                type="number" 
                id="criteria_${criterion}" 
                name="criteria_${criterion}"
                min="0" 
                max="10" 
                step="0.1"
                value="${criteriaScores[criterion] || ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.0 - 10.0"
                required
              />
            </div>
          `).join('')}
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              คะแนนรวม (Total Score) *
            </label>
            <input 
              type="number" 
              id="total_score" 
              name="total_score"
              min="0" 
              max="10" 
              step="0.1"
              value="${this.interviewData.total_score || ''}"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.0 - 10.0"
              required
            />
            <p class="text-xs text-gray-500 mt-1">ระบบจะอัปเดตสถานะ Application Report อัตโนมัติตามคะแนนรวม</p>
          </div>
          
          <div class="flex gap-2 mt-6">
            <button 
              type="button"
              id="btnSubmitEvaluation"
              class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              💾 บันทึกการประเมิน
            </button>
            <button 
              type="button"
              id="btnCancel"
              class="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      `;

      formContainer.innerHTML = criteriaHTML;

      document.getElementById('btnSubmitEvaluation')?.addEventListener('click', () => this.handleSubmit());
      document.getElementById('btnCancel')?.addEventListener('click', () => {
        window.location.hash = '#recruit/my/interviews';
      });

      defaultCriteria.forEach(criterion => {
        const input = document.getElementById(`criteria_${criterion}`);
        if (input) {
          input.addEventListener('input', () => this.calculateTotalScore(defaultCriteria));
        }
      });
    }

    formatCriterionName(criterion) {
      const names = {
        'communication': 'การสื่อสาร (Communication)',
        'technical': 'ความรู้ทางเทคนิค (Technical)',
        'motivation': 'แรงจูงใจ (Motivation)'
      };
      return names[criterion] || criterion;
    }

    calculateTotalScore(criteria) {
      let sum = 0;
      let count = 0;
      
      criteria.forEach(criterion => {
        const input = document.getElementById(`criteria_${criterion}`);
        if (input && input.value) {
          sum += parseFloat(input.value) || 0;
          count++;
        }
      });
      
      const avg = count > 0 ? sum / count : 0;
      const totalInput = document.getElementById('total_score');
      if (totalInput && !totalInput.value) {
        totalInput.value = avg.toFixed(1);
      }
    }

    async handleSubmit() {
      const criteriaInputs = document.querySelectorAll('[id^="criteria_"]');
      const criteriaScores = {};
      
      criteriaInputs.forEach(input => {
        const criterion = input.id.replace('criteria_', '');
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
          criteriaScores[criterion] = value;
        }
      });

      const totalScoreInput = document.getElementById('total_score');
      const totalScore = parseFloat(totalScoreInput?.value) || 0;

      if (totalScore <= 0) {
        this.ui?.showMessage('กรุณากรอกคะแนนรวม', 'error');
        return;
      }

      this.ui?.showMessage('กำลังบันทึกการประเมิน...', 'info');

      const result = await this.service.updateMyInterview(
        this.interviewId,
        criteriaScores,
        totalScore
      );

      if (result.success) {
        this.ui?.showMessage('บันทึกการประเมินสำเร็จ! ระบบอัปเดตสถานะแล้ว', 'success');
        setTimeout(() => {
          if (window.RecruitTableTemplate) {
            window.RecruitTableTemplate.navigateTo('recruit/my/interviews');
          } else {
            window.location.hash = '#recruit/my/interviews';
          }
        }, 2000);
      } else {
        this.ui?.showMessage(`เกิดข้อผิดพลาด: ${result.error}`, 'error');
      }
    }
  }

  window.InterviewEvaluateForm = InterviewEvaluateForm;
}

