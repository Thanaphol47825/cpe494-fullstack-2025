document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('createCriteriaForm');
  
  if (form) {
    const submitBtn = document.getElementById('submitCreateCriteria') || form.querySelector('button[type="submit"]');
    let msg = document.getElementById('formMessage');
    if (!msg) {
      msg = document.createElement('span');
      msg.id = 'formMessage';
      msg.className = 'text-sm text-gray-600';
      submitBtn?.insertAdjacentElement('afterend', msg);
    }

    let submitting = false;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (submitting) return;
      submitting = true;
      if (submitBtn) submitBtn.disabled = true;
      msg.textContent = 'Sending...';

      const fd = new FormData(form);
      const payload = {
        application_rounds_id: Number(fd.get('application_rounds_id')) || fd.get('application_rounds_id'),
        faculty_id: Number(fd.get('faculty_id')) || fd.get('faculty_id'),
        department_id: Number(fd.get('department_id')) || fd.get('department_id'),
        passing_score: Number(fd.get('passing_score')) || fd.get('passing_score'),
      };

      try {
        const res = await fetch(`${window.__ROOT_URL__}/recruit/CreateInterviewCriteria`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.isSuccess) {
          throw new Error(data?.result || `HTTP ${res.status}`);
        }

        msg.textContent = 'Saved.';
        form.reset();
      } catch (err) {
        console.error(err);
        msg.textContent = 'Error: ' + (err.message || 'unknown');
      } finally {
        submitting = false;
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => { msg.textContent = ''; }, 3000);
      }
    });
  }

  const addCriteriaBtn = document.getElementById('addCriteriaBtn');
  if (addCriteriaBtn) {
    addCriteriaBtn.addEventListener('click', async function () {
      try {
        const response = await fetch(`${window.__ROOT_URL__}/recruit/CreateRawSQL`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (!data.isSuccess) {
          throw new Error(data.result);
        }
        alert("Config added successfully!");
      } catch (err) {
        console.error("Error adding criteria:", err);
        alert("Error: " + err.message);
      }
    });
  }
});
