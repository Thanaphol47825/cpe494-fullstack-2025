<div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">{{label}}
        <span class="text-red-500">{{#required}}*{{/required}}</span>
    </label>
    <div class="space-y-2">
        {{#options}}
        <label class="flex items-center">
            <input type="radio" name="{{name}}" value="{{value}}" rel="radio"
                class="mr-2 text-blue-600 focus:ring-blue-500" {{#required}}required{{/required}} />
            <span class="text-sm text-gray-700">{{label}}</span>
        </label>
        {{/options}}
    </div>
</div>