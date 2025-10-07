if (typeof window !== 'undefined' && !window.CourseList) {
  class CourseList {
    constructor(application) {
      this.application = application;
      this.courses = [];
      this.curriculums = [];
      this.curriculumDict = {};
    }

    // --- utils ---
    request = async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();
      let json = null;
      const t = raw.trim();
      if (ct.includes('application/json') || t.startsWith('{') || t.startsWith('[')) {
        try { json = JSON.parse(t || 'null'); } catch {}
      }
      if (!res.ok) {
        const msg = json?.error?.message || json?.error || json?.message || t || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }
      return { json, text: t, headers: res.headers };
    };

    // --- API ---
    getCourses = async () => {
      const r = await this.request(`${RootURL}/curriculum/Course/getCourses`, { method: 'GET' });
      const list = Array.isArray(r.json?.result) ? r.json.result : (Array.isArray(r.json) ? r.json : []);
      return list;
    };

    getCurriculums = async () => {
      const r = await this.request(`${RootURL}/curriculum/Curriculum/getCurriculums`, { method: 'GET' });
      const list = Array.isArray(r.json?.result) ? r.json.result : (Array.isArray(r.json) ? r.json : []);
      return list;
    };

    // --- helpers ---
    toBool = (v) => {
      const t = typeof v;
      if (t === 'boolean') return v;
      if (v == null) return false;
      if (t === 'number') return v !== 0;
      if (t === 'string') {
        const s = v.trim().toLowerCase();
        return s === 'true' || s === '1' || s === 'yes' || s === 'y';
      }
      return !!v;
    };

    toStatus = (v) => {
      const n = parseInt(v, 10);
      return (n === 0 || n === 1) ? n : 1; // default INACTIVE if unknown
    };

    buildCurriculumDict = (list) => {
      const dict = {};
      (list || []).forEach(i => { dict[i.ID] = i.Name || `Curriculum #${i.ID}`; });
      return dict;
    };

    toBadge = (cond, yes = 'bg-emerald-100 text-emerald-800', no = 'bg-gray-200 text-gray-700') =>
      cond ? yes : no;

    // --- render ---
    render = async () => {
      window.currentCourseList = this;
      this.application.templateEngine.mainContainer.innerHTML = '';

      const wrapper = this.application.templateEngine.create(`
        <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20"></div>
            <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full opacity-15"></div>
            <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10"></div>
          </div>

          <div class="relative z-10 container mx-auto px-4 py-12">
            <!-- header -->
            <div class="text-center mb-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl shadow-lg mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-amber-800 to-orange-900 bg-clip-text text-transparent mb-4">Course List</h1>
              <div class="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-4 rounded-full"></div>
              <p class="text-lg text-gray-600 max-w-2xl mx-auto">จัดการคอร์สทั้งหมดของคุณ</p>
            </div>

            <!-- actions -->
            <div class="max-w-6xl mx-auto mb-8">
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253"/>
                    </svg>
                    <span class="text-gray-700 font-medium">Courses Management</span>
                  </div>
                  <a routerLink="curriculum/course/create" class="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add New Course
                  </a>
                </div>
              </div>
            </div>

            <!-- table -->
            <div class="max-w-6xl mx-auto">
              <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div id="table-container" class="p-6"></div>
              </div>
            </div>

            <!-- back -->
            <div class="text-center mt-12">
              <a routerLink="curriculum" class="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/90 border border-gray-200/50 font-medium">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to Curriculum Menu
              </a>
            </div>
          </div>
        </div>
      `);

      this.application.templateEngine.mainContainer.appendChild(wrapper);

      try {
        const [courses, curriculums] = await Promise.all([
          this.getCourses(),
          this.getCurriculums()
        ]);
        this.courses = courses;
        this.curriculums = curriculums;
        this.curriculumDict = this.buildCurriculumDict(curriculums);
        this.renderSimpleTable(courses, wrapper.querySelector('#table-container'));
      } catch (e) {
        wrapper.querySelector('#table-container').innerHTML = `<div class="p-6 text-center text-red-700 bg-red-50 rounded-xl">Error: ${e.message}</div>`;
      }
    };

    renderSimpleTable = (data, container) => {
      if (!data || data.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253"/></svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลคอร์ส</h3>
            <p class="text-gray-500 mb-6">เริ่มจากการสร้างคอร์สแรกของคุณ</p>
            <a routerLink="curriculum/course/create" class="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Create Course
            </a>
          </div>
        `;
        return;
      }

      const rows = data.map((item, index) => {
        const curName = (item.Curriculum && item.Curriculum.Name)
          ? item.Curriculum.Name
          : (this.curriculumDict[item.CurriculumId] || (item.CurriculumId ? `Curriculum #${item.CurriculumId}` : 'N/A'));
        const isActive = this.toStatus(item.CourseStatus) === 0;
        return `
          <tr class="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 group">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-sm">${item.ID || index + 1}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">${item.Name || 'N/A'}</div>
              <div class="text-xs text-gray-500">${item.Description ? item.Description : ''}</div>
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${curName}</span>
            </td>
            <td class="px-6 py-4">
              <span class=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.toBool(item.Optional) ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}\">${this.toBool(item.Optional) ? 'Optional' : 'Required'}<\/
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.toBadge(isActive)}">${isActive ? 'Active' : 'Inactive'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onclick="editCourse(${item.ID})" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105" title="Edit Course">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onclick="deleteCourse(${item.ID})" class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105" title="Delete Course">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Course</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Curriculum</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Optional</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    // --- edit / delete ---
    openEditModal = async (id) => {
      const data = this.courses.find(i => i.ID === id);
      if (!data) { alert('Course not found'); return; }

      const options = (this.curriculums || []).map(i => ({ value: String(i.ID), label: i.Name || `Curriculum #${i.ID}` }));

      const modal = this.application.templateEngine.create(`
        <div id="edit-modal-${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-900">Edit Course</h3>
              <button onclick="closeEditModal(${id})" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form id="edit-form-${id}" class="space-y-4">
              <div id="edit-form-fields-${id}"></div>
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">Update</button>
                <button type="button" onclick="closeEditModal(${id})" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `);

      document.body.appendChild(modal);

      const fields = [
        { Id: 'name', Label: 'Name', Type: 'text', Name: 'Name', Required: true, Placeholder: 'Enter Course Name', value: data.Name || '' },
        { Id: 'description', Label: 'Description', Type: 'text', Name: 'Description', Placeholder: 'Enter Course Description', value: data.Description || '' },
        { Id: 'curriculum_id', Label: 'Curriculum', Type: 'select', Name: 'CurriculumId', options: options, value: String(data.CurriculumId) },
        { Id: 'optional', Label: 'Optional', Type: 'select', Name: 'Optional', options: [{ label: 'Required', value: 'false' }, { label: 'Optional', value: 'true' }], value: this.toBool(data.Optional) ? 'true' : 'false' },
        { Id: 'status', Label: 'Course Status', Type: 'select', Name: 'CourseStatus', options: [{ label: 'Active', value: '0' }, { label: 'Inactive', value: '1' }], value: String(this.toStatus(data.CourseStatus)) }
      ];

      const fieldsContainer = document.getElementById(`edit-form-fields-${id}`);
      fieldsContainer.innerHTML = '';
      fields.forEach(field => {
        let html = '';
        if (field.Type === 'select' && this.application.templateEngine.template?.Select) {
          html = Mustache.render(this.application.templateEngine.template.Select, field);
        } else if (field.Type === 'select' && this.application.templateEngine.template?.SelectInput) {
          html = Mustache.render(this.application.templateEngine.template.SelectInput, field);
        } else if (this.application.templateEngine.template?.Input) {
          html = Mustache.render(this.application.templateEngine.template.Input, field);
        } else {
          if (field.Type === 'select') {
            const opts = (field.options || []).map(o => `<option value="${o.value}">${o.label}</option>`).join('');
            html = `<label class="block text-sm font-medium text-gray-700 mb-1">${field.Label}</label><select name="${field.Name}" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">${opts}</select>`;
          } else {
            html = `<label class="block text-sm font-medium text-gray-700 mb-1">${field.Label}</label><input type="${field.Type}" name="${field.Name}" placeholder="${field.Placeholder || ''}" class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />`;
          }
        }
        const el = this.application.templateEngine.create(`<div>${html}</div>`);
        fieldsContainer.appendChild(el);
        const input = el.querySelector(`[name="${field.Name}"]`);
        if (input && field.value !== undefined) input.value = String(field.value);
      });

      document.getElementById(`edit-form-${id}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
          ID: id,
          Name: (fd.get('Name') || '').toString().trim(),
          Description: (fd.get('Description') || '').toString().trim(),
          CurriculumId: parseInt(fd.get('CurriculumId') || '0', 10),
          Optional: this.toBool(fd.get('Optional')),
          CourseStatus: this.toStatus(fd.get('CourseStatus'))
        };
        try {
          await this.request(`${RootURL}/curriculum/Course/updateCourse/${id}`, { method: 'POST', body: JSON.stringify(payload) });
          const [courses, curriculums] = await Promise.all([this.getCourses(), this.getCurriculums()]);
          this.courses = courses; this.curriculums = curriculums; this.curriculumDict = this.buildCurriculumDict(curriculums);
          this.renderSimpleTable(courses, document.querySelector('#table-container'));
          this.closeEditModal(id);
          alert('Course updated successfully!');
        } catch (err) {
          alert('Error: ' + err.message);
        }
      });
    };

    closeEditModal = (id) => {
      const m = document.getElementById(`edit-modal-${id}`);
      if (m) m.remove();
    };

    deleteCourse = async (id) => {
      if (!confirm('Are you sure you want to delete this course?')) return;
      try {
        await this.request(`${RootURL}/curriculum/Course/deleteCourse/${id}`, { method: 'GET' });
        const [courses, curriculums] = await Promise.all([this.getCourses(), this.getCurriculums()]);
        this.courses = courses; this.curriculums = curriculums; this.curriculumDict = this.buildCurriculumDict(curriculums);
        this.renderSimpleTable(courses, document.querySelector('#table-container'));
        alert('Course deleted successfully!');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    };
  }

  // expose
  window.CourseList = window.CourseList || CourseList;
  window.editCourse = (id) => window.currentCourseList && window.currentCourseList.openEditModal(id);
  window.deleteCourse = (id) => window.currentCourseList && window.currentCourseList.deleteCourse(id);
  window.closeEditModal = (id) => window.currentCourseList && window.currentCourseList.closeEditModal(id);
}
