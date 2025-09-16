(() => {
  const form = document.getElementById("facultyForm");
  const ROOT = window.__ROOT_URL__ || "";

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
      name: fd.get("name")?.trim(),
      budget: parseInt(fd.get("budget")?.trim()) || 0,
    };

    if (!payload.name) {
      alert("Please fill all the required fields.");
      return;
    }

    try {
      const res = await fetch(`${ROOT}/common/faculties`, {
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