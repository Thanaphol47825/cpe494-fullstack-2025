(() => {
  const $ = (sel) => document.querySelector(sel);

  function setStatus(msg, type = "info") {
    const el = $("#formStatus");
    el.textContent = msg || "";
    el.className = "text-sm " + (type === "error" ? "text-red-600" : type === "success" ? "text-green-600" : "text-gray-600");
  }

  function showResult(content, isError = false) {
    const box = $("#resultBox");
    box.classList.remove("hidden");
    box.className = "mt-6 rounded-xl border p-4 text-sm " + (isError ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200 text-gray-800");
    box.textContent = content;
  }

  window.addEventListener("DOMContentLoaded", () => {
    const form = $("#leaveForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus("Submitting...");
      showResult("", false);

      const payload = {
        student_code: form.student_code.value.trim(),
        leave_type: form.leave_type.value.trim(),
        reason: form.reason.value.trim(),
        leave_date: form.leave_date.value, // YYYY-MM-DD
      };

      if (!payload.student_code || !payload.leave_type || !payload.reason || !payload.leave_date) {
        setStatus("Please fill in all required fields.", "error");
        return;
      }

      const url = (window.__ROOT_URL__ || "") + "/hr/leave-student-requests";

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { message: text }; }

        if (!res.ok) {
          setStatus("Failed to submit.", "error");
          showResult(data?.message || "Request failed.", true);
          return;
        }

        setStatus("Submitted successfully.", "success");
        showResult(data?.message || "Leave request submitted successfully.");
        form.reset();
      } catch (err) {
        setStatus("Network error.", "error");
        showResult(err?.message || String(err), true);
      }
    });
  });
})();