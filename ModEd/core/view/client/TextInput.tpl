<div class="mb-4">
  <label for="{{ id }}" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}
    <span class="text-red-500">{{#required}}*{{/required}}</span>
  </label>
  <input id="{{ id }}" name="{{ name }}" type="{{ type }}" rel="input"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    {{#placeholder}}placeholder="{{ placeholder }}" {{/placeholder}} {{#required}}required{{/required}} />
</div>