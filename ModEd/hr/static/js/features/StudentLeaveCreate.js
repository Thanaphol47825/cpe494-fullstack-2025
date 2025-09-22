// 📍 ไฟล์: /hr/static/js/features/StudentLeaveCreate.js
// 🎯 Feature module for creating student leave requests

class HrStudentLeaveCreateFeature {
  constructor(templateEngine, rootURL) {
    this.templateEngine = templateEngine;
    this.rootURL = rootURL || window.__ROOT_URL__ || "";
  }

  // 🚀 Main render method - เรียกจาก HrApplication
  async render() {
    console.log("🎯 Loading Student Leave Create Feature");
    
    if (!this.templateEngine || !this.templateEngine.mainContainer) {
      console.error("Template engine or main container not found");
      return false;
    }

    const container = this.templateEngine.mainContainer;
    container.innerHTML = "";

    const html = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Create Student Leave Request</h2>
          <button id="backToMenu" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
            ← Back to HR Menu
          </button>
        </div>
        
        <form id="leaveForm" class="space-y-4 max-w-md">
          <div>
            <label for="student_code" class="block text-sm font-medium text-gray-700">Student Code *</label>
            <input 
              type="text" 
              id="student_code" 
              name="student_code" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student code"
            />
          </div>
          
          <div>
            <label for="leave_type" class="block text-sm font-medium text-gray-700">Leave Type *</label>
            <select 
              id="leave_type" 
              name="leave_type" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select leave type</option>
              <option value="Sick">Sick Leave</option>
              <option value="Vacation">Vacation Leave</option>
              <option value="Personal">Personal Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label for="leave_date" class="block text-sm font-medium text-gray-700">Leave Date *</label>
            <input 
              type="date" 
              id="leave_date" 
              name="leave_date" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700">Reason *</label>
            <textarea 
              id="reason" 
              name="reason" 
              required 
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for leave"
            ></textarea>
          </div>
          
          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Leave Request
            </button>
          </div>
          
          <div id="formStatus" class="text-sm text-gray-600"></div>
        </form>
        
        <div id="resultBox" class="hidden"></div>
      </div>
    `;

    const element = this.templateEngine.create(html);
    container.appendChild(element);

    // Wire up event listeners
    this.#setupEventListeners();
    
    return true;
  }

  #setupEventListeners() {
    const form = document.getElementById("leaveForm");
    const backBtn = document.getElementById("backToMenu");
    
    if (!form) return;

    // Back to menu button
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        location.hash = "#hr";
        window.location.reload();
      });
    }

    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.#handleSubmit(form);
    });
  }

  async #handleSubmit(form) {
    this.#setStatus("Submitting...");
    this.#showResult("", false);

    const payload = {
      student_code: form.student_code.value.trim(),
      leave_type: form.leave_type.value.trim(),
      reason: form.reason.value.trim(),
      leave_date: form.leave_date.value, // YYYY-MM-DD
    };

    if (!payload.student_code || !payload.leave_type || !payload.reason || !payload.leave_date) {
      this.#setStatus("Please fill in all required fields.", "error");
      return;
    }

    const url = this.rootURL + "/hr/leave-student-requests";

    // Debug: Log the payload being sent
    console.log("Sending payload:", payload);
    console.log("Request URL:", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Response status:", res.status);
      console.log("Response text:", text);
      
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        this.#setStatus("Failed to submit.", "error");
        this.#showResult(data?.message || "Request failed.", true);
        return;
      }

      this.#setStatus("Submitted successfully.", "success");
      this.#showResult(data?.message || "Leave request submitted successfully.");
      form.reset();
    } catch (err) {
      this.#setStatus("Network error.", "error");
      this.#showResult(err?.message || String(err), true);
    }
  }

  #setStatus(msg, type = "info") {
    const el = document.getElementById("formStatus");
    if (!el) return;
    
    el.textContent = msg || "";
    el.className = "text-sm " + (type === "error" ? "text-red-600" : type === "success" ? "text-green-600" : "text-gray-600");
  }

  #showResult(content, isError = false) {
    const box = document.getElementById("resultBox");
    if (!box) return;
    
    box.classList.remove("hidden");
    box.className = "mt-6 rounded-xl border p-4 text-sm " + (isError ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200 text-gray-800");
    box.textContent = content;
  }
}

// 🌐 Export to global scope
if (typeof window !== 'undefined') {
  window.HrStudentLeaveCreateFeature = HrStudentLeaveCreateFeature;
}