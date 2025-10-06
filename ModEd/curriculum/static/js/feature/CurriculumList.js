if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
        }

        templateTable = `
            <div class="table-container">
                <h2 style="font-weight:600; font-size:1.2rem; margin-bottom:12px;">{{ Title }}</h2>

                <table class="table-blue">
                <thead>
                    <tr>
                    {{#Columns}}<th>{{ Label }}</th>{{/Columns}}
                    <th>Delete Btn</th>
                    </tr>
                </thead>

                <tbody>
                    {{#Rows}}
                    <tr data-rowid="{{RowId}}">
                        {{#Columns}}
                        {{#IsLink}}<td><a href="#" routerLink="{{Href}}" rel="{{Key}}">{{ Value }}</a></td>{{/IsLink}}
                        {{^IsLink}}<td>{{ Value }}</td>{{/IsLink}}
                        {{/Columns}}
                        <td>
                        <button id="curriculum-del-btn" type="button" data-id="{{RowId}}">Delete</button>
                        </td>
                    </tr>
                    {{/Rows}}
                    {{^Rows}}
                    <tr><td colspan="{{Colspan}}" class="ui-table-empty">No data available</td></tr>
                    {{/Rows}}
                </tbody>
                </table>
            </div>
        `;


        async getAllCurriculums() {
            const res = await fetch(`${RootURL}/curriculum/Curriculum/getCurriculums`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));

            let curriculums = []
            data.result.forEach(item => {
                curriculums.push({ Id: item.ID, Name: item.Name, StartYear: item.StartYear, EndYear: item.EndYear, DepartmentId: item.DepartmentId, Department: item.Department.name, ProgramType: item.ProgramType });
            });

            return curriculums;
        }

        async render() {
            this.application.mainContainer.innerHTML = ""

            const allCurriculums = await this.getAllCurriculums();
            const tableWrapper = this.application.create(`
                <div class="bg-gray-100 min-h-screen py-8">
                    <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
                        Curriculum List
                    </h1>
                        <div id="curriculum-list"></div>
                    <div style="margin-top: 20px;">
                        <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
                    </div>
                </div>
            `);
            this.application.mainContainer.appendChild(tableWrapper);
            const tableFields = {
                Title: "All Curriculums",
                Columns: [
                    { Label: "Id" },
                    { Label: "Name" },
                    { Label: "Start Year" },
                    { Label: "End Year" },
                    { Label: "Department" },
                    { Label: "Program Type" },
                ],
                Rows: allCurriculums.map(c => ({
                    RowId: c.Id,
                    Columns: [
                        { Value: c.Id },
                        // make Name a link (optional)
                        { Value: c.Name, IsLink: true, Href: `curriculum/curriculum/${c.Id}`, Key: c.Id },
                        { Value: c.StartYear },
                        { Value: c.EndYear },
                        { Value: c.Department ?? "" },
                        { Value: c.ProgramType === 0 ? "Regular" : "International" },
                    ],
                })),
                Colspan: 7,
            };

            const tableContainer = document.getElementById('curriculum-list');
            tableContainer.innerHTML = '';
            let inputHTML = Mustache.render(this.templateTable, tableFields);
            if (inputHTML) {
                const inputElement = this.application.create(inputHTML);
                tableContainer.appendChild(inputElement);

                inputElement.addEventListener('click', this.handleDelete.bind(this));

            }

            // let formHandler = document.getElementById("curriculum-del-btn");
            // formHandler.addEventListener('click', this.handleDelete.bind(this));
        }

        async handleDelete(e) {
            e.preventDefault();
            const curriculumId = e.target.getAttribute('data-id');
            if (!curriculumId) return;
            try {
                const resp = await fetch(`${RootURL}/curriculum/Curriculum/deleteCurriculum/${curriculumId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const resJson = await resp.json().catch(() => ({}));
                if (!resp.ok || resJson.isSuccess === false) {
                    throw new Error(resJson.result || `HTTP ${resp.status}`);
                }

                // remove the row from the DOM
                const btn = e.target.closest('#curriculum-del-btn');
                btn.closest('tr')?.remove();
            } catch (err) {
                alert(`Delete failed: ${err?.message || err}`);
            }
        }
    }

    if (typeof window !== 'undefined') {
        window.CurriculumList = CurriculumList;
    }
}
