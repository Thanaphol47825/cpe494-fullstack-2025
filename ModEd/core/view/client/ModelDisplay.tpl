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
    <!-- header -->
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h1 class="text-5xl font-extrabold text-slate-800 mb-4">
        <span
          class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
          >{{ page_title }}</span
        >
      </h1>
      <div
        class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6 rounded-full"
      ></div>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        {{ page_description }}
      </p>
    </div>

    <!-- actions -->
    <div class="max-w-6xl mx-auto mb-8">
      <div
        class="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6"
      >
        <div
          class="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <div class="flex items-center gap-3">{{{ HeaderContent }}}</div>
          {{^ShowBackButton}}
          <a
            routerLink="{{ create_link }}"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New {{ model_name }}
          </a>
          {{/ShowBackButton}}
        </div>
      </div>
    </div>

    <!-- main content -->
    <div class="max-w-6xl mx-auto">
      <div
        class="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
      >
        <div id="main-content-container" class="p-6">{{{ MainContent }}}</div>
      </div>
    </div>

    <!-- footer actions -->
    <div class="text-center mt-12">
      {{#ShowBackButton}}
      <a
        href="#"
        data-back-button
        data-route="{{ BackButtonRoute }}"
        class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-600 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/50"
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
          ></path>
        </svg>
        {{ BackButtonText }}
      </a>
      {{/ShowBackButton}}
    </div>
  </div>
</div>
