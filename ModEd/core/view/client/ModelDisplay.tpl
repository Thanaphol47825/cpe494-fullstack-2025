<div
  class="min-h-screen bg-gradient-to-br from-amber-50 {{
    page_color
  }} relative overflow-hidden"
>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br {{
        page_color
      }} rounded-full opacity-20"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br {{
        page_color
      }} rounded-full opacity-15"
    ></div>
    <div
      class="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br {{
        page_color
      }} rounded-full opacity-10"
    ></div>
  </div>

  <div class="relative z-10 container mx-auto px-4 py-12">
    <!-- header -->
    <div class="text-center mb-12">
      <div
        class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r {{
          page_color
        }} rounded-2xl shadow-lg mb-6"
      >
        <svg
          class="w-8 h-8 text-white"
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
      <h1
        class="text-4xl font-bold bg-gradient-to-r gray-900 bg-clip-text text-transparent mb-4"
      >
        {{ page_title }}
      </h1>
      <div class="w-24 h-1 bg-gradient-to-r gray-900 mb-4 rounded-full"></div>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        {{ page_description }}
      </p>
    </div>

    <!-- actions -->
    <div class="max-w-6xl mx-auto mb-8">
      <div
        class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
      >
        <div
          class="flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253"
              />
            </svg>
            <span class="text-gray-700 font-medium"
              >{{ model_name }} Management</span
            >
          </div>
          <a
            routerLink="{{ create_link }}"
            class="bg-gradient-to-r {{
              page_color
            }} text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
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
        </div>
      </div>
    </div>

    <!-- table -->
    <div class="max-w-6xl mx-auto">
      <div
        class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
      >
        <div id="table-container" class="p-6"></div>
      </div>
    </div>
  </div>
</div>
