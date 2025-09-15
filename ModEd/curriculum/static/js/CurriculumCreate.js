(() => {
    const ROOT = window.__ROOT_URL__ || "";
    const form = document.getElementById('curriculum-create-form');

    const getDepartments = async () => {
        try {
            const res = await fetch(`${ROOT}/common/departments/getall`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ([]));
            if (!res.ok) {
                const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
                throw new Error(msg);
            }

            // Create select element
            const select = document.createElement("select");
            select.name = "Department";
            select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

            // Add default not-selected option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Select a department --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            if (data.result == undefined) {
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.ID;
                    option.textContent = item.name;
                    select.appendChild(option);
                });
            } else {
                data.result.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.ID;
                    option.textContent = item.name;
                    select.appendChild(option);
                });
            }

            return select;
        } catch (err) {
            console.error("Failed to fetch departments:", err);
            return document.createTextNode("Failed to load departments");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form)
            const payload = {
                Name: formData.get('Name'),
                StartYear: parseInt(formData.get('StartYear')),
                EndYear: parseInt(formData.get('EndYear')),
                DepartmentId: parseInt(formData.get('Department')),
                ProgramType: parseInt(formData.get('ProgramType')),
            };

            if (!payload.DepartmentId) {
                alert("Please select a department.");
                return;
            }
            if (!payload.ProgramType) {
                alert("Please select a program type.");
                return;
            }

            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await resp.json();
            // console.log(data);

            if (!data.isSuccess) {
                alert('Error: ' + data.result);
            } else {
                alert('Save: ' + data.result);
            }
        } catch (err) {

        }
    };

    document.addEventListener("DOMContentLoaded", async () => {
        const container = document.getElementById("departmentSelectContainer");
        if (container) {
            const select = await getDepartments();
            container.appendChild(select);
        }

        if (form) {
            form.addEventListener("submit", handleSubmit);
        }
    });
})();

