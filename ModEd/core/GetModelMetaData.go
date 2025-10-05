package core

import (
	"reflect"
	"github.com/gofiber/fiber/v2"

)

type FieldMeta struct {
	Name  string `json:"name"`
	Type  string `json:"type"`
	Label string `json:"label"`
}

func defaultInputType(goType string) string {
	switch goType {
	case "int", "int8", "int16", "int32", "int64",
		"uint", "uint8", "uint16", "uint32", "uint64",
		"float32", "float64":
		return "number"
	case "bool":
		return "checkbox"
	}
	return "text"
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

		if field.Name == "BaseModel" {
			continue
		}

		//  tag
		jsonName := field.Tag.Get("json")
		if jsonName == "" || jsonName == "-" {
			jsonName = field.Name
		}
		formType := field.Tag.Get("form") 
		label := field.Tag.Get("label")
		if formType == "" {
			formType = defaultInputType(field.Type.Name())
		} else if formType == "-" {
			continue
		}

		if label == "" {
			label = jsonName
		}

		fields = append(fields, FieldMeta{
			Name:     jsonName,
			Type:     formType,
			Label:    label,
		})
	}
	return fields
}

func (application *ModEdApplication) SetAPIform(path string, model interface{}) {
	application.Application.Get("/api/modelmeta/" + path, func(c *fiber.Ctx) error {
		meta := GetModelMetadata(model)
		return c.JSON(meta)
	})
}
