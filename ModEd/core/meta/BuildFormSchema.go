package meta

import (
	"fmt"
	"reflect"
	"strings"

	"gorm.io/gorm"
)

func BuildFormSchema(db *gorm.DB, model interface{}) ([]FormField, error) {
	val := reflect.ValueOf(model)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	typ := val.Type()
	var fields []FormField

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)

		// Skip embedded BaseModel
		if field.Name == "BaseModel" {
			continue
		}

		// Parse form tag
		formTag := field.Tag.Get("form")
		if formTag == "-" {
			continue // Skip this field
		}

		// Get JSON name
		jsonName := field.Tag.Get("json")
		if jsonName == "" || jsonName == "-" {
			jsonName = strings.ToLower(field.Name)
		}
		jsonName = cleanJSONName(jsonName)

		// Get the actual type name
		fieldTypeName := field.Type.Name()
		if field.Type.Kind() == reflect.Ptr {
			fieldTypeName = field.Type.Elem().Name()
		}

		// Parse form tag into key-value pairs
		formConfig := parseFormTag(formTag)

		// Build FormField
		formField := FormField{
			Name:        jsonName,
			Label:       getFormValue(formConfig, "label", jsonName),
			Placeholder: getFormValue(formConfig, "placeholder", ""),
			Type:        getFormValue(formConfig, "type", defaultInputType(fieldTypeName)),
			Format:      getFormValue(formConfig, "format", ""),
		}

		// Handle select fields with foreign key relationships
		if formField.Type == "select" {
			fkModel := getFormValue(formConfig, "fk", "")
			if fkModel != "" {
				data, err := buildSelectData(db, fkModel, formConfig)
				if err == nil {
					fmt.Println("fkModel: ", fkModel)
					for _, item := range data {
						fmt.Println(item)
					}
					formField.Data = data
				} else {
					fmt.Println(err.Error())
				}
			}
		}

		fields = append(fields, formField)
	}

	return fields, nil
}

// buildSelectData builds select options from foreign key model
func buildSelectData(db *gorm.DB, modelName string, formConfig map[string]string) ([]map[string]interface{}, error) {
	// Get model slice from registry
	modelSlicePtr, exists := ModelRegistry[modelName]
	if !exists {
		return nil, fmt.Errorf("model %s not found in registry", modelName)
	}

	// Query all records
	result := db.Find(modelSlicePtr)
	if result.Error != nil {
		return nil, result.Error
	}

	// Use reflection to extract data
	sliceVal := reflect.ValueOf(modelSlicePtr).Elem()
	var data []map[string]interface{}

	labelField := getFormValue(formConfig, "fklabel", "ID") // Default to "ID" field

	for i := 0; i < sliceVal.Len(); i++ {
		item := sliceVal.Index(i)

		// Get ID field (assumed to be "ID")
		idField := item.FieldByName("ID")
		if !idField.IsValid() {
			continue
		}

		// Get label field (Name or custom field)
		labelFieldVal := item.FieldByName(labelField)
		if !labelFieldVal.IsValid() {
			labelFieldVal = item.FieldByName("Name") // Fallback to Name
		}
		if !labelFieldVal.IsValid() {
			continue
		}

		data = append(data, map[string]interface{}{
			"label": labelFieldVal.String(),
			"value": idField.Interface(),
		})
	}

	return data, nil
}
