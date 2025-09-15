(() => {
    const form = document.getElementById('curriculum-create-form');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form)
            const payload = {
                Name: formData.get('Name'),
                StartYear: parseInt(formData.get('StartYear')),
                EndYear: parseInt(formData.get('EndYear')),
                DepartmentId: parseInt(formData.get('Department')),
                ProgramType: parseInt(formData.get('ProgramType')),
            };
            // console.log(payload);

            const resp = await fetch(form.action, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await resp.json();
            // console.log(data);

            if (!data.isSuccess) {
                alert('Error: ' + data.result);
            } else {
                alert('Save: ' + data.result);
            }
        } catch (err) {

        }
    });
})();

