(() => {
  const form = document.getElementById("studentForm");
  const resultBox = document.getElementById("resultBox");
  const ROOT = window.__ROOT_URL__ || "";

function setStatus(msg, type = "info") {
  console.log(`[${type}]`, msg);
}

  function showResult(html) {
    if (!resultBox) return;
    resultBox.innerHTML = html;
    resultBox.style.display = "block";
  }
  function hideResult() {
    if (!resultBox) return;
    resultBox.style.display = "none";
    resultBox.innerHTML = "";
  }

  const toRFC3339DateOrNull = (ymd) => (!ymd ? null : `${ymd}T00:00:00Z`);
  const toIntOrNull = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    hideResult();
    setStatus("", "info");

    const fd = new FormData(form);
    const payload = {
      student_code: fd.get("student_code")?.trim(),
      first_name: fd.get("first_name")?.trim(),
      last_name: fd.get("last_name")?.trim(),
      email: fd.get("email")?.trim(),
      start_date: toRFC3339DateOrNull(fd.get("start_date")),
      birth_date: toRFC3339DateOrNull(fd.get("birth_date")),
      program: toIntOrNull(fd.get("program")),
      department: fd.get("department")?.trim() || "",
      status: toIntOrNull(fd.get("status")),
      Gender: (fd.get("Gender") || "").trim() || null,
      CitizenID: fd.get("CitizenID")?.trim() || null,
      PhoneNumber: fd.get("PhoneNumber")?.trim() || null,
      AdvisorCode: fd.get("AdvisorCode")?.trim() || null,
    };

    if (!payload.student_code || !payload.first_name || !payload.last_name || !payload.email) {
      setStatus("Please fill required fields (*).", "err");
      return;
    }

    try {
      setStatus("Saving…", "info");
      const res = await fetch(`${ROOT}/common/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.isSuccess) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const s = data.result || {};
      setStatus("Saved successfully.", "ok");
      showResult(
        `<div><strong>Created:</strong> ${s.student_code ?? ""} (ID: ${s.ID ?? ""})</div>
         <pre style="margin-top:8px; padding:8px; font-size:12px; background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; overflow:auto;">
${JSON.stringify(data, null, 2)}
         </pre>`
      );
      form.reset();
    } catch (err) {
      setStatus(err.message || "Save failed.", "err");
      showResult(`<div style="color:#b91c1c;"><strong>Error:</strong> ${err.message || String(err)}</div>`);
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();
