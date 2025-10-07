<div class="card">
  <h2>{{title}}</h2>

  <form id="assignmentForm" class="grid grid-cols-1 gap-4">
    <div>
      <label class="block text-sm font-medium mb-1">Title <span class="text-red-500">*</span></label>
      <input type="text" name="title" required class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Enter assignment title" />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Description</label>
      <textarea name="description" class="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Optional description"></textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Start Date</label>
        <input type="datetime-local" name="startDate" class="w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Due Date</label>
        <input type="datetime-local" name="dueDate" class="w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Max Score</label>
      <input type="number" name="maxScore" value="100" class="w-32 rounded-md border border-gray-300 px-3 py-2" />
    </div>

    <div class="flex gap-2 justify-end">
      <button type="reset" class="btn">ล้างค่า</button>
      <button type="submit" class="btn primary">บันทึก Assignment</button>
    </div>
  </form>

  <div style="margin-top:12px">
    <button id="loadAllBtn" class="btn">โหลด Assignment ทั้งหมด</button>
  </div>

  <pre id="result" style="margin-top:12px;background:#fafafa;padding:10px;border-radius:8px;border:1px solid #eee"></pre>
  <pre id="allAssignments" style="margin-top:12px;white-space:pre-wrap;background:#fff8; padding:10px;border-radius:8px;border:1px solid #eee"></pre>
</div>
