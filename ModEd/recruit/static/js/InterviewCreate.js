class InterviewCreate {
  constructor(application) {
    this.application = application;
  }

  async render() {
    console.log("InterviewCreate: render()");

    const fields = [
      { label: "Instructor ID", name: "instructor_id", type: "number", required: true },
      { label: "Application Report ID", name: "application_report_id", type: "number", required: true },
      { label: "Scheduled Appointment", name: "scheduled_appointment", type: "datetime-local", required: true, colSpan: "md:col-span-2" },
      { label: "Criteria Scores", name: "criteria_scores", type: "textarea", colSpan: "md:col-span-2", placeholder: '{"communication": 8.5, "technical": 9.0, "motivation": 8.0}' },
      { label: "Total Score", name: "total_score", type: "number", step: "0.1" },
      { label: "Evaluated At", name: "evaluated_at", type: "datetime-local" },
      { 
        label: "Interview Status", 
        name: "interview_status", 
        type: "select", 
        colSpan: "md:col-span-2",
        options: [
          { value: "", text: "Select Status" },
          { value: "Scheduled", text: "Scheduled" },
          { value: "In Progress", text: "In Progress" },
          { value: "Evaluated", text: "Evaluated" },
          { value: "Accepted", text: "Accepted" },
          { value: "Rejected", text: "Rejected" },
          { value: "Cancelled", text: "Cancelled" }
        ]
      }
    ];

    const formTpl = `
      <div class="max-w-3xl mx-auto py-10 px-4">
        <header class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight">Create Interview</h1>
        </header>
        <section class="bg-white rounded-2xl shadow p-6">
          <form id="InterviewForm" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${fields.map(f => {
              if (f.type === 'textarea') {
                return `
                  <div class="${f.colSpan || ''}">
                    <label class="block text-sm font-medium mb-1">
                      ${f.label}${f.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    <textarea name="${f.name}" 
                             ${f.required ? 'required' : ''} 
                             rows="4"
                             placeholder="${f.placeholder || ''}"
                             class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                    ${f.name === 'criteria_scores' ? '<p class="text-sm text-gray-500 mt-1">Enter JSON format for criteria scores</p>' : ''}
                  </div>
                `;
              } else if (f.type === 'select') {
                return `
                  <div class="${f.colSpan || ''}">
                    <label class="block text-sm font-medium mb-1">
                      ${f.label}${f.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    <select name="${f.name}" 
                           ${f.required ? 'required' : ''} 
                           class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      ${f.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
                    </select>
                  </div>
                `;
              } else {
                return `
                  <div class="${f.colSpan || ''}">
                    <label class="block text-sm font-medium mb-1">
                      ${f.label}${f.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    <input type="${f.type}" 
                           name="${f.name}" 
                           ${f.required ? 'required' : ''} 
                           ${f.step ? `step="${f.step}"` : ''}
                           ${f.placeholder ? `placeholder="${f.placeholder}"` : ''}
                           class="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                `;
              }
            }).join('')}

            <div class="md:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" 
                class="inline-flex items-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Save Interview
              </button>
              <button type="reset" 
                class="inline-flex items-center rounded-xl border px-4 py-2 font-medium hover:bg-gray-50">
                Reset
              </button>
              <span id="formStatus" class="text-sm"></span>
            </div>
          </form>
          <div id="resultBox" class="hidden mt-6 rounded-xl border bg-white p-4 text-sm"></div>
        </section>
      </div>
    `;

    this.application.mainContainer.innerHTML = formTpl;

    document
      .getElementById("InterviewForm")
      .addEventListener("submit", (e) => this.submit(e));
  }

  async submit(e) {
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
        try {
          data[key] = value ? JSON.parse(value) : {};
        } catch (e) {
          const statusEl = document.getElementById('formStatus');
          statusEl.textContent = 'Invalid JSON format for Criteria Scores';
          statusEl.className = 'text-sm text-red-600';
          return;
        }
      } else if (key === 'scheduled_appointment' || key === 'evaluated_at') {
        if (value) {
          data[key] = new Date(value).toISOString();
        }
      } else {
        data[key] = value;
      }
    }
    
    const statusEl = document.getElementById('formStatus');
    const resultBox = document.getElementById('resultBox');
    
    statusEl.textContent = 'Submitting...';
    statusEl.className = 'text-sm text-gray-500';
    
    try {
      const response = await fetch(window.__ROOT_URL__ + '/recruit/CreateInterview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.isSuccess) {
        statusEl.textContent = 'Interview created successfully!';
        statusEl.className = 'text-sm text-green-600';
        
        resultBox.className = 'mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-800';
        resultBox.textContent = JSON.stringify(result.result, null, 2);
        resultBox.classList.remove('hidden');
        
        form.reset();
      } else {
        statusEl.textContent = 'Failed to create interview';
        statusEl.className = 'text-sm text-red-600';
        
        resultBox.className = 'mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800';
        resultBox.textContent = result.result || 'Unknown error';
        resultBox.classList.remove('hidden');
      }
    } catch (error) {
      statusEl.textContent = 'Error submitting form';
      statusEl.className = 'text-sm text-red-600';
      
      resultBox.className = 'mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800';
      resultBox.textContent = error.toString();
      resultBox.classList.remove('hidden');
    }
  }
}