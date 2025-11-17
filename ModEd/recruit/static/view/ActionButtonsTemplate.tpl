<style>
.table-action-buttons {
  white-space: nowrap;
}

.table-view-button {
  color: #2563eb;
  margin-right: 8px;
}

.table-view-button:hover {
  text-decoration: underline;
}

.table-edit-button {
  color: #2563eb;
  margin-right: 8px;
}

.table-edit-button:hover {
  text-decoration: underline;
}

.table-delete-button {
  color: #dc2626;
}

.table-delete-button:hover {
  text-decoration: underline;
}
</style>
<div class="table-action-buttons">
  <button class="al-btn-view table-view-button" data-action="view" data-id="{ID}">View</button>
  <button class="al-btn-edit table-edit-button" data-action="edit" data-id="{ID}">Edit</button>
  <button class="al-btn-delete table-delete-button" data-action="delete" data-id="{ID}">Delete</button>
</div>
