<div class="card">
  <h2>{{title}}</h2>
  <form id="submissionForm" class="grid grid-cols-1 gap-4">
    <div>
      <label class="block text-sm font-medium mb-1">Assignment</label>
      <div id="assignmentSelectContainer"></div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Student ID</label>
      <input type="number" name="studentId" required class="w-full rounded-md border border-gray-300 px-3 py-2" />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Student Name</label>
      <input type="text" name="studentName" required class="w-full rounded-md border border-gray-300 px-3 py-2" />
    </div>

    <div>
      <p class="text-sm text-gray-600">Submitted At: (will be set to current time automatically)</p>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Content</label>
      <textarea name="content" class="w-full rounded-md border border-gray-300 px-3 py-2" rows="4"></textarea>
    </div>

    <div class="flex gap-2 justify-end">
      <button type="reset" class="btn">ล้างค่า</button>
      <button type="submit" class="btn primary">ส่งงาน</button>
    </div>
  </form>

  <pre id="submissionResult" style="margin-top:12px;background:#fafafa;padding:10px;border-radius:8px;border:1px solid #eee"></pre>
</div>
