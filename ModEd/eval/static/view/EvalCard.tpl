<div
  class="menu-card bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-6 hover:border-{{box_color}}-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
>
  <div
    class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br {{box_color}} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"
  ></div>

  <!-- Icon Container -->
  <div
    class="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br {{icon_color}} rounded-2xl mb-5 shadow-lg group-hover:rotate-6 transition-transform duration-300"
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
        d="{{icon_path}}"
      />
    </svg>
  </div>

  <!-- Content -->
  <div class="relative z-10">
    <h3
      class="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors"
    >
      {{card_title}}
    </h3>
    <p class="text-slate-600 mb-6 text-sm leading-relaxed">
      {{card_description}}
    </p>

    <!-- Action Buttons -->
    <div class="space-y-3">
      {{#create_button}}
      <button
        routerLink="{{create_link}}"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 {{create_color}} text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg"
      >
        <svg
          class="w-4 h-4"
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
        {{create_text}}
      </button>
      {{/create_button}}
      
      {{#manage_button}}
      <button
        routerLink="{{manage_link}}"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 text-sm font-medium group-hover:shadow-lg"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        {{manage_text}}
      </button>
      {{/manage_button}}
    </div>
  </div>
</div>
