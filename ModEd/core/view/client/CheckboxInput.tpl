<div class="mb-4">
    <label class="flex items-center">
        <input 
            type="checkbox" 
            id="{{id}}" 
            name="{{name}}" 
            rel="checkbox"
            class="mr-2 text-blue-600 focus:ring-blue-500 rounded"
            {{#required}}required{{/required}}
        />
        <span class="text-sm font-medium text-gray-700">{{label}}</span>
    </label>
</div>