<div class="mb-4">
    <label for="{{id}}" class="block text-sm font-medium text-gray-700 mb-2">{{label}}
        <span class="text-red-500">{{#required}}*{{/required}}</span>
    </label>
    <textarea id="{{id}}" name="{{name}}" placeholder="{{placeholder}}" rel="textarea" rows="{{rows}}"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        {{#required}}required{{/required}}>{{Value}}</textarea>
</div>