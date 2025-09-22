package core

import (
	"fmt"
	"reflect"
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

	elemType := val.Index(0).Interface()
	fields := GetModelMetadata(elemType)

	html := "<table border='1'>\n<tr>"
	for _, f := range fields {
		if f.Name == "BaseModel" {
			continue
		}
		label := f.Label
		if label == "" {
			label = f.Name
		}
		html += fmt.Sprintf("<th>%s</th>", label)
	}
	html += "</tr>\n"

	for i := 0; i < val.Len(); i++ {
		row := val.Index(i)
		html += "<tr>"
		for _, f := range fields {
			if f.Name == "BaseModel" {
				continue
			}
			fieldVal := row.FieldByName(f.Name)
			html += fmt.Sprintf("<td>%v</td>", fieldVal.Interface())
		}
		html += "</tr>\n"
	}
	html += "</table>"
	// fmt.Println(html)
	return html
}
