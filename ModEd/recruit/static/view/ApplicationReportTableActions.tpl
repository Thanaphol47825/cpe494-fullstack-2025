<div class="table-action-buttons">
  <button class="al-btn-view table-view-button" data-action="view" data-id="{ID}">View</button>
  <button class="al-btn-edit table-edit-button" data-action="edit" data-id="{ID}">Edit</button>
  <button class="al-btn-delete table-delete-button" data-action="delete" data-id="{ID}">Delete</button>
  <button class="al-btn-verify table-verify-button" data-action="verify" data-id="{ID}" data-status="{application_statuses}">🔍 Verify</button>
  <button class="al-btn-confirm table-confirm-button" data-action="confirm" data-id="{ID}" data-status="{application_statuses}">✅ Confirm</button>
  <button class="al-btn-schedule table-schedule-button" data-action="schedule" data-id="{ID}" data-status="{application_statuses}">Schedule</button>
  <button class="al-btn-transfer table-transfer-button" data-action="transfer" data-id="{ID}">Transfer</button>
</div>

<style>
.table-action-buttons {
  white-space: nowrap;
}

.table-view-button,
.table-edit-button,
.table-delete-button,
.table-verify-button,
.table-confirm-button,
.table-schedule-button,
.table-transfer-button {
  margin-right: 8px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 14px;
}

.table-view-button:hover,
.table-edit-button:hover,
.table-delete-button:hover,
.table-verify-button:hover,
.table-confirm-button:hover,
.table-schedule-button:hover,
.table-transfer-button:hover {
  text-decoration: underline;
}

.table-view-button {
  color: #2563eb;
}

.table-edit-button {
  color: #2563eb;
}

.table-delete-button {
  color: #dc2626;
}

.table-verify-button {
  color: #ea580c;
}

.table-confirm-button {
  color: #16a34a;
}

.table-schedule-button {
  color: #16a34a;
}

.table-transfer-button {
  color: #9333ea;
  margin-right: 0;
}
</style>
