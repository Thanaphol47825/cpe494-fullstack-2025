if (typeof window !== 'undefined' && !window.InternshipMentorCreate) {
  class InternshipMentorCreate {
      constructor(application) {
          this.application = application;
          this.mentors = [];
          this.tbody = null;
          this.formFields = [
              { Id: "mentor_first_name", Label: "First Name", Name: "mentor_first_name", Type: "text" },
              { Id: "mentor_last_name", Label: "Last Name", Name: "mentor_last_name", Type: "text" },
              { Id: "mentor_email", Label: "Email", Name: "mentor_email", Type: "email" },
              { Id: "mentor_phone", Label: "Phone", Name: "mentor_phone", Type: "text" },
              { Id: "company_id", Label: "Company ID", Name: "company_id", Type: "number" }
          ];
      }

      async render() {
          // Clear container
          this.application.mainContainer.innerHTML = '';

          const formWrapper = this.application.create(`
            <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
              <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20"></div>
                <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full opacity-15"></div>
                <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10"></div>
              </div>

              <div class="relative z-10 container mx-auto px-4 py-12">
                <!-- Header -->
                <div class="text-center mb-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-6">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <h1 class="text-4xl font-bold text-gray-900 mb-4">
                    Internship Mentor Management
                  </h1>
                  <div class="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mb-4 rounded-full"></div>
                  <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    Manage all internship mentors here.
                  </p>
                </div>
                <!-- Form -->
                <div class="max-w-3xl mx-auto mb-8">
                  <form id="internship-mentor-form" class="form-container bg-white p-6 rounded-2xl shadow-lg">
                    <div id="form-fields"></div>
                    <div class="flex gap-3 mt-6">
                      <button type="submit" class="form-submit-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium">
                        Create Mentor
                      </button>
                      <button type="button" id="cancel-btn" class="hidden bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
                  <!-- Table -->
                <div class="max-w-6xl mx-auto">
                  <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    <div id="mentor-table-container" class="p-6"></div>
                  </div>
                </div>
              </div>
            </div>
            `);
          this.application.mainContainer.appendChild(formWrapper);

          // Render form fields
          const fieldsContainer = document.getElementById('form-fields');
          this.formFields.forEach(f => {
              const fieldHTML = `<div class="mb-4">
                  <label for="${f.Id}" class="block text-gray-700 mb-1">${f.Label}</label>
                  <input id="${f.Id}" name="${f.Name}" type="${f.Type}" class="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>`;
              fieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
          });

          // Form events
          const form = document.getElementById('internship-mentor-form');
          form.addEventListener('submit', this.handleSubmit.bind(this));
          document.getElementById('cancel-btn').addEventListener('click', this.cancelEdit.bind(this));

          await this.loadMentors();
      }

      async handleSubmit(event) {
          event.preventDefault();
          const form = event.target;
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
              // Convert number fields
              if (key === 'company_id') value = parseInt(value) || 0;
              data[key] = value;
          });

          const mentorID = form.querySelector('#mentor_id')?.value;
          const url = mentorID 
              ? `/curriculum/UpdateInternshipMentor/${mentorID}` 
              : "/curriculum/CreateInternshipMentor";

          try {
              const res = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
              });

              const result = await res.json();
              if (!result.isSuccess) throw new Error(result.error || 'Failed');

              this.showSuccessMessage(mentorID ? 'Mentor updated successfully' : 'Mentor created successfully');
              this.resetForm();
              await this.loadMentors();
          } catch (err) {
              console.error(err);
              alert('Failed to save mentor. ' + (err.message || ''));
          }
      }

      resetForm() {
          const form = document.getElementById('internship-mentor-form');
          form.reset();
          const hiddenId = form.querySelector('#mentor_id');
          if (hiddenId) hiddenId.remove();
          document.querySelector('button[type="submit"]').textContent = 'Create Mentor';
          document.getElementById('cancel-btn').classList.add('hidden');
      }

      cancelEdit() {
          this.resetForm();
      }

      showSuccessMessage(message) {
          const container = this.application.mainContainer;
          const alert = document.createElement('div');
          alert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          alert.textContent = message;
          container.appendChild(alert);
          setTimeout(() => alert.remove(), 3000);
      }

      async loadMentors() {
          try {
              const res = await fetch('/curriculum/GetInternshipMentors');
              const json = await res.json();
              this.mentors = json.isSuccess ? json.result : [];
          } catch {
              this.mentors = [];
          }
          this.renderTable();
      }

      renderTable() {
          const container = document.getElementById('mentor-table-container');
          container.innerHTML = '';

          if (!this.mentors || this.mentors.length === 0) {
            if (this.application.template && this.application.template.EmptyState) {
                const emptyHTML = Mustache.render(this.application.template.EmptyState, {
                    title: "No Mentors Found",
                    description: "There are currently no mentors in the system. Please create one using the form above."
                });
                container.appendChild(this.application.create(emptyHTML));
            } else {
                container.innerHTML = `
                    <div class="text-center text-gray-500 py-10">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <p class="text-lg font-medium">No mentors found</p>
                        <p class="text-sm mt-2">Create your first mentor using the form above</p>
                    </div>
                `;
            }
            return;
        }

          const tableHTML = Mustache.render(this.application.template.Table, { responsive: true, striped: true });
          const tableElement = this.application.create(tableHTML);
          container.appendChild(tableElement);

          const headerRow = tableElement.querySelector('[rel="headerRow"]');
          const columns = ['First Name', 'Last Name', 'Email', 'Phone', 'Company ID', 'Actions'];
          columns.forEach(col => {
              const colHTML = `<th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>${col}</th>`;
              headerRow.insertAdjacentHTML('beforeend', colHTML);
          });

          this.tbody = tableElement.querySelector('[rel="tbody"]');
          console.log(this.mentors.length);

          this.mentors.forEach(m => this.addMentorRow(m, false));
        }

      addMentorRow(mentor) {
          const row = document.createElement('tr');
          row.className = 'bg-white border-b hover:bg-gray-50';
          row.innerHTML = `
              <td class="px-6 py-4">${mentor.mentor_first_name}</td>
              <td class="px-6 py-4">${mentor.mentor_last_name}</td>
              <td class="px-6 py-4">${mentor.mentor_email}</td>
              <td class="px-6 py-4">${mentor.mentor_phone}</td>
              <td class="px-6 py-4">${mentor.company_id}</td>
              <td class="px-6 py-4 text-right">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button class="text-red-600 hover:text-red-800">Delete</button>
              </td>
          `;

          const editBtn = row.querySelector('button:nth-child(1)');
          const deleteBtn = row.querySelector('button:nth-child(2)');

          editBtn.addEventListener('click', () => this.editMentor(mentor));
          deleteBtn.addEventListener('click', () => this.deleteMentor(mentor));

          this.tbody.appendChild(row);
      }

      editMentor(mentor) {
          const form = document.getElementById('internship-mentor-form');
          document.querySelector('button[type="submit"]').textContent = 'Update Mentor';
          document.getElementById('cancel-btn').classList.remove('hidden');

          let hiddenId = form.querySelector('#mentor_id');
          if (!hiddenId) {
              hiddenId = document.createElement('input');
              hiddenId.type = 'hidden';
              hiddenId.id = 'mentor_id';
              hiddenId.name = 'Id';
              form.appendChild(hiddenId);
          }
          hiddenId.value = mentor.ID;

          this.formFields.forEach(f => {
              const input = form.querySelector(`#${f.Id}`);
              if (input) input.value = mentor[f.Name] || '';
          });

          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      async deleteMentor(mentor) {
          if (!confirm('Are you sure you want to delete this mentor?')) return;

          try {
              const res = await fetch(`/curriculum/DeleteInternshipMentor/${mentor.ID}`, { 
                method: "GET" });
                
              const result = await res.json();
              if (result.isSuccess) {
                  this.showSuccessMessage('Mentor deleted successfully');
                  await this.loadMentors();
              } else throw new Error(result.error || 'Failed');
          } catch (err) {
              console.error(err);
              alert('Failed to delete mentor. Please try again.');
          }
      }
  }

  window.InternshipMentorCreate = InternshipMentorCreate;
}

