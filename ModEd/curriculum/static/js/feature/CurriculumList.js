if (typeof window !== 'undefined' && !window.CurriculumList) {
    class CurriculumList {
        constructor(application) {
            this.application = application;
        }

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
            this.application.mainContainer.innerHTML = "Table"

            // const allCurriculums = await this.getAllCurriculums();
            // const tableWrapper = this.application.create(`
            //     <div class="bg-gray-100 min-h-screen py-8">
            //         <h1 class="text-2xl font-bold text-center text-gray-700 mb-8">
            //             Curriculum List
            //         </h1>
            //             <div id="curriculum-list"></div>
            //         <div style="margin-top: 20px;">
            //             <a routerLink="curriculum" style="color: #6c757d;">← Back to Curriculum Menu</a>
            //         </div>
            //     </div>
            // `);
            // this.application.mainContainer.appendChild(tableWrapper);
            // const tableFields = {
            //     Title: "All Curriculums",
            //     Columns: [
            //         { Label: "Id" },
            //         { Label: "Name" },
            //         { Label: "Start Year" },
            //         { Label: "End Year" },
            //         { Label: "Department" },
            //         { Label: "Program Type" },
            //     ],
            //     Rows: allCurriculums.map(c => ({
            //         Columns: [
            //             { Value: c.Id },
            //             // make Name a link (optional)
            //             { Value: c.Name, IsLink: true, Href: `#/curriculum/${c.Id}`, Key: "name" },
            //             { Value: c.StartYear },
            //             { Value: c.EndYear },
            //             { Value: c.Department ?? "" },
            //             { Value: c.ProgramType === 0 ? "Regular" : "International" },
            //         ],
            //     })),
            //     Colspan: 6,
            // };

            // const tableContainer = document.getElementById('curriculum-list');
            // tableContainer.innerHTML = '';
            // let inputHTML = Mustache.render(this.application.template.Table, tableFields);
            // if (inputHTML) {
            //     const inputElement = this.application.create(inputHTML);
            //     tableContainer.appendChild(inputElement);
            // }
        }
    }

    if (typeof window !== 'undefined') {
        window.CurriculumList = CurriculumList;
    }
}
