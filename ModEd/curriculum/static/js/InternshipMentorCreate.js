if (typeof window !== 'undefined' && !window.InternshipMentorCreate) {
  class InternshipMentorCreate {
      constructor(application) {
          this.application = application;
          this.mentors = [];
          this.tbody = null;
          
          // Get user role from localStorage
          this.userRole = localStorage.getItem('role') || 'Student';
          this.currentUserId = parseInt(localStorage.getItem('userId')) || null;
          
          // Only Admin can access
          this.canAccess = this.userRole === 'Admin';
          
          this.formFields = [
              { Id: "mentor_first_name", Label: "First Name", Name: "mentor_first_name", Type: "text", Required: true },
              { Id: "mentor_last_name", Label: "Last Name", Name: "mentor_last_name", Type: "text", Required: true },
              { Id: "mentor_email", Label: "Email", Name: "mentor_email", Type: "email", Required: true },
              { Id: "mentor_phone", Label: "Phone", Name: "mentor_phone", Type: "text", Required: true },
              { Id: "company_id", Label: "Company ID", Name: "company_id", Type: "number", Required: true }
          ];
      }

      async render() {
          console.log("Internship Mentor Management");
          console.log("User Role:", this.userRole);
          console.log("Can Access:", this.canAccess);

          // Check permission before rendering
          if (!this.canAccess) {
              this.showAccessDenied();
              return;
          }

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
                  <div class="flex items-center justify-center space-x-2 mb-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Admin Only
                    </span>
                  </div>
                  <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    Manage all internship mentors here. Only administrators can create, edit, and delete mentors.
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
              const requiredAttr = f.Required ? 'required' : '';
              const fieldHTML = `<div class="mb-4">
                  <label for="${f.Id}" class="block text-gray-700 mb-1 font-medium">
                      ${f.Label} ${f.Required ? '<span class="text-red-500">*</span>' : ''}
                  </label>
                  <input id="${f.Id}" name="${f.Name}" type="${f.Type}" ${requiredAttr} 
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>`;
              fieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
          });

          // Form events
          const form = document.getElementById('internship-mentor-form');
          form.addEventListener('submit', this.handleSubmit.bind(this));
          document.getElementById('cancel-btn').addEventListener('click', this.cancelEdit.bind(this));

          await this.loadMentors();
      }

      showAccessDenied() {
          this.application.mainContainer.innerHTML = '';
          
          const deniedHTML = `
              <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                      </div>
                      <h2 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                      <p class="text-gray-600 mb-2">You don't have permission to access this page.</p>
                      <p class="text-sm text-gray-500 mb-6">Only <strong>Administrators</strong> can manage internship mentors.</p>
                      <div class="space-y-2">
                          <div class="flex items-center justify-center space-x-2 text-sm">
                              <span class="text-gray-600">Your current role:</span>
                              <span class="px-3 py-1 rounded-full text-xs font-medium ${this.getRoleBadgeClass()}">
                                  ${this.userRole}
                              </span>
                          </div>
                      </div>
                      <button onclick="window.location.hash='#/internship'" class="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium">
                          Go Back to Dashboard
                      </button>
                  </div>
              </div>
          `;
          
          this.application.mainContainer.innerHTML = deniedHTML;
      }

      getRoleBadgeClass() {
          const roleColors = {
              'Admin': 'bg-purple-100 text-purple-800',
              'Instructor': 'bg-blue-100 text-blue-800',
              'Student': 'bg-green-100 text-green-800'
          };
          return roleColors[this.userRole] || 'bg-gray-100 text-gray-800';
      }

      async handleSubmit(event) {
          event.preventDefault();
          const form = event.target;
          const formData = new FormData(form);
          const data = {};
          
          formData.forEach((value, key) => {
              // Convert number fields
              if (key === 'company_id') {
                  data[key] = parseInt(value) || 0;
              } else {
                  data[key] = value;
              }
          });

          const mentorID = form.querySelector('#mentor_id')?.value;
          const url = mentorID 
              ? `/curriculum/UpdateInternshipMentor/${mentorID}` 
              : "/curriculum/CreateInternshipMentor";

          try {
              const res = await fetch(url, {
                  method: "POST",
                  headers: { 
                      "Content-Type": "application/json",
                      "X-User-Role": this.userRole,
                      "X-User-Id": this.currentUserId
                  },
                  body: JSON.stringify(data),
              });

              const result = await res.json();
              
              if (!res.ok || !result.isSuccess) {
                  if (res.status === 403) {
                      throw new Error('Access denied. Only Admin can manage mentors.');
                  }
                  throw new Error(result.error || 'Failed to save mentor');
              }

              this.showSuccessMessage(mentorID ? 'Mentor updated successfully' : 'Mentor created successfully');
              this.resetForm();
              await this.loadMentors();
          } catch (err) {
              console.error(err);
              this.showErrorMessage(err.message || 'Failed to save mentor');
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
          alert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
          alert.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>${message}</span>
          `;
          container.appendChild(alert);
          setTimeout(() => alert.remove(), 3000);
      }

      showErrorMessage(message) {
          const container = this.application.mainContainer;
          const alert = document.createElement('div');
          alert.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
          alert.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>${message}</span>
          `;
          container.appendChild(alert);
          setTimeout(() => alert.remove(), 4000);
      }

      async loadMentors() {
          try {
              const res = await fetch('/curriculum/GetInternshipMentors', {
                  headers: {
                      'X-User-Role': this.userRole,
                      'X-User-Id': this.currentUserId
                  }
              });
              
              if (!res.ok) {
                  if (res.status === 403) {
                      throw new Error('Access denied');
                  }
                  throw new Error('Failed to load mentors');
              }
              
              const json = await res.json();
              this.mentors = json.isSuccess ? json.result : [];
          } catch (error) {
              console.error('Error loading mentors:', error);
              this.mentors = [];
              if (error.message === 'Access denied') {
                  this.showAccessDenied();
              }
          }
          this.renderTable();
      }

      renderTable() {
          const container = document.getElementById('mentor-table-container');
          if (!container) return;
          
          container.innerHTML = '';

          if (!this.mentors || this.mentors.length === 0) {
              container.innerHTML = `
                  <div class="text-center text-gray-500 py-10">
                      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <p class="text-lg font-medium">No mentors found</p>
                      <p class="text-sm mt-2">Create your first mentor using the form above</p>
                  </div>
              `;
              return;
          }

          const tableHTML = Mustache.render(this.application.template.Table, { responsive: true, striped: true });
          const tableElement = this.application.create(tableHTML);
          container.appendChild(tableElement);

          const headerRow = tableElement.querySelector('[rel="headerRow"]');
          const columns = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Actions'];
          columns.forEach(col => {
              const colHTML = `<th class='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>${col}</th>`;
              headerRow.insertAdjacentHTML('beforeend', colHTML);
          });

          this.tbody = tableElement.querySelector('[rel="tbody"]');
          this.mentors.forEach(m => this.addMentorRow(m));
      }

      addMentorRow(mentor) {
          const row = document.createElement('tr');
          row.className = 'bg-white border-b hover:bg-gray-50 transition-colors';
          row.innerHTML = `
              <td class="px-6 py-4 font-medium text-gray-900">${mentor.mentor_first_name || '-'}</td>
              <td class="px-6 py-4 text-gray-700">${mentor.mentor_last_name || '-'}</td>
              <td class="px-6 py-4 text-gray-700">${mentor.mentor_email || '-'}</td>
              <td class="px-6 py-4 text-gray-700">${mentor.mentor_phone || '-'}</td>
              <td class="px-6 py-4 text-gray-700">${mentor.Company?.company_name || `ID: ${mentor.company_id}`}</td>
              <td class="px-6 py-4 text-right space-x-2">
                  <button class="text-blue-600 hover:text-blue-800 font-medium transition-colors" data-action="edit">
                      Edit
                  </button>
                  <button class="text-red-600 hover:text-red-800 font-medium transition-colors" data-action="delete">
                      Delete
                  </button>
              </td>
          `;

          const editBtn = row.querySelector('[data-action="edit"]');
          const deleteBtn = row.querySelector('[data-action="delete"]');

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
          if (!confirm(`Are you sure you want to delete mentor "${mentor.mentor_first_name} ${mentor.mentor_last_name}"?\n\nThis action cannot be undone.`)) {
              return;
          }

          try {
              const res = await fetch(`/curriculum/DeleteInternshipMentor/${mentor.ID}`, { 
                  method: "POST",
                  headers: {
                      'Content-Type': 'application/json',
                      'X-User-Role': this.userRole,
                      'X-User-Id': this.currentUserId
                  }
              });
                
              const result = await res.json();
              
              if (!res.ok || !result.isSuccess) {
                  if (res.status === 403) {
                      throw new Error('Access denied. Only Admin can delete mentors.');
                  }
                  throw new Error(result.error || 'Failed to delete mentor');
              }
              
              this.showSuccessMessage('Mentor deleted successfully');
              await this.loadMentors();
          } catch (err) {
              console.error(err);
              this.showErrorMessage(err.message || 'Failed to delete mentor');
          }
      }
  }

  window.InternshipMentorCreate = InternshipMentorCreate;
}