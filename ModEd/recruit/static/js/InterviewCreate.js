(() => {
  const form = document.getElementById("interviewForm");
  const statusEl = document.getElementById("formStatus");
  const resultBox = document.getElementById("resultBox");
  const ROOT = window.__ROOT_URL__ || "";

  const safeText = (x) =>
    typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })();

  const parseDateTimeLocal = (dateTimeLocal) => {
    if (!dateTimeLocal) return "";
    return new Date(dateTimeLocal).toISOString();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    statusEl.textContent = "";
    resultBox.classList.add("hidden");
    resultBox.classList.remove("border-red-200", "bg-red-50");

    const fd = new FormData(form);
    const payload = {
      instructor_id: parseInt(fd.get("instructor_id")?.trim()) || 0,
      application_report_id: parseInt(fd.get("application_report_id")?.trim()) || 0,
      scheduled_appointment: parseDateTimeLocal(fd.get("scheduled_appointment")?.trim()),
      criteria_scores: fd.get("criteria_scores")?.trim() || "",
      total_score: parseFloat(fd.get("total_score")?.trim()) || 0,
      evaluated_at: parseDateTimeLocal(fd.get("evaluated_at")?.trim()),
      interview_status: fd.get("interview_status")?.trim() || "",
    };


    if (!payload.instructor_id || !payload.application_report_id || !payload.scheduled_appointment) {
      statusEl.textContent = "โปรดกรอก Instructor ID, Application Report ID และ Scheduled Appointment ให้ครบถ้วน";
      statusEl.className = "text-sm text-red-600";
      return;
    }

    if (payload.criteria_scores) {
      try {
        JSON.parse(payload.criteria_scores);
      } catch (err) {
        statusEl.textContent = "Criteria Scores ต้องเป็นรูปแบบ JSON ที่ถูกต้อง";
        statusEl.className = "text-sm text-red-600";
        return;
      }
    }

    try {
      statusEl.textContent = "Saving…";
      statusEl.className = "text-sm text-gray-500";

      const res = await fetch(`${ROOT}/recruit/CreateInterview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.result || `Request failed (${res.status})`;
        throw new Error(safeText(msg));
      }

      if (!data.isSuccess) {
        throw new Error(data.result || "สร้าง Interview ไม่สำเร็จ");
      }

      

      statusEl.textContent = "สร้าง Interview สำเร็จ";
      statusEl.className = "text-sm text-green-600";
      resultBox.innerHTML = `
        <div><strong>Created Interview:</strong> ID ${data.result?.id || ""}</div>
        <div><strong>Instructor ID:</strong> ${data.result?.instructor_id || ""}</div>
        <div><strong>Application Report ID:</strong> ${data.result?.application_report_id || ""}</div>
        <div><strong>Scheduled:</strong> ${data.result?.scheduled_appointment || ""}</div>
        <div><strong>Status:</strong> ${data.result?.interview_status || ""}</div>
        <div><strong>Total Score:</strong> ${data.result?.total_score || ""}</div>
        <pre class="mt-2 overflow-auto text-xs bg-gray-50 p-3 rounded-lg border">${JSON.stringify(data.result, null, 2)}</pre>
      `;
      resultBox.classList.remove("hidden");
      form.reset();
    } catch (err) {
      statusEl.textContent = err.message || "สร้าง Interview ไม่สำเร็จ";
      statusEl.className = "text-sm text-red-600";
      resultBox.innerHTML = `<div class="text-red-700"><strong>Error:</strong> ${safeText(err.message || err)}</div>`;
      resultBox.classList.remove("hidden");
      resultBox.classList.add("border-red-200", "bg-red-50");
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
})();
