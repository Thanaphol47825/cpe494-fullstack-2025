class InterviewList {
  constructor(engine, rootURL) {
    this.engine = engine;
    this.rootURL = rootURL || window.RootURL || window.__ROOT_URL__ || "";
  }

  async render() {
    if (!this.engine?.mainContainer) return false;
    this.engine.mainContainer.innerHTML = "";

    try {
      await this.#renderListPage();
      await this.#loadInterviews();
      return true;
    } catch (err) {
      console.error(err);
      this.#showError("Failed to initialize Interview list: " + err.message);
      return false;
    }
  }

  async #renderListPage() {
    const pageHTML = `
      <div class="min-h-screen bg-gray-50 py-10 px-6">
        <div class="max-w-7xl mx-auto">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Interview Management</h1>
            <div class="flex gap-3">
              <button id="btnCreate" class="inline-flex items-center rounded-lg bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create New Interview
              </button>
              <button id="btnRefresh" class="inline-flex items-center rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <div id="status" class="text-sm text-gray-500 mb-4"></div>
          
          <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div id="tableWrap" class="overflow-x-auto"></div>
          </div>
          
          <!-- Modal for View/Edit -->
          <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
              <div id="modalContent" class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const pageEl = this.engine.create(pageHTML);
    this.engine.mainContainer.appendChild(pageEl);

    document.getElementById("btnRefresh")?.addEventListener("click", () => this.#loadInterviews());
    document.getElementById("btnCreate")?.addEventListener("click", () => this.#goToCreate());
  }

  async #loadInterviews() {
    const status = document.getElementById("status");
    const wrap = document.getElementById("tableWrap");
    
    status.textContent = "Loading interviews...";
    status.className = "text-sm text-gray-500";

    try {
      const res = await fetch(`${this.rootURL}/recruit/GetInterviews`);
      const data = await res.json();
      
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to load interviews");
      }

      const interviews = data.result || [];
      
      if (interviews.length === 0) {
        wrap.innerHTML = `
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No interviews found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new interview.</p>
            <div class="mt-6">
              <button id="createFirstBtn" class="inline-flex items-center rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create Interview
              </button>
            </div>
          </div>
        `;
        document.getElementById("createFirstBtn")?.addEventListener("click", () => this.#goToCreate());
        status.textContent = "No interviews found";
        return;
      }

      const rows = interviews.map(interview => {
        const statusColor = this.#getStatusColor(interview.interview_status);
        const scheduledDate = interview.scheduled_appointment ? new Date(interview.scheduled_appointment).toLocaleDateString() : 'Not set';
        const totalScore = interview.total_score || 0;
        const id = interview.ID || interview.id;
        
        return `
          <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${interview.instructor_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${interview.application_report_id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                ${interview.interview_status || 'Not set'}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${scheduledDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${totalScore}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button data-id="${id}" class="viewBtn text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                <span class="text-gray-300">|</span>
                <button data-id="${id}" class="editBtn text-amber-600 hover:text-amber-900 font-medium">Edit</button>
                <span class="text-gray-300">|</span>
                <button data-id="${id}" class="delBtn text-red-600 hover:text-red-900 font-medium">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      wrap.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Report ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
        </table>
      `;

      wrap.querySelectorAll('.viewBtn').forEach(btn => btn.addEventListener('click', (e) => this.#view(e.target.dataset.id)));
      wrap.querySelectorAll('.editBtn').forEach(btn => btn.addEventListener('click', (e) => this.#edit(e.target.dataset.id)));
      wrap.querySelectorAll('.delBtn').forEach(btn => btn.addEventListener('click', (e) => this.#delete(e.target.dataset.id)));

      status.textContent = `Loaded ${interviews.length} interview${interviews.length !== 1 ? 's' : ''}`;
      status.className = "text-sm text-green-600";
    } catch (err) {
      status.textContent = `Error: ${err.message || String(err)}`;
      status.className = "text-sm text-red-600";
      wrap.innerHTML = `
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Failed to load interviews</h3>
          <p class="mt-1 text-sm text-gray-500">${err.message || String(err)}</p>
        </div>
      `;
    }
  }

  async #view(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetInterview/${id}`);
      const data = await res.json();
      
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to load interview");
      }

      const interview = data.result;
      const scheduledDate = interview.scheduled_appointment ? new Date(interview.scheduled_appointment).toLocaleString() : 'Not set';
      const evaluatedDate = interview.evaluated_at ? new Date(interview.evaluated_at).toLocaleString() : 'Not evaluated';
      
      document.getElementById('modalContent').innerHTML = `
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Interview Details</h3>
            <button id="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Interview ID</label>
                <p class="text-sm text-gray-900">${interview.ID || interview.id}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Instructor ID</label>
                <p class="text-sm text-gray-900">${interview.instructor_id}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Application Report ID</label>
                <p class="text-sm text-gray-900">${interview.application_report_id}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Status</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.#getStatusColor(interview.interview_status)}">
                  ${interview.interview_status || 'Not set'}
                </span>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Scheduled Appointment</label>
                <p class="text-sm text-gray-900">${scheduledDate}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Total Score</label>
                <p class="text-sm text-gray-900">${interview.total_score || 0}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Evaluated At</label>
                <p class="text-sm text-gray-900">${evaluatedDate}</p>
              </div>
            </div>
          </div>
          
          ${interview.criteria_scores ? `
            <div class="mt-4">
              <label class="text-sm font-medium text-gray-500">Criteria Scores</label>
              <div class="mt-1 p-3 bg-gray-50 rounded-lg">
                <pre class="text-sm text-gray-900 whitespace-pre-wrap">${interview.criteria_scores}</pre>
              </div>
            </div>
          ` : ''}
          
          <div class="mt-6 flex justify-end">
            <button id="editFromView" class="inline-flex items-center rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Interview
            </button>
          </div>
        </div>
      `;
      
      document.getElementById('modal').classList.remove('hidden');
      document.getElementById('closeModal').addEventListener('click', () => this.#closeModal());
      document.getElementById('editFromView').addEventListener('click', () => {
        this.#closeModal();
        this.#edit(id);
      });
    } catch (err) {
      alert('Error loading interview: ' + err.message);
    }
  }

  async #edit(id) {
    try {
      const res = await fetch(`${this.rootURL}/recruit/GetInterview/${id}`);
      const data = await res.json();
      
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to load interview");
      }

      const interview = data.result;
      const scheduledDate = interview.scheduled_appointment ? new Date(interview.scheduled_appointment).toISOString().slice(0, 16) : '';
      const evaluatedDate = interview.evaluated_at ? new Date(interview.evaluated_at).toISOString().slice(0, 16) : '';

      document.getElementById('modalContent').innerHTML = `
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Edit Interview</h3>
            <button id="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form id="editForm" class="space-y-4">
            <input type="hidden" name="id" value="${interview.ID || interview.id}">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Instructor ID</label>
                <input type="number" name="instructor_id" value="${interview.instructor_id}" required
                       class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Application Report ID</label>
                <input type="number" name="application_report_id" value="${interview.application_report_id}" required
                       class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Scheduled Appointment</label>
              <input type="datetime-local" name="scheduled_appointment" value="${scheduledDate}"
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Interview Status</label>
              <select name="interview_status" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="">Select Status</option>
                <option value="Scheduled" ${interview.interview_status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                <option value="In Progress" ${interview.interview_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Evaluated" ${interview.interview_status === 'Evaluated' ? 'selected' : ''}>Evaluated</option>
                <option value="Accepted" ${interview.interview_status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                <option value="Rejected" ${interview.interview_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                <option value="Cancelled" ${interview.interview_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Total Score</label>
                <input type="number" name="total_score" value="${interview.total_score || 0}" step="0.1"
                       class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Evaluated At</label>
                <input type="datetime-local" name="evaluated_at" value="${evaluatedDate}"
                       class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Criteria Scores (JSON)</label>
              <textarea name="criteria_scores" rows="3" placeholder='{"communication": 8.5, "technical": 9.0, "motivation": 8.0}'
                        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${interview.criteria_scores || ''}</textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" id="cancelEdit" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Update Interview
              </button>
            </div>
          </form>
        </div>
      `;
      
      document.getElementById('modal').classList.remove('hidden');
      document.getElementById('closeModal').addEventListener('click', () => this.#closeModal());
      document.getElementById('cancelEdit').addEventListener('click', () => this.#closeModal());
      document.getElementById('editForm').addEventListener('submit', (e) => this.#submitEdit(e));
    } catch (err) {
      alert('Error loading interview: ' + err.message);
    }
  }

  async #submitEdit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (key === 'instructor_id' || key === 'application_report_id') {
        data[key] = parseInt(value);
      } else if (key === 'total_score') {
        data[key] = parseFloat(value) || 0;
      } else if (key === 'criteria_scores') {
        if (value.trim()) {
          try {
            data[key] = value; // Keep as string for now
          } catch (e) {
            alert('Invalid JSON format for Criteria Scores');
            return;
          }
        }
      } else if (key === 'scheduled_appointment' || key === 'evaluated_at') {
        if (value) {
          data[key] = new Date(value).toISOString();
        }
      } else {
        data[key] = value;
      }
    }

    try {
      const res = await fetch(`${this.rootURL}/recruit/UpdateInterview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (!result.isSuccess) {
        throw new Error(result.message || 'Update failed');
      }
      
      this.#closeModal();
      await this.#loadInterviews();
    } catch (err) {
      alert('Error updating interview: ' + err.message);
    }
  }

  async #delete(id) {
    if (!confirm(`Are you sure you want to delete interview #${id}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`${this.rootURL}/recruit/DeleteInterview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id) })
      });
      const data = await res.json();
      
      if (!data.isSuccess) {
        throw new Error(data.message || 'Delete failed');
      }
      
      await this.#loadInterviews();
    } catch (err) {
      alert('Error deleting interview: ' + err.message);
    }
  }

  #goToCreate() {
    this.engine.fetchModule("/recruit/static/js/InterviewCreate.js").then(() => {
      const create = new InterviewCreate(this.engine, this.rootURL);
      this.engine.mainContainer.innerHTML = "";
      create.render();
    });
  }

  #closeModal() {
    document.getElementById('modal').classList.add('hidden');
  }

  #getStatusColor(status) {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Evaluated': 'bg-purple-100 text-purple-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  #showError(msg) {
    const div = document.createElement("div");
    div.className = "max-w-3xl mx-auto my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800";
    div.textContent = msg;
    (this.engine?.mainContainer || document.body).appendChild(div);
  }
}
