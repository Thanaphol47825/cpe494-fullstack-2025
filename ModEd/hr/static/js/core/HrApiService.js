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
  }
  
  window.HrApiService = HrApiService
}
