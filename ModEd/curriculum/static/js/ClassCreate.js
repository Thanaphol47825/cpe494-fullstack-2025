(() => {
  const form = document.getElementById('class-create-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(form);

      const scheduleLocal = formData.get('Schedule'); 
      const scheduleISO = scheduleLocal ? new Date(scheduleLocal).toISOString() : null;

      const payload = {
        CourseId: parseInt(formData.get('CourseId')),
        Section: parseInt(formData.get('Section')),
        Schedule: scheduleISO,
      };
      // console.log(payload);

      const resp = await fetch(form.action, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      // console.log(data);

      if (!data?.isSuccess) {
        alert('Error: ' + (data?.result ?? 'Unknown error'));
      } else {
        alert('Save: ' + data.result);
      }
    } catch (err) {
        console.error('Submission error:', err);
    }
  });
})();
