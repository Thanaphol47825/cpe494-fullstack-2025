<div class="fixed top-8 right-4 z-50">
    <div class="bg-white rounded-xl shadow-lg p-3 border border-slate-200">
    <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-slate-600">Role:</span>
        <div class="flex gap-1">
        <button onclick="setRole('Student')" id="role-student" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-blue-500 hover:text-white">
            Student
        </button>
        <button onclick="setRole('Instructor')" id="role-instructor" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white">
            Instructor
        </button>
        <button onclick="setRole('Admin')" id="role-admin" class="role-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-purple-500 hover:text-white">
            Admin
        </button>
        </div>
        <span id="current-role-display" class="ml-2 text-xs font-semibold text-emerald-600"></span>
    </div>
    </div>
</div>