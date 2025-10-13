if (typeof window !== 'undefined' && !window.InternshipMentorCreate) {
    class InternshipMentorCreate {
        constructor(application) {
            this.application = application;
            this.mentors = [];
            this.tbody = null;
        }

        async render() {
            console.log("Create Internship Mentor Form");

            // Clear the container
            this.application.mainContainer.innerHTML = "";

            // Create form wrapper
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

            // Add each input field using Mustache templates
            const fields = [
                { Id: "mentor_first_name", Label: "First Name", Type: "text", Name: "MentorFirstName" },
                { Id: "mentor_last_name", Label: "Last Name", Type: "text", Name: "MentorLastName" },
                { Id: "mentor_email", Label: "Email", Type: "email", Name: "MentorEmail" },
                { Id: "mentor_phone", Label: "Phone", Type: "text", Name: "MentorPhone" },
                { Id: "company_id", Label: "Company ID", Type: "number", Name: "CompanyId" }
            ];

            // Get form fields container
            const fieldsContainer = document.getElementById('form-fields');
            fields.forEach(field => {
                if (this.application.template && this.application.template.Input) {
                    const inputHTML = Mustache.render(this.application.template.Input, field);
                    fieldsContainer.appendChild(this.application.create(inputHTML));
                }
            });

            this.formFields = fields;

            // Add event listener for form submission
            const form = document.getElementById('internship-mentor-form');
            form.addEventListener('submit', this.handleSubmit.bind(this));

            // Add event listener for cancel button
            const cancelBtn = document.getElementById('cancel-btn');
            cancelBtn.addEventListener('click', this.cancelEdit.bind(this));

            await this.loadMentors();
        }

        async handleSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);

            // Check if editing (has mentor_id hidden field)
            const mentorID = form.querySelector('#mentor_id')?.value;

            try {
                const url = mentorID 
                    ? `/curriculum/UpdateInternshipMentor/${mentorID}`
                    : "/curriculum/CreateInternshipMentor";
                
                const response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error('Failed to save mentor');

                const result = await response.json();
                
                this.resetForm();
                this.showSuccessMessage(mentorID ? 'Mentor updated successfully' : 'Mentor created successfully');
                
                // Reload all mentors from server
                await this.loadMentors();
            } catch (err) {
                console.error(err);
                alert('Failed to save mentor.');
            }
        }

        resetForm() {
            const form = document.getElementById('internship-mentor-form');
            form.reset();
            
            // Remove hidden mentor_id field if exists
            const hiddenId = form.querySelector('#mentor_id');
            if (hiddenId) hiddenId.remove();
            
            // Change button text back to Create
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Create Mentor';
            
            // Hide cancel button
            const cancelBtn = document.getElementById('cancel-btn');
            cancelBtn.classList.add('hidden');
        }

        cancelEdit() {
            this.resetForm();
        }

        showSuccessMessage(message) {
            const container = this.application.mainContainer;
            const alert = this.application.create(`
                <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>${message}</span>
                    </div>
                </div>
            `);
            container.appendChild(alert);
            setTimeout(() => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            }, 3000);
        }

        async loadMentors() {
            try {
                const res = await fetch('/curriculum/GetInternshipMentors');
                this.mentors = res.ok ? await res.json() : [];
                this.mentors = this.mentors.result;
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

        addMentorRow(mentor, prepend = true) {
          if (!this.tbody) return;
      
          const row = document.createElement('tr');
          row.className = 'bg-white border-b hover:bg-gray-50';
      
          const fields = ['mentor_first_name', 'mentor_last_name', 'mentor_email', 'mentor_phone', 'company_id'];
          fields.forEach(k => {
              const td = document.createElement('td');
              td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
              td.textContent = mentor[k] || ''; 
              row.appendChild(td);
          });
      
          // Actions
          const actionsTd = document.createElement('td');
          actionsTd.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
      
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Edit';
          editBtn.className = 'text-blue-600 hover:text-blue-800 mr-2';
          editBtn.addEventListener('click', () => this.editMentor(row, mentor));
      
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.className = 'text-red-600 hover:text-red-800';
          deleteBtn.addEventListener('click', () => this.deleteMentor(row, mentor));
      
          actionsTd.appendChild(editBtn);
          actionsTd.appendChild(deleteBtn);
          row.appendChild(actionsTd);
      
          if (prepend) this.tbody.prepend(row);
          else this.tbody.appendChild(row);
        }
      
        editMentor(row, mentor) {
          const form = document.getElementById('internship-mentor-form');
          const submitBtn = form.querySelector('button[type="submit"]');
          const cancelBtn = document.getElementById('cancel-btn');
          
          // Change to Update button
          submitBtn.textContent = 'Update Mentor';
          
          // Display Cancel button
          cancelBtn.classList.remove('hidden');
          
          let hiddenId = form.querySelector('#mentor_id');
          if (!hiddenId) {
              hiddenId = document.createElement('input');
              hiddenId.type = 'hidden';
              hiddenId.id = 'mentor_id';
              hiddenId.name = 'Id';
              form.appendChild(hiddenId);
          }
          hiddenId.value = mentor.Id || mentor.id;
          
          this.formFields.forEach(f => {
              const input = form.querySelector(`#${f.Id}`);
              if (input) {
                  input.value = mentor[f.Id] || ''; // ใช้ key ตรง ๆ จาก API
              }
          });
          
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      

        async deleteMentor(row, mentor) {
          if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) return;
          
          console.log('Deleting mentor:', mentor.ID);
          const mentorId = mentor.ID;
          console.log('Mentor ID:', mentorId);
          
          try {
              const res = await fetch(`/curriculum/DeleteInternshipMentor/${mentorId}`, { 
                  method: "GET", 
              });
              
              if (res.ok) {
                  this.showSuccessMessage('Mentor deleted successfully');
                  // Reload from server to ensure data consistency
                  await this.loadMentors();
              } else {
                  throw new Error('Failed to delete mentor');
              }
          } catch (err) {
              console.error(err);
              alert('Failed to delete mentor. Please try again.');
          }
      }
      
    }
    
    window.InternshipMentorCreate = InternshipMentorCreate;
}