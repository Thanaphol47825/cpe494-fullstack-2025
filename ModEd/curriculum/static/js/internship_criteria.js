document.addEventListener('DOMContentLoaded', function () {
  const rootUrl = window.__ROOT_URL__ || '';
  const apiBase = rootUrl + '/curriculum/InternshipCriteria';
  const listDiv = document.getElementById('criteria-list');
  const modal = document.getElementById('criteria-modal');
  const openModalBtn = null; // will be bound after render
  const closeModalBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('criteriaForm');
  const submitBtn = document.getElementById('submitBtn');
  let editingId = null;

  function openModal() {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
  function closeModal() {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    form.reset();
    editingId = null;
    submitBtn.textContent = 'Create';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  function fetchCriterias() {
    fetch(apiBase + '/getall')
      .then(res => res.json())
      .then(data => {
        if (data.isSuccess) {
          renderList(data.result);
        } else {
          listDiv.innerHTML = '<div class="text-red-500">Failed to load data</div>';
        }
      });
  }

  function renderList(list) {
    listDiv.innerHTML = `
      <div class="bg-gray-50 rounded-2xl shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Internship Criteria</h2>
            <p class="text-gray-400 text-sm">All evaluation criterias for internship</p>
          </div>
          <button id="openModalBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow" type="button">+ New</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 text-left font-semibold text-gray-500">TITLE</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-500">DESCRIPTION</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-500">SCORE</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-500">APP ID</th>
                <th class="px-4 py-2 text-left font-semibold text-gray-500">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => `
                <tr class="hover:bg-blue-50 transition">
                  <td class="px-4 py-2">${c.Title ?? c.title}</td>
                  <td class="px-4 py-2">${c.Description ?? c.description}</td>
                  <td class="px-4 py-2">${c.Score ?? c.score}</td>
                  <td class="px-4 py-2">${c.InternshipApplicationId ?? c.internship_application_id}</td>
                  <td class="px-4 py-2">
                    <button class="text-blue-600 hover:underline mr-2" onclick="editCriteria(${c.ID ?? c.id})">Edit</button>
                    <button class="text-red-600 hover:underline" onclick="deleteCriteria(${c.ID ?? c.id})">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="text-gray-500 text-sm">Page 1 of 1</div>
          <div class="flex gap-1">
            <button class="px-2 py-1 rounded border text-gray-400 bg-white" disabled>&laquo;</button>
            <button class="px-2 py-1 rounded border text-gray-400 bg-white" disabled>&lsaquo;</button>
            <button class="px-2 py-1 rounded border text-gray-700 bg-white font-bold" disabled>1</button>
            <button class="px-2 py-1 rounded border text-gray-400 bg-white" disabled>&rsaquo;</button>
            <button class="px-2 py-1 rounded border text-gray-400 bg-white" disabled>&raquo;</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('openModalBtn').onclick = openModal;
  }

  window.editCriteria = function (id) {
    fetch(apiBase + '/' + id)
      .then(res => res.json())
      .then(data => {
        if (data.isSuccess) {
          const c = data.result;
          form.title.value = c.Title ?? c.title ?? '';
          form.description.value = c.Description ?? c.description ?? '';
          form.score.value = c.Score ?? c.score ?? '';
          form.internship_application_id.value = c.InternshipApplicationId ?? c.internship_application_id ?? '';
          editingId = c.ID ?? c.id;
          submitBtn.textContent = 'Update';
          openModal();
        }
      });
  };

  window.deleteCriteria = function (id) {
    if (!confirm('Delete this criteria?')) return;
    fetch(apiBase + '/delete/' + id)
      .then(res => res.json())
      .then(data => {
        fetchCriterias();
      });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const payload = {
      title: form.title.value,
      description: form.description.value,
      score: Number(form.score.value),
      internship_application_id: Number(form.internship_application_id.value)
    };
    let url = apiBase + '/create';
    if (editingId) {
      url = apiBase + '/update/' + editingId;
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        fetchCriterias();
        closeModal();
      });
  });

  fetchCriterias();
});
