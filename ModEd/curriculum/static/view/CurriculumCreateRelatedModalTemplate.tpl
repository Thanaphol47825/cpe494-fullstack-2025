<div id="create-related-modal-{{modalId}}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
    
    <div class="bg-gradient-to-r {{gradientFrom}} {{gradientTo}} rounded-t-3xl px-8 py-6 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{{icon}}}"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-white">{{title}}</h3>
            <p class="text-white/80 text-sm">{{subtitle}}</p>
          </div>
        </div>
        <button onclick="closeCreateRelatedModal('{{modalId}}')" class="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-xl">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="p-8 overflow-y-auto custom-scrollbar">
      <form id="create-related-form-{{modalId}}" class="space-y-6">
        
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Course</label>
            <div id="course-select-container-{{modalId}}">
                </div>
        </div>

        <hr class="border-gray-100">

        <div class="space-y-4">
            <div class="flex justify-between items-center">
                <label class="block text-sm font-medium text-gray-700">Skills</label>
                <button type="button" id="btn-add-skill-{{modalId}}" class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Add Another Skill
                </button>
            </div>
            
            <div id="skills-list-container-{{modalId}}" class="space-y-3">
                </div>
        </div>
        
        <div id="loading-{{modalId}}" class="hidden text-center py-4">
          <div class="inline-flex items-center gap-3 text-gray-600">
            <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Processing...
          </div>
        </div>

        <div id="error-message-{{modalId}}" class="hidden bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <span id="error-text-{{modalId}}" class="text-red-700 text-sm"></span>
          </div>
        </div>

        <div id="success-message-{{modalId}}" class="hidden bg-green-50 border border-green-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <span id="success-text-{{modalId}}" class="text-green-700 text-sm"></span>
          </div>
        </div>
      </form>
    </div>

    <div class="bg-gray-50 rounded-b-3xl px-8 py-6 flex-shrink-0">
      <div class="flex justify-end gap-3">
        <button type="button" onclick="closeCreateRelatedModal('{{modalId}}')" 
                class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200">
          Cancel
        </button>
        <button type="button" id="btn-submit-{{modalId}}"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
           Submit
        </button>
      </div>
    </div>
  </div>
</div>