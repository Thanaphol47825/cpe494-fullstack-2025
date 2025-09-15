(() => {
  const ROOT = window.__ROOT_URL__ || "";
  const form = document.getElementById('courseForm');

  const getCurriculums = async () => {
    try {
      const res = await fetch(`${ROOT}/curriculum/Curriculum/getCurriculums`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const select = document.createElement("select");
      select.name = "CurriculumId";
      select.id = "curriculumSelect";
      select.className = "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select a curriculum --";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      select.appendChild(defaultOption);

      const list = Array.isArray(data?.result) ? data.result : [];
      list.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ID;
        option.textContent = item.Name;
        select.appendChild(option);
      });

      return select;
    } catch (err) {
      console.error("Failed to fetch curriculums:", err);
      return document.createTextNode("Failed to load curriculums");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(form);
      const payload = {
        Name: (formData.get('Name') || '').toString().trim(),
        Description: (formData.get('Description') || '').toString().trim(),
        CurriculumId: parseInt(formData.get('CurriculumId') || '0', 10),
        Optional: (formData.get('Optional') || '') === 'true',
        CourseStatus: parseInt(formData.get('CourseStatus') || '0', 10),
      };

      const resp = await fetch(form.action, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!data.isSuccess) {
        alert('Error: ' + (data.result || 'failed to create course'));
      } else {
        alert('Save: success');
        form.reset();
      }
    } catch (err) {
      alert('Network error');
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("curriculumSelectContainer");
    if (container) {
      const select = await getCurriculums();
      container.appendChild(select);
    }

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  });
})();