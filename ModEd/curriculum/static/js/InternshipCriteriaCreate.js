if (typeof window !== 'undefined' && !window.InternshipCriteriaCreate) {
    class InternshipCriteriaCreate {
        constructor(application) {
            this.application = application;
        }

        async render() {
            console.log(this.application);
            this.application.mainContainer.innerHTML = '';

            const formWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                    Internship Criteria
                    </h1>
                    <form id="internship-criteria-form" class="form-container">
                        <div id="form-fields"></div>
                        <button type="submit" class="form-submit-btn">
                            Create Criteria
                        </button>
                    </form>
                    <div class="form-container mt-8">
                        <div id="internship-criteria-table"></div>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(formWrapper);

            const fieldsContainer = document.getElementById('form-fields');

            const fields = [
                { Id: "title", Label: "Title", Type: "text", Name: "title", Required: true, Placeholder: "Enter Criteria Title" },
                { Id: "description", Label: "Description", Type: "text", Name: "description", Required: true, Placeholder: "Enter Description" },
                { Id: "score", Label: "Score", Type: "number", Name: "score", Required: true, Placeholder: "Enter Score" },
                { Id: "internship_application_id", Label: "Internship Application ID", Type: "select", Name: "internship_application_id", Required: true, Placeholder: "Enter Application ID" },
            ];

            fields.forEach(field => {
                let inputHTML = '';

                if (field.Type === "select" && this.application.template && this.application.template.Select) {
                    inputHTML = Mustache.render(this.application.template.Select, field);
                }
                else if (this.application.template && this.application.template.Input) {
                    inputHTML = Mustache.render(this.application.template.Input, field);
                }

                if (inputHTML) {
                    const inputElement = this.application.create(inputHTML);
                    fieldsContainer.appendChild(inputElement);
                }
            });

            const form = document.getElementById('internship-criteria-form');
            form.addEventListener('submit', this.handleSubmit.bind(this));

            this.renderTable();
        }

        async renderTable() {
            const mockData = [
                {
                    id: 1,
                    title: "Project Completion",
                    description: "Complete assigned project tasks",
                    score: 85,
                    internship_application_id: 101
                },
                {
                    id: 2,
                    title: "Team Collaboration",
                    description: "Work effectively with team members",
                    score: 90,
                    internship_application_id: 102
                },
                {
                    id: 3,
                    title: "Technical Skills",
                    description: "Demonstrate technical competency",
                    score: 88,
                    internship_application_id: 103
                }
            ];

            const tableData = {
                Title: "Internship Criteria List",
                Columns: [
                    { Label: "ID" },
                    { Label: "Title" },
                    { Label: "Description" },
                    { Label: "Score" },
                    { Label: "Application ID" },
                    { Label: "Actions" }
                ]
            };

            const tableContainer = document.getElementById('internship-criteria-table');
            
            if (this.application.template && this.application.template.Table) {
                const tableHTML = Mustache.render(this.application.template.Table, tableData);
                tableContainer.innerHTML = tableHTML;

                const tbody = tableContainer.querySelector('tbody[rel="body"]');
                
                if (tbody && this.application.template.TableRow && this.application.template.TableColumn) {
                    mockData.forEach(item => {
                        const rowData = {
                            Columns: [
                                { Value: item.id, IsLink: false },
                                { Value: item.title, IsLink: false },
                                { Value: item.description, IsLink: false },
                                { Value: item.score, IsLink: false },
                                { Value: item.internship_application_id, IsLink: false },
                                { 
                                    Value: 'Edit | Delete', 
                                    IsLink: true, 
                                    Href: `#edit/${item.id}`,
                                    Key: 'action'
                                }
                            ]
                        };

                        const rowHTML = Mustache.render(this.application.template.TableRow, rowData, {
                            TableColumn: this.application.template.TableColumn
                        });
                        
                        const rowElement = this.application.create(rowHTML);
                        tbody.appendChild(rowElement);
                    });
                }
            }
        }

        async handleSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);

            try {
                const response = await fetch('/curriculum/InternshipCriteria/create', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Success:', result);
                    form.reset();
                
                    this.renderTable();
                    alert('Criteria created successfully!');
                } else {
                    throw new Error('Failed to create criteria');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to create criteria. Please try again.');
            }
        }
    }

    window.InternshipCriteriaCreate = InternshipCriteriaCreate;
}