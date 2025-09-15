document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resignForm");
  const messageDiv = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const instructorCode = document.getElementById("instructorCode").value.trim();
    const reason = document.getElementById("reason").value.trim();

    if (!instructorCode || !reason) {
      messageDiv.textContent = "Please fill all required fields.";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/hr/resignation-instructor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          InstructorCode: instructorCode,
          Reason: reason,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        messageDiv.textContent = data.message || "Resignation submitted successfully.";
        messageDiv.style.color = "green";
        form.reset();
      } else {
        const errData = await res.json();
        messageDiv.textContent = errData.message || "Failed to submit resignation.";
        messageDiv.style.color = "red";
      }
    } catch (err) {
      messageDiv.textContent = "Error: " + err.message;
      messageDiv.style.color = "red";
    }
  });
});
