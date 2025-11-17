<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">{{modalTitle}}</h2>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
    </div>
    <div class="modal-body">
      {{#sections}}
      <div class="modal-section">
        <h3 class="modal-section-title">{{sectionTitle}}</h3>
        <div class="modal-grid{{#gridClass}}-{{gridClass}}{{/gridClass}}">
          {{#fields}}
          <div{{#fullWidth}} class="modal-grid-full"{{/fullWidth}}>
            <span class="modal-label">{{label}}:</span> 
            {{#isLink}}
              {{#hasValue}}<a href="{{value}}" target="_blank" class="modal-link">{{value}}</a>{{/hasValue}}
              {{^hasValue}}N/A{{/hasValue}}
            {{/isLink}}
            {{^isLink}}{{value}}{{/isLink}}
          </div>
          {{/fields}}
        </div>
      </div>
      {{/sections}}
    </div>
    <div class="modal-footer">
      <button onclick="this.closest('.modal-overlay').remove()" class="modal-btn">Close</button>
    </div>
  </div>
</div>
