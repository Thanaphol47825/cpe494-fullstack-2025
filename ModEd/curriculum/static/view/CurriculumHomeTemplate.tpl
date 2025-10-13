<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
  <!-- Background Academic Elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 animate-pulse"></div>
    <div class="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
  </div>
  
  <div class="relative z-10 max-w-7xl mx-auto px-6 py-12">
    <!-- Academic Header -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl mb-6 shadow-2xl">
        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
        </svg>
      </div>
      <h1 class="text-5xl font-extrabold text-slate-800 mb-4">
        <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Curriculum</span>
      </h1>
      <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 rounded-full"></div>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Curriculum Module for organizing curriculum, courses, classes, class materials, and course plans
      </p>
    </div>

    <!-- Academic Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {{#models}}
      <div class="curriculum-card bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-{{borderColor}}-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br {{color}} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
        
        <!-- Icon Container -->
        <div class="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br {{color}} rounded-2xl mb-5 shadow-lg group-hover:rotate-6 transition-transform duration-300">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {{{icon}}}
          </svg>
        </div>
        
        <!-- Content -->
        <div class="relative z-10">
          <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors">{{label}}</h3>
          <p class="text-slate-600 mb-6 text-sm leading-relaxed">{{description}}</p>
          
          <!-- Action Buttons -->
          <div class="space-y-3">
            <button routerLink="{{route}}" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Browse {{label}}
            </button>
            <button routerLink="{{route}}/create" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r {{color}} text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create New
            </button>
          </div>
        </div>
      </div>
      {{/models}}
    </div>

    <!-- Academic Footer -->
    <div class="text-center">
      <a routerLink="/" class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Return to ModEd Home
      </a>
    </div>
  </div>
</div>
