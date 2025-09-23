# Auto Generate Form, Table

## Example Form, Table

    demo -> your model

    mapper := CSVMapper[demo.Field]{Path: "/workspace/ModEd/core/demo/field.csv"}
    fields := mapper.Deserialize() 

    tableHTML := GenTableFromModels(fields)

    formHTML := GenFormFromModel(demo.Field{}, "UserForm", "POST", action, class)


### Render 
    rendered := tmpl.Render(map[string]any{
        "formHTML":  formHTML, 
        "tableHTML": tableHTML, 
    })


### Import to view 
    
    <body>
        <h1>{{ title }}</h1>
        <div id="MainContainer"></div>
        {{{formHTML}}}
        {{{tableHTML}}}
    </body>
