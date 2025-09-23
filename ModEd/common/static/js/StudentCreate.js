class StudentCreate {
  constructor() {
    this.form = document.getElementById("studentForm");
    this.ROOT = window.__ROOT_URL__ || "";
  }

  toRFC3339DateOrNull(ymd) {
    return !ymd ? null : `${ymd}T00:00:00Z`;
  }

  safeText(x) {
    if (typeof x === "string") return x;
    try {
      return JSON.stringify(x);
    } catch {
      return String(x);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const fd = new FormData(this.form);
    const payload = {
      student_code: fd.get("student_code")?.trim(),
      first_name: fd.get("first_name")?.trim(),
      last_name: fd.get("last_name")?.trim(),
      email: fd.get("email")?.trim(),
      start_date: toRFC3339DateOrNull(fd.get("start_date")),
      birth_date: toRFC3339DateOrNull(fd.get("birth_date")),
      program: fd.get("program")?.trim() || null,
      department: fd.get("department")?.trim() || null,
      Gender: fd.get("Gender")?.trim() || null,
      CitizenID: fd.get("CitizenID")?.trim() || null,
      PhoneNumber: fd.get("PhoneNumber")?.trim() || null,
      AdvisorCode: fd.get("AdvisorCode")?.trim() || null,
    };

    if (
      !payload.student_code ||
      !payload.first_name ||
      !payload.last_name ||
      !payload.email
    ) {
      alert("Please fill all the required fields.");
      return;
    }

    try {
      const res = await fetch(`${this.ROOT}/common/students`, {
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
        throw new Error(this.safeText(msg));
      }

      alert("Saved successfully.");
      this.form.reset();
    } catch (err) {
      alert(err.message || "Save failed.");
    }
  }

  render() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    } else {
      console.warn('StudentCreate: #studentForm not found on the page.');
    }
  }
}

new StudentCreate().render();