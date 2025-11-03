// HR API Service
if (typeof window !== 'undefined' && !window.HrApiService) {
  class HrApiService {
    constructor(rootURL = '') {
      this.rootURL = rootURL || window.__ROOT_URL__ || ""
    }

    async fetchInstructors() {
      const response = await fetch(`${this.rootURL}/hr/instructors`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load instructors: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData.result || responseData;
    }

    async fetchInstructor(instructorCode) {
      const response = await fetch(`${this.rootURL}/hr/instructors/${instructorCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load instructor: ${response.status}`);
      }

      return await response.json();
    }

    async createInstructor(instructorData) {
      const response = await fetch(`${this.rootURL}/hr/instructors`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instructorData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async updateInstructor(instructorCode, instructorData) {
      const response = await fetch(`${this.rootURL}/hr/instructors/${instructorCode}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instructorData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async deleteInstructor(instructorCode) {
      const response = await fetch(`${this.rootURL}/hr/instructors/${instructorCode}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async fetchStudents() {
      const response = await fetch(`${this.rootURL}/hr/students`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load students: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData.result || responseData;
    }

    async fetchStudent(studentCode) {
      const response = await fetch(`${this.rootURL}/hr/students/${studentCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load student: ${response.status}`);
      }

      return await response.json();
    }

    async createStudent(studentData) {
      const response = await fetch(`${this.rootURL}/hr/students`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async updateStudent(studentCode, studentData) {
      const response = await fetch(`${this.rootURL}/hr/students/${studentCode}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async deleteStudent(studentCode) {
      const response = await fetch(`${this.rootURL}/hr/students/${studentCode}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    // Student Resignations
    async fetchStudentResignations() {
      const candidates = [
        `${this.rootURL}/hr/resignation-student-requests`, // exact path from backend controller
      ];

      for (const url of candidates) {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error?.message || err?.message || `Failed to load student resignations: ${response.status}`);
        }
        const data = await response.json().catch(() => ([]));
        return data.result || data;
      }
    }

    async fetchStudentResignation(resignationId) {
      const url = `${this.rootURL}/hr/resignation-student-requests/${resignationId}`; // exact backend path
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || err?.message || `Failed to load student resignation: ${response.status}`);
      }

      const data = await response.json();
      return data.result || data;
    }

    async createStudentResignation(payload) {
      const url = `${this.rootURL}/hr/resignation-student-requests`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async reviewStudentResignation(requestId, action, reason) {
      const url = `${this.rootURL}/hr/resignation-student-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    // ==================== Instructor Resignations ====================

    async fetchInstructorResignations() {
      const candidates = [
        `${this.rootURL}/hr/resignation-instructor-requests`, // exact path from backend controller
      ];

      for (const url of candidates) {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error?.message || err?.message || `Failed to load instructor resignations: ${response.status}`);
        }
        const data = await response.json().catch(() => ([]));
        return data.result || data;
      }
    }

    async fetchInstructorResignation(resignationId) {
      const url = `${this.rootURL}/hr/resignation-instructor-requests/${resignationId}`; // exact backend path
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || err?.message || `Failed to load instructor resignation: ${response.status}`);
      }

      const data = await response.json();
      return data.result || data;
    }

    async createInstructorResignation(payload) {
      const url = `${this.rootURL}/hr/resignation-instructor-requests`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async reviewInstructorResignation(requestId, action, reason) {
      const url = `${this.rootURL}/hr/resignation-instructor-requests/${requestId}/review`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    // Student CRUD operations
    async fetchStudent(studentCode) {
      const url = `${this.rootURL}/hr/students/${studentCode}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async updateStudent(studentCode, payload) {
      const url = `${this.rootURL}/hr/students/${studentCode}/update`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async deleteStudent(studentCode) {
      const url = `${this.rootURL}/hr/students/${studentCode}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    // Instructor CRUD operations
    async fetchInstructor(instructorCode) {
      const url = `${this.rootURL}/hr/instructors/${instructorCode}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async updateInstructor(instructorCode, payload) {
      const url = `${this.rootURL}/hr/instructors/${instructorCode}/update`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    async deleteInstructor(instructorCode) {
      const url = `${this.rootURL}/hr/instructors/${instructorCode}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || `API Error (${response.status})`);
      }
      return result.result || result;
    }

    // ==================== Leave Request APIs (Student) ====================
    
    async fetchStudentLeaveRequests() {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load student leave requests: ${response.status}`);
      }

      const payload = await response.json().catch(() => ([]));
      if (Array.isArray(payload)) {
        return payload;
      }
      if (payload && Array.isArray(payload.result)) {
        return payload.result;
      }
      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }
      return [];
    }

    async fetchStudentLeaveRequest(requestId) {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load student leave request: ${response.status}`);
      }

      return await response.json();
    }

    async createStudentLeaveRequest(requestData) {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async reviewStudentLeaveRequest(requestId, action, reason = '') {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests/${requestId}/review`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async editStudentLeaveRequest(requestId, requestData) {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests/${requestId}/edit`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    async deleteStudentLeaveRequest(requestId) {
      const response = await fetch(`${this.rootURL}/hr/leave-student-requests/${requestId}/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      return await response.json();
    }

    // ==================== Leave Request APIs (Instructor) ====================
    
    async fetchInstructorLeaveRequests() {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `Failed to load instructor leave requests: ${response.status}`);
      }

      const result = await response.json();
      return result.result || result;
    }

    async fetchInstructorLeaveRequest(requestId) {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `Failed to load instructor leave request: ${response.status}`);
      }

      const result = await response.json();
      return result.result || result;
    }

    async createInstructorLeaveRequest(requestData) {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      const result = await response.json();
      return result.result || result;
    }

    async reviewInstructorLeaveRequest(requestId, action, reason = '') {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests/${requestId}/review`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      const result = await response.json();
      return result.result || result;
    }

    async updateInstructorLeaveRequest(requestData) {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      const result = await response.json();
      return result.result || result;
    }

    async deleteInstructorLeaveRequest(requestId) {
      const response = await fetch(`${this.rootURL}/hr/leave-instructor-requests/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: requestId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || errorData?.message || `API Error (${response.status})`);
      }

      const result = await response.json();
      return result.result || result;
    }

    // ==================== Departments ====================

    async fetchJSON(url, options = {}) {
      const res = await fetch(url, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        ...options
      });
      if (!res.ok) {
        let msg = `${res.status} ${res.statusText}`;
        try {
          const j = await res.json();
          msg = j?.error?.message || j?.error || j?.message || msg;
        } catch {
          try { msg = await res.text(); } catch {}
        }
        throw new Error(msg);
      }
      if (res.status === 204) return null;
      return res.json();
    }

    async fetchDepartments({ limit, offset } = {}) {
      const qs = new URLSearchParams();
      if (limit) qs.set('limit', String(limit));
      if (offset) qs.set('offset', String(offset));
      const qstr = qs.toString() ? `?${qs.toString()}` : '';
      const data = await this.fetchJSON(`${this.rootURL}/hr/departments${qstr}`);
      // backend returns { result: [...] }
      return Array.isArray(data) ? data : (data?.result || data?.data || []);
    }

    async fetchDepartment(name) {
      const encoded = encodeURIComponent(name);
      const data = await this.fetchJSON(`${this.rootURL}/hr/departments/${encoded}`);
      // backend returns { result: { ...row } }
      return data?.result || data;
    }

    normalizeDepartmentPayload(input = {}) {
      const name = String(input.name ?? '').trim();
      const faculty = String(input.faculty ?? input.parent ?? '').trim(); // parent→faculty
      const body = { name, faculty };
      if (input.budget !== undefined && String(input.budget).trim() !== '') {
        const n = Number(String(input.budget).replace(/,/g, '')); // strip commas
        if (!Number.isNaN(n)) body.budget = n;
      }
      return body;
    }

    async createDepartment(payload) {
      const body = this.normalizeDepartmentPayload(payload);
      return this.fetchJSON(`${this.rootURL}/hr/departments`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    async updateDepartment(name, patch) {
      const body = this.normalizeDepartmentPayload(patch);
      const encoded = encodeURIComponent(name);
      return this.fetchJSON(`${this.rootURL}/hr/departments/${encoded}/update`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    async deleteDepartment(name) {
      const encoded = encodeURIComponent(name);
      // Controller returns 204; treat as ok
      const res = await fetch(`${this.rootURL}/hr/departments/${encoded}/delete`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok && res.status !== 204) {
        let msg = `${res.status} ${res.statusText}`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      return true;
    }
  }
  
  window.HrApiService = HrApiService
}
