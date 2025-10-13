// CoursePlanList.js — force replace Course select options with course names

if (typeof window !== 'undefined' && !window.CoursePlanList) {
  class CoursePlanList {
    constructor(application) {
      this.application = application;
      this.rawCoursePlans = [];
      this._coursesCache = null;

      window._deleteCoursePlan = this.handleDelete.bind(this);
      window._editCoursePlan   = this.handleEdit.bind(this);
    }

    // ---------- Utils ----------
    _toISO(raw) {
      if (!raw) return null;
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    async _waitForSelector(rootEl, selector, timeoutMs = 2000, intervalMs = 50) {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const tick = () => {
          const el = rootEl && rootEl.querySelector ? rootEl.querySelector(selector) : null;
          if (el) return resolve(el);
          if (Date.now() - start >= timeoutMs) return reject(new Error(`Timeout waiting for ${selector}`));
          setTimeout(tick, intervalMs);
        };
        tick();
      });
    }

    _findCourseSelect(root) {
      if (!root) return null;
      return (
        root.querySelector('select[name="CourseId"]') ||
        root.querySelector('select[name="courseId"]') ||
        root.querySelector('select[name="CourseID"]') ||
        root.querySelector('select[data-field="CourseId"]') ||
        root.querySelector('[name="CourseId"]') // fallback
      );
    }

    _buildCourseSelect(nameAttr = 'CourseId', courses = [], selectedId = '') {
      const sel = document.createElement('select');
      sel.name = nameAttr;
      sel.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg';

      // default
      const def = document.createElement('option');
      def.value = '';
      def.textContent = 'Select Course';
      sel.appendChild(def);

      (courses || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = String(c.ID);
        opt.textContent = c.Name || c.Title || `Course #${c.ID}`;
        sel.appendChild(opt);
      });

      if (selectedId !== '' && selectedId != null) {
        sel.value = String(selectedId);
      }
      return sel;
    }

    _forceReplaceCourseSelect(root, courses, selectedId) {
      const oldSel = this._findCourseSelect(root);
      if (!oldSel) return;

      // สร้าง select ใหม่ (กันเคสดิสเพลย์ยังขึ้น <uint Value> เพราะ renderer ผูก data ภายใน)
      const nameAttr = oldSel.getAttribute('name') || 'CourseId';
      const newSel = this._buildCourseSelect(nameAttr, courses, selectedId);

      // copy attribute สำคัญบางอย่าง
      if (oldSel.id) newSel.id = oldSel.id;
      if (oldSel.required) newSel.required = true;

      oldSel.replaceWith(newSel);
    }

    // ---------- Fetch ----------
    async getCourses(force = false) {
      if (!force && Array.isArray(this._coursesCache) && this._coursesCache.length) return this._coursesCache;
      try {
        const res = await fetch(`${RootURL}/curriculum/course/getCourses`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data.result) ? data.result : [];
        // คอนเฟิร์มว่ามี ID/Name
        this._coursesCache = list.map(c => ({
          ID: c.ID,
          Name: c.Name || c.Title || `Course #${c.ID}`,
        }));
        return this._coursesCache;
      } catch (e) {
        console.error('getCourses error:', e);
        this._coursesCache = [];
        return [];
      }
    }

    async getCoursePlans() {
      const res = await fetch(`${RootURL}/curriculum/CoursePlan/getCoursePlans`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({ result: [] }));
      return Array.isArray(data.result) ? data.result : [];
    }

    async getAllCoursePlans() {
      const [plans, courses] = await Promise.all([this.getCoursePlans(), this.getCourses()]);
      this.rawCoursePlans = plans;

      return plans.map(p => {
        const course = courses.find(c => c.ID === p.CourseId);
        const dateISO = this._toISO(p.Date);
        const dateStr = dateISO
          ? (new Date(dateISO)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + (new Date(dateISO)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
          : 'N/A';

        return {
          ID: p.ID,
          CourseID: course ? course.ID : p.CourseId,
          CourseName: course ? course.Name : 'N/A',
          Date: dateStr,
          Week: p.Week ?? 'N/A',
          Topic: p.Topic ?? 'N/A',
          Description: p.Description ?? 'N/A',
        };
      });
    }

    // ---------- Edit ----------
    async handleEdit(coursePlanId) {
      if (!coursePlanId) return;

      try {
        if (!window.EditModalTemplate) {
          await this.application.loadSubModule('template/CurriculumEditModalTemplate.js');
        }

        const raw = this.rawCoursePlans.find(x => x.ID === coursePlanId);
        if (!raw) {
          alert('Course Plan not found');
          return;
        }

        const modalId = `courseplan-${coursePlanId}`;

        // เปิดโมดัล (ไม่ใช้ form ที่รีเทิร์น เพื่อหลีกเลี่ยงชนกับ implementation ภายใน)
        await EditModalTemplate.createModalWithForm({
          modalType: 'CoursePlan',
          modalId,
          application: this.application,
          modelPath: 'curriculum/courseplan',
          data: {
            ID: raw.ID,
            CourseId: raw.CourseId,                       // ค่าเดิม
            Date: raw.Date ? new Date(raw.Date).toISOString().slice(0, 16) : '',
            Week: raw.Week ?? '',
            Topic: raw.Topic ?? '',
            Description: raw.Description ?? ''
          },
          submitHandler: async (formData) => this.updateCoursePlan(coursePlanId, formData),
        });

        // รอจน select โผล่ แล้ว "แทนที่" ด้วยรายชื่อคอร์สจริง
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;

        await this._waitForSelector(modalEl, 'form');
        const courses = await this.getCourses(); // [{ID, Name}]
        this._forceReplaceCourseSelect(modalEl, courses, raw.CourseId);

      } catch (error) {
        console.error('Error opening edit modal:', error);
        alert('Error opening edit modal: ' + (error?.message || error));
      }
    }

    async updateCoursePlan(coursePlanId, formData) {
      try {
        const payload = {
          ID: coursePlanId,
          CourseId: parseInt(formData.CourseId, 10),
          Date: formData.Date, // ควรเป็น datetime-local (YYYY-MM-DDTHH:mm), ฝั่ง backend แปลงได้
          Week: parseInt(formData.Week, 10),
          Topic: formData.Topic,
          Description: formData.Description
        };

        const res = await fetch(`${RootURL}/curriculum/CoursePlan/updateCoursePlan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));
        if (res.ok && result.isSuccess) {
          await this.refreshTable();
          return { success: true, message: 'Course Plan updated successfully!' };
        }
        return { success: false, message: result.result || `Failed to update (HTTP ${res.status})` };
      } catch (err) {
        return { success: false, message: 'Network error: ' + (err?.message || err) };
      }
    }

    // ---------- Delete ----------
    async handleDelete(coursePlanId) {
      if (!coursePlanId) return;
      if (!confirm('Delete Course Plan?')) return;

      try {
        const resp = await fetch(`${RootURL}/curriculum/CoursePlan/deleteCoursePlan/${coursePlanId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const resJson = await resp.json().catch(() => ({}));
        if (!resp.ok || resJson.isSuccess === false) {
          throw new Error(resJson.result || `HTTP ${resp.status}`);
        }
        await this.refreshTable();
      } catch (err) {
        alert(`Delete failed: ${err?.message || err}`);
      }
    }

    // ---------- Render ----------
    async refreshTable() {
      const rows = await this.getAllCoursePlans();
      if (this.table?.setData) this.table.setData(rows);
      this.render();
    }

    async render() {
      this.application.templateEngine.mainContainer.innerHTML = "";

      const listWrapper = await ListTemplate.getList('CoursePlanList');
      this.application.templateEngine.mainContainer.appendChild(listWrapper);

      const rows = await this.getAllCoursePlans();

      this.table = new AdvanceTableRender(this.application.templateEngine, {
        data: rows,
        targetSelector: "#courseplan-table",
        schema: [
          { name: "ID",         label: "No.",        type: "number" },
          { name: "CourseID",   label: "Course ID",  type: "text"   },
          { name: "CourseName", label: "Course",     type: "text"   },
          { name: "Date",       label: "Date",       type: "text"   },
          { name: "Week",       label: "Week",       type: "number" },
          { name: "Topic",      label: "Topic",      type: "text"   },
          { name: "Description",label: "Description",type: "text"   },
        ],
        customColumns: [
          {
            name: "actions",
            label: "Actions",
            template: `
              <div class="flex space-x-2">
                <button onclick="_editCoursePlan({ID})"
                        class="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                  Edit
                </button>
                <button onclick="_deleteCoursePlan({ID})"
                        class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm">
                  Delete
                </button>
              </div>
            `
          },
        ]
      });

      await this.table.render();
    }
  }

  window.CoursePlanList = CoursePlanList;
}
