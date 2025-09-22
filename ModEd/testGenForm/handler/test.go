package main

import (
	"ModEd/core"
	"ModEd/testGenForm/model"
	"net/http"

	"github.com/hoisie/mustache"
)

func CompanyPageHandler(w http.ResponseWriter, r *http.Request) {
	action := "{{ RootURL }}/test/testGenForm"
	class := "grid grid-cols-1 md:grid-cols-2 gap-4"
	formHTML := core.GenFormFromModel(model.Field{}, "UserForm", "POST", action, class)
	tableHTML := core.GenTableFromModels([]model.Field{
		{Name: "Field1", Surname: "Sur1"},
		{Name: "Field2", Surname: "Sur2"},
	})

	data := map[string]interface{}{
		"formHTML":  formHTML,
		"tableHTML": tableHTML,
	}

	rendered := mustache.RenderFile("testGenForm/view/test.tpl", data)
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(rendered))
}

func main() {
	http.HandleFunc("/testGenForm", CompanyPageHandler)
	http.ListenAndServe(":8080", nil)
}
