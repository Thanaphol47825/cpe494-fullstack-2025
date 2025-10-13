// CoursePlanCreate.js — fixed: payload keys, form selector safety, populate Course dropdown

if (typeof window !== 'undefined' && !window.CoursePlanCreate) {
  class CoursePlanCreate {
    constructor(application) {
      this.application = application;
      this._coursesCache = null;
    }

    // -------- helpers --------
    async getCourses(force = false) {
      if (!force && Array.isArray(this._coursesCache) && this._coursesCache.length) return this._coursesCache;
      const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({ result: [] }));
      this._coursesCache = (data.result || []).map(c => ({
        ID: c.ID,
        Name: c.Name || c.Title || `Course #${c.ID}`,
      }));
      return this._coursesCache;
    }

    async waitForSelector(root, selector, timeoutMs = 2500, intervalMs = 50) {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const loop = () => {
          const el = root?.querySelector?.(selector);
          if (el) return resolve(el);
          if (Date.now() - start >= timeoutMs) return reject(new Error(`Timeout waiting for ${selector}`));
          setTimeout(loop, intervalMs);
        };
        loop();
      });
    }

    async populateCourseDropdown(formRoot) {
      // รองรับหลายเคสของชื่อฟิลด์
      const select =
        formRoot.querySelector('select[name="CourseId"]') ||
        formRoot.querySelector('select[name="courseId"]') ||
        formRoot.querySelector('select[data-field="CourseId"]') ||
        formRoot.querySelector('select[data-name="CourseId"]');
      if (!select) return;

      const courses = await this.getCourses();
      select.innerHTML = '';
      const def = document.createElement('option');
      def.value = '';
      def.textContent = 'Select Course';
      select.appendChild(def);

      courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = String(c.ID);
        opt.textContent = c.Name;
        select.appendChild(opt);
      });
    }

    // -------- submit --------
    async handleSubmit(formData) {
      try {
        // validation
        if (!formData.CourseId) {
          alert('Please select a course.');
          return false;
        }
        if (!formData.date && !formData.Date) {
          alert('Please select date & time.');
          return false;
        }
        if (!formData.week && !formData.Week) {
          alert('Please enter week number.');
          return false;
        }

        // normalize fields: รองรับทั้ง date/Date และ week/Week
        const courseId = parseInt(formData.CourseId, 10);
        const dtStr = formData.Date || formData.date; // datetime-local
        const weekNum = parseInt(formData.Week ?? formData.week, 10);

        const dt = new Date(dtStr);
        if (isNaN(dt.getTime())) {
          alert('Invalid date/time format.');
          return false;
        }

        // ❗ ใช้คีย์ตัวใหญ่ให้ตรงกับ struct ฝั่ง Go
        const payload = {
          CourseId: courseId,
          Date: dt.toISOString(),
          Week: weekNum,
          Topic: formData.Topic ?? formData.topic ?? '',
          Description: formData.Description ?? formData.description ?? '',
        };

        const resp = await fetch(`${RootURL}/curriculum/CoursePlan/createCoursePlan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await resp.json().catch(() => ({}));
        if (data?.isSuccess) {
          alert('Course Plan saved!');
          const formEl = document.querySelector('#course-plan-form') || document.querySelector('form[data-form-key="CoursePlanForm"]');
          if (formEl) formEl.reset();
          return true;
        } else {
          alert('Error: ' + (data?.result || data?.message || `Failed to save (HTTP ${resp.status})`));
          return false;
        }
      } catch (error) {
        alert('Error: ' + (error?.message || error || 'Failed to save'));
        return false;
      }
    }

    // -------- render --------
    async render() {
      // clear
      this.application.templateEngine.mainContainer.innerHTML = '';

      // ดึงฟอร์มจาก template (ต้องมี CoursePlanForm ใน template)
      const formElement = await FormTemplate.getForm('CoursePlanForm', 'create');
      this.application.templateEngine.mainContainer.appendChild(formElement);

      // ให้แน่ใจว่า selector โดน: หาก template ไม่มี id เดิม ให้ fallback เป็น data attribute
      const targetSelector = document.querySelector('#course-plan-form')
        ? '#course-plan-form'
        : (formElement.getAttribute('id') ? `#${formElement.id}` : 'form[data-form-key="CoursePlanForm"]');

      // bind AdvanceFormRender
      this.form = new AdvanceFormRender(this.application.templateEngine, {
        modelPath: 'curriculum/courseplan', // ตรงกับ GetModelMeta
        targetSelector: targetSelector,
        submitHandler: this.handleSubmit.bind(this),
      });

      await this.form.render();

      // หลังจาก render แล้ว เติมรายชื่อคอร์สใน dropdown
      try {
        // formElement อาจเป็น wrapper ให้หา form ภายใน
        const formRoot = formElement.matches('form') ? formElement : (await this.waitForSelector(formElement, 'form'));
        await this.populateCourseDropdown(formRoot);
      } catch (e) {
        console.warn('Populate course dropdown failed:', e?.message || e);
      }
    }
  }

  window.CoursePlanCreate = CoursePlanCreate;
}
