(() => {
  const form = document.getElementById("instructorForm");
  const ROOT = window.__ROOT_URL__ || "";

  const toRFC3339DateOrNull = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
  const safeText = (x) =>
    typeof x === "string"
      ? x
      : (() => {
          try {
            return JSON.stringify(x);
          } catch {
            return String(x);
          }
        })();

  async function handleSubmit(e) {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      instructor_code: fd.get("instructorCode")?.trim(),
      first_name: fd.get("firstName")?.trim(),
      last_name: fd.get("lastName")?.trim(),
      email: fd.get("email")?.trim(),
      department: fd.get("department")?.trim() || null,
      start_date: toRFC3339DateOrNull(fd.get("startDate")),
    };

    if (
      !payload.instructor_code ||
      !payload.first_name ||
      !payload.last_name ||
      !payload.email
    ) {
      alert("Please fill all the required fields.");
      return;
    }

    try {
      const res = await fetch(`${ROOT}/common/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          `Request failed (${res.status})`;
        throw new Error(safeText(msg));
      }

      alert("Saved successfully.");
      form.reset();
    } catch (err) {
      alert(err.message || "Save failed.");
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();
