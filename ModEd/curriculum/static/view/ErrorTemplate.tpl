<div class="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 flex items-center justify-center p-6">
  <div class="max-w-2xl w-full">
    <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <!-- Error Header -->
      <div class="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">{{errorTitle}}</h1>
        <p class="text-red-100 text-lg">{{errorType}}</p>
      </div>

      <!-- Error Content -->
      <div class="p-8">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <h3 class="text-red-800 font-semibold mb-1">Error Details</h3>
              <p class="text-red-700 text-sm">{{errorMessage}}</p>
            </div>
          </div>
        </div>

        {{#technicalDetails}}
        <div class="bg-slate-50 border border-slate-200 p-4 mb-6 rounded-lg">
          <h4 class="text-slate-700 font-semibold mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            Technical Details
          </h4>
          <pre class="text-xs text-slate-600 font-mono bg-white p-3 rounded border border-slate-200 overflow-x-auto">{{technicalDetails}}</pre>
        </div>
        {{/technicalDetails}}

        <!-- Suggestions -->
        {{#hasSuggestions}}
        <div class="mb-6">
          <h4 class="text-slate-700 font-semibold mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Suggestions
          </h4>
          <ul class="space-y-2">
            {{#suggestions}}
            <li class="flex items-start text-slate-600">
              <svg class="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{.}}</span>
            </li>
            {{/suggestions}}
          </ul>
        </div>
        {{/hasSuggestions}}

        <!-- Action Buttons -->
        <div class="flex justify-center pt-4">
          <button routerLink="{{backRoute}}" class="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="text-center mt-6 text-slate-600">
      <p class="text-sm">
        If this problem persists, please contact the system administrator.
      </p>
      {{#timestamp}}
      <p class="text-xs text-slate-500 mt-2">Error occurred at: {{timestamp}}</p>
      {{/timestamp}}
    </div>
  </div>
</div>
