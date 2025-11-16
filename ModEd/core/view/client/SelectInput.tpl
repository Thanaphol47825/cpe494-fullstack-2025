<div class="mb-4">
  <label for="{{Id}}" class="block text-sm font-medium text-gray-700 mb-2">{{Label}}
    <span class="text-red-500">{{#required}}*{{/required}}</span>

  </label>
  <select id="{{Id}}" name="{{Name}}"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    {{#Required}}required{{/Required}}>
    <option value="">Select {{Label}}</option>
    {{#options}}
    <option value="{{value}}" {{#selected}}selected{{/selected}}>{{label}}</option>
    {{/options}}
  </select>
</div>