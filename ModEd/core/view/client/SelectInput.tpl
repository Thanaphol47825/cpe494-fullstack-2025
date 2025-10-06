<div class="selectItem">
    <label for="{{id}}" class="block text-sm font-medium text-gray-700">{{label}}</label>
    <select id="{{id}}" name="{{name}}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
        {{#options}}
        <option value="{{value}}">{{label}}</option>
        {{/options}}
    </select>
</div>