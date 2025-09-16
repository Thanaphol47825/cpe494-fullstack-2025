(() => {
    const ROOT = window.__ROOT_URL__ || "";
    const form = document.getElementById("coursePlanForm");

    const getCourses = async () => {
      try {
        const res = await fetch(`${ROOT}/curriculum/course/getCourses`, {
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
        select.name = "CourseId";
        select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

        // Add default not-selected option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Select a course --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        data.result.forEach(item => {
          const option = document.createElement("option");
          option.value = item.ID;
          option.textContent = item.name;
          select.appendChild(option);
        });

        return select;
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        return document.createTextNode("Failed to load courses");
      }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.CourseId) {
            alert("Please select a course.");
            return;
        }
        payload.CourseId = parseInt(payload.CourseId);

        try {
            const res = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.isSuccess) {
                alert("Course Plan saved!");
                form.reset();
            } else {
                alert("Error: " + (data.result || "Failed to save"));
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };

    document.addEventListener("DOMContentLoaded", async () => {
      const container = document.getElementById("CourseSelectContainer");
      if (container) {
        const select = await getCourses();
        container.appendChild(select);
      }

      if (form) {
        form.addEventListener("submit", handleSubmit);
      }
    });
})();