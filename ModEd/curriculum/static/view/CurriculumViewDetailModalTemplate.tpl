<div id="view-detail-modal-{{modalId}}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
    <!-- Modal Header -->
    <div class="bg-gradient-to-r {{gradientFrom}} {{gradientTo}} rounded-t-3xl px-8 py-6 sticky top-0 z-10">
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
        <button onclick="closeViewDetailModal('{{modalId}}')" class="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-xl">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Modal Body -->
    <div class="p-8">
      <!-- Main Content Container -->
      <div id="view-detail-content-{{modalId}}" class="space-y-6">
        <!-- Content will be rendered here -->
      </div>
      
      <!-- Loading State -->
      <div id="loading-{{modalId}}" class="hidden text-center py-12">
        <div class="inline-flex flex-col items-center gap-4">
          <svg class="animate-spin w-8 h-8 text-{{gradientFrom}}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span class="text-gray-600 font-medium">Loading details...</span>
        </div>
      </div>

      <!-- Error Message -->
      <div id="error-message-{{modalId}}" class="hidden bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span id="error-text-{{modalId}}" class="text-red-700 text-sm"></span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="bg-gray-50 rounded-b-3xl px-8 py-6 sticky bottom-0">
      <div class="flex justify-center">
        <button type="button" onclick="closeViewDetailModal('{{modalId}}')" 
                class="px-8 py-3 bg-gradient-to-r {{gradientFrom}} {{gradientTo}} hover:from-{{gradientFromHover}} hover:to-{{gradientToHover}} text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Close
          </span>
        </button>
      </div>
    </div>
  </div>
</div>
