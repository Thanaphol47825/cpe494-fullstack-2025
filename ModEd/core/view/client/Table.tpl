<div class="form-container">
  <h2 style="font-weight:600; font-size:1.2rem; margin-bottom:12px;">{{ Title }}</h2>

  <table class="table-blue">
    <thead>
      <tr>
        {{#Columns}}
          <th>{{ Label }}</th>
        {{/Columns}}
      </tr>
    </thead>

    <tbody rel="body"></tbody>

    {{! 
    <tbody>
      {{#Rows}}
        <tr>
          {{#Columns}}
            {{#IsLink}}
              <td><a href="{{Href}}" rel="{{Key}}">{{ Value }}</a></td>
            {{/IsLink}}
            {{^IsLink}}
              <td>{{ Value }}</td>
            {{/IsLink}}
          {{/Columns}}
        </tr>
      {{/Rows}}
      {{^Rows}}
        <tr>
          <td colspan="{{Colspan}}" class="ui-table-empty">No data available</td>
        </tr>
      {{/Rows}}
    </tbody>
    }}
  </table>
</div>
