<div id="{{sectionId}}-section" class="hidden bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900">{{sectionTitle}}</h2>
        <button id="add-{{sectionId}}-btn" class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add
        </button>
    </div>

    <!-- List -->
    <div id="{{sectionId}}-list">
        <div id="{{sectionId}}-empty" class="text-center py-8 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h6m-6 4h6m-2 4h2"></path>
            </svg>
            <p class="text-sm">No {{emptyMessage}} added yet</p>
            <button id="add-first-{{sectionId}}-btn" class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Add your first {{singularName}}
            </button>
        </div>
        <!-- Items will be added here -->
    </div>
</div>