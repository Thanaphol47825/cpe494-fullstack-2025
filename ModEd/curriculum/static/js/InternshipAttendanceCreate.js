if (typeof window !== 'undefined' && !window.InternshipAttendanceCreate) {
    class InternshipAttendanceCreate {
        constructor(application) {
            this.application = application;
        }

        async render() {
            console.log("Create Internship Attendance Form");
            console.log(this.application);

            this.application.mainContainer.innerHTML = '';

            const formWrapper = this.application.create(`
          <div class="bg-gray-100 min-h-screen py-8">
              <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                  Internship Attendance
              </h1>
              <form id="internship-attendance-form" class="form-container">
                  <div id="form-fields"></div>
                  <button type="submit" class="form-submit-btn">
                      Check in
                  </button>
              </form>
          </div>
      `);
            this.application.mainContainer.appendChild(formWrapper);

            const fieldsContainer = document.getElementById('form-fields');

            const fields = [
                { Id: "date", Label: "Date", Type: "date", Name: "date", Required: true },
                { Id: "check_in_time", Label: "Check-In Time", Type: "time", Name: "check_in_time", Required: true },
                { Id: "check_out_time", Label: "Check-Out Time", Type: "time", Name: "check_out_time", Required: true },
                {
                    Id: "check_in_status", Label: "Check-In Status", Type: "select", Name: "check_in_status",
                    options: [
                        { value: "true", label: "On Time" },
                        { value: "false", label: "Late" }
                    ],
                    required: true,
                    default: "true"
                },
                {
                    Id: "assing_work", Label: "Assigned Work", Type: "select", Name: "assing_work",
                    options: [
                        { value: "none", label: "None" },
                        { value: "pending", label: "Pending" },
                        { value: "completed", label: "Completed" }
                    ],
                    required: true
                },
                { Id: "student_info_id", Label: "Student Info ID", Type: "number", Name: "student_info_id", Required: true, Placeholder: "Enter Student ID" }
            ];

            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select" && this.application.template && this.application.template.SelectInput) {
                    inputHTML = Mustache.render(this.application.template.SelectInput, field);

                }
                else if (this.application.template && this.application.template.Input) {
                    inputHTML = Mustache.render(this.application.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            const form = document.getElementById('internship-attendance-form');
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/curriculum/InternshipAttendance/CreateInternshipAttendance', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Success:', result);
                    form.reset();
                } else {
                    throw new Error('Failed to record attendance');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to record attendance. Please try again.');
            }
        }
    }
    
    window.InternshipAttendanceCreate = InternshipAttendanceCreate;
}