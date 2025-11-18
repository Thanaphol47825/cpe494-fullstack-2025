<div class="fixed top-8 right-4 z-50">
    <div class="bg-white rounded-xl shadow-lg p-3 border border-slate-200">
    <div class="flex flex-col gap-2">
        <!-- Role Selection -->
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
        
        <!-- User ID Input -->
        <div class="flex items-center gap-2">
        <label for="user-id-input" class="text-sm font-medium text-slate-600">User ID:</label>
        <input 
            type="number" 
            id="user-id-input" 
            placeholder="Enter ID" 
            class="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onchange="setUserId(this.value)"
        />
        <span id="current-user-id-display" class="text-xs font-semibold text-blue-600"></span>
        </div>
    </div>
    </div>
</div>