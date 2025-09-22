package core

import (
	"fmt"
	"reflect"
    "strings"
)

type FieldMeta struct {
	Name  string
	Type  string
	Label string
}

func GetModelMetadata(model interface{}) []FieldMeta {
	val := reflect.ValueOf(model)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	typ := val.Type()
	var fields []FieldMeta
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		label := field.Tag.Get("label")
		fields = append(fields, FieldMeta{
			Name:  field.Name,
			Type:  field.Type.Name(),
			Label: label,
		})
	}
	return fields
}

func GenFormFromModel(model interface{}, id string, method string, action string, class string) string {
	fields := GetModelMetadata(model)
	html := fmt.Sprintf(`<form id="%s" method="%s" action="%s" class="%s">`, id, method, action, class)
	html += "\n"
	for _, f := range fields {
		if f.Name == "BaseModel" {
			continue
		}
		label := f.Label
		if label == "" {
			label = f.Name
		}
		html += "<div>\n"
		html += fmt.Sprintf(`<label class="block text-sm font-medium mb-1">%s: <input name="%s" type="text"></label><br>`, label, f.Name)
		html += "\n</div>\n"
	}
	html += "</form>"
	// fmt.Println(html)
	return html
}

func GenTableFromModels(models interface{}) string {
	val := reflect.ValueOf(models)
	if val.Kind() != reflect.Slice {
		return "<table><tr><td>Input must be a slice of struct</td></tr></table>"
	}
	if val.Len() == 0 {
		return "<table><tr><td>No data</td></tr></table>"
	}

	indirect := func(v reflect.Value) reflect.Value {
		for v.IsValid() && v.Kind() == reflect.Pointer {
			if v.IsNil() {
				return reflect.Zero(v.Type().Elem())
			}
			v = v.Elem()
		}
		return v
	}

	first := indirect(val.Index(0))
	if !first.IsValid() || first.Kind() != reflect.Struct {
		return "<table><tr><td>Slice elements must be struct or *struct</td></tr></table>"
	}

	fields := GetModelMetadata(first.Interface())

	var b strings.Builder
	b.WriteString("<table border='1'>\n<tr>")

	for _, f := range fields {
		if f.Name == "BaseModel" {
			continue
		}
		label := f.Label
		if label == "" {
			label = f.Name
		}
		fmt.Fprintf(&b, "<th>%s</th>", label)
	}
	b.WriteString("</tr>\n")

	for i := 0; i < val.Len(); i++ {
		row := indirect(val.Index(i)) 
		b.WriteString("<tr>")
		for _, f := range fields {
			if f.Name == "BaseModel" {
				continue
			}

			var cell any = ""
			if row.IsValid() && row.Kind() == reflect.Struct {
				fv := row.FieldByName(f.Name)
				if fv.IsValid() {
					fv = indirect(fv)
					if fv.IsValid() && fv.CanInterface() {
						cell = fv.Interface()
					}
				}
			}
			fmt.Fprintf(&b, "<td>%v</td>", cell)
		}
		b.WriteString("</tr>\n")
	}

	b.WriteString("</table>")
	return b.String()
}

