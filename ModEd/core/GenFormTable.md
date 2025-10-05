# Auto Generate Form, Table

## Example Form

    Call function SetAPIform(path, model) in your controller 

    ** test api -> http://localhost:8080/api/modelmeta/path ** 

    In .tpl file 
    
    1.import FormRender.js 
    2.get data from api 
    3.map form 
    4.formRender(engine, schema, (class or id)) 


    <html>

        <head>
        <title>{{ title }}</title>
        <script src="{{ RootURL }}/core/static/js/RouterLinks.js"></script>
        <script src="{{ RootURL }}/core/static/js/TemplateEngine.js"></script>
        <script src="{{ RootURL }}/core/static/js/mustache.min.js"></script>
        <script src="{{ RootURL }}/core/static/js/DOMObject.js"></script>
        <script src="{{ RootURL }}/core/static/js/BaseModuleApplication.js"></script>
        <script src="{{ RootURL }}/core/static/js/FormRender.js"></script>

        <link rel="stylesheet" type="text/css" href="{{ RootURL }}/core/static/css/Style.css" />
            <script>
                let RootURL = "{{ RootURL }}";
                let modules = {{{modules}}};

                let engine = new TemplateEngine();
                document.addEventListener("DOMContentLoaded", async () => {
                await engine.render();

                const res = await fetch('/api/modelmeta/field');
                const meta = await res.json();

                const schema = (meta || []).map(f => ({
                    type:     f.type || "text",
                    name:     f.name,
                    label:    f.label || f.name,
                }));

                const formRender = new FormRender(engine, schema, ".Form1");
                const form = await formRender.render();

                const container = document.getElementById("MainContainer");
                });
            </script>
        </head>

        <body>
            <h1>{{ title }}</h1>
            <div id="MainContainer"></div>
            <div class="Form1"></div>
        </body>

    </html>
