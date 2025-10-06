{{#IsLink}}
  <td><a href="{{Href}}" rel="{{Key}}">{{ Value }}</a></td>
{{/IsLink}}
{{^IsLink}}
  <td>{{ Value }}</td>
{{/IsLink}}
