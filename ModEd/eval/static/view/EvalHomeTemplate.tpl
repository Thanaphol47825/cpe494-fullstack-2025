<div
  class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 animate-pulse"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-15 animate-pulse delay-1000"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-10 animate-pulse delay-2000"
    ></div>
  </div>

  <div class="relative z-10 max-w-7xl mx-auto px-6 py-12">
    <div class="text-center mb-16">
      <div
        class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl mb-6 shadow-2xl"
      >
        <svg
          class="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 class="text-5xl font-extrabold text-slate-800 mb-4">
        <span
          class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
          >Evaluation</span
        >
      </h1>
      <div
        class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 rounded-full"
      ></div>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Manage assignments, quizzes, submissions, and evaluations
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {{{ cards_html }}}
    </div>

    <div class="text-center">
      <a
        routerLink="/"
        class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Return to ModEd Home
      </a>
    </div>
  </div>
</div>
