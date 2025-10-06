<div class="selectInput">
  <label for="{{Id}}" class="block text-sm font-medium text-gray-700">{{Label}}</label>
  <select id="{{Id}}" name="{{Name}}" class="form-select" {{#Required}}required{{/Required}}>
    <option value="" disabled selected>Select {{Label}}</option>
    {{#options}}
      <option value="{{value}}">{{label}}</option>
    {{/options}}
  </select>
</div>