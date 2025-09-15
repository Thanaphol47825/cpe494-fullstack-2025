(() => {
    const ROOT = window.__ROOT_URL__ || "";
    const form = document.getElementById("classMaterialForm");

    const getClasses = async () => {
        try {
            const res = await fetch(`${ROOT}/curriculum/Class/getClasses`, {
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
            select.name = "ClassId";
            select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

            // Add default not-selected option
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Select a class --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            data.result.forEach(item => {
                const option = document.createElement("option");
                option.value = item.ID;

                let formattedSchedule = "";
                if (item.schedule) {
                    const d = new Date(item.schedule);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    formattedSchedule = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
                }

                option.textContent = item.Course.name + " - " + formattedSchedule;
                select.appendChild(option);
            });
            return select;
        } catch (err) {
            console.error("Failed to fetch classes:", err);
            return document.createTextNode("Failed to load classes");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.ClassId) {
            alert("Please select a class.");
            return;
        }
        payload.ClassId = parseInt(payload.ClassId);

        try {
            const res = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.isSuccess) {
                alert("Class Material saved!");
                form.reset();
            } else {
                alert("Error: " + (data.result || "Failed to save"));
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };

    // Example usage: render select into a div with id="classSelectContainer"
    document.addEventListener("DOMContentLoaded", async () => {
        const container = document.getElementById("classSelectContainer");
        if (container) {
            const select = await getClasses();
            container.appendChild(select);
        }

        if (form) {
            form.addEventListener("submit", handleSubmit);
        }
    });
})();