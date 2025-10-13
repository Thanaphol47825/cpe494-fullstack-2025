<div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-inner">
  <svg
    class="w-16 h-16 {{ icon_color }} mb-4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 6.75a3 3 0 110 6 3 3 0 010-6zm0 9c-4.5 0-6.75 2.25-6.75 3v.75h13.5V18c0-.75-2.25-3-6.75-3z"
    />
  </svg>
  <h2 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h2>
  <p class="text-gray-500 mb-6">{{ description }}</p>
  {{#button_text}}
  <a
    href="{{ button_link }}"
    class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-2 rounded-lg shadow hover:shadow-md transition"
  >
    {{ button_text }}
  </a>
  {{/button_text}}
</div>
