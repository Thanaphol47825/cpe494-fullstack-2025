(() => {
  const form = document.getElementById("resignationStudentForm");
  const statusEl = document.getElementById("formStatus");
  const resultBox = document.getElementById("resultBox");
  const ROOT = window.__ROOT_URL__ || "";

  const toRFC3339DateOrNull = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
  const safeText = (x) => (typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })());
  const toIntOrNull = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    statusEl.textContent = "";
    resultBox.classList.add("hidden");

    const fd = new FormData(form);
    const payload = {
      StudentCode: fd.get("StudentCode")?.trim(),
      Reason: fd.get("Reason")?.trim(),
    };

    if (!payload.StudentCode || !payload.Reason) {
      statusEl.textContent = "Please fill required fields (*).";
      statusEl.className = "text-sm text-red-600";
      return;
    }

    try {
      statusEl.textContent = "Saving…";
      statusEl.className = "text-sm text-gray-500";

      const res = await fetch(`${ROOT}/hr/resignation-student-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(safeText(msg));
      }

      statusEl.textContent = "Saved successfully.";
      statusEl.className = "text-sm text-green-600";
      resultBox.innerHTML = `
        <div><strong>Created:</strong> ${data?.student_code || data?.StudentCode || ""}</div>
        <pre class="mt-2 overflow-auto text-xs bg-gray-50 p-3 rounded-lg border">${JSON.stringify(data, null, 2)}</pre>
      `;
      resultBox.classList.remove("hidden");
    } catch (err) {
      statusEl.textContent = err.message || "Save failed.";
      statusEl.className = "text-sm text-red-600";
      resultBox.innerHTML = `<div class="text-red-700"><strong>Error:</strong> ${safeText(err.message || err)}</div>`;
      resultBox.classList.remove("hidden");
      resultBox.classList.add("border-red-200", "bg-red-50");
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();
