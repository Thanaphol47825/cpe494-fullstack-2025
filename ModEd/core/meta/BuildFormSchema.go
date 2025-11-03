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

		// Handle embedded structs (anonymous fields) - recursively process their fields
		if field.Anonymous && field.Type.Kind() == reflect.Struct {
			// Create a temporary instance to get the embedded struct's fields
			embeddedVal := reflect.New(field.Type).Elem()
			embeddedFields, err := buildStructFields(db, embeddedVal)
			if err == nil {
				fields = append(fields, embeddedFields...)
			}
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
			Name:         jsonName,
			Label:        getFormValue(formConfig, "label", jsonName),
			Placeholder:  getFormValue(formConfig, "placeholder", ""),
			Type:         getFormValue(formConfig, "type", defaultInputType(fieldTypeName)),
			Format:       getFormValue(formConfig, "format", ""),
			Required:     getFormValue(formConfig, "required", "") == "true",
			TableDisplay: getFormValue(formConfig, "display", "true") == "true",
			APIUrl:       getFormValue(formConfig, "apiurl", ""),
		}

		// Handle select fields with foreign key relationships or enum types
		if formField.Type == "select" {
			fkModel := getFormValue(formConfig, "fk", "")
			if fkModel != "" {
				data, err := buildSelectData(db, fkModel, formConfig)
				if err == nil {
					formField.Data = data
				}
			} else {
				// Check if this is an enum type
				data := buildEnumData(field.Type)
				if len(data) > 0 {
					formField.Data = data
				}
			}
		}

		fields = append(fields, formField)
	}

	return fields, nil
}

// buildEnumData builds select options from enum type constants
func buildEnumData(fieldType reflect.Type) []map[string]interface{} {
	var data []map[string]interface{}
	
	// Handle enum types that are string-based (custom type aliases like type LeaveType string)
	// Check both the underlying kind and the type name
	underlyingKind := fieldType.Kind()
	enumTypeName := fieldType.Name()
	
	// For string-based enum types (type EnumName string)
	if underlyingKind == reflect.String && enumTypeName != "" && enumTypeName != "string" {
		// Check for known enum types
		switch enumTypeName {
		case "LeaveType":
			data = []map[string]interface{}{
				{"label": "Sick", "value": "Sick"},
				{"label": "Vacation", "value": "Vacation"},
				{"label": "Personal", "value": "Personal"},
				{"label": "Maternity", "value": "Maternity"},
				{"label": "Other", "value": "Other"},
			}
		}
	}
	
	return data
}

// buildStructFields recursively processes fields from an embedded struct
func buildStructFields(db *gorm.DB, val reflect.Value) ([]FormField, error) {
	typ := val.Type()
	var fields []FormField

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)

		// Skip embedded BaseModel
		if field.Name == "BaseModel" {
			continue
		}

		// Skip other embedded structs to avoid infinite recursion
		if field.Anonymous && field.Type.Kind() == reflect.Struct {
			if field.Name != "BaseModel" {
				// Recursively process embedded structs (but skip BaseModel to avoid recursion)
				embeddedVal := reflect.New(field.Type).Elem()
				embeddedFields, err := buildStructFields(db, embeddedVal)
				if err == nil {
					fields = append(fields, embeddedFields...)
				}
			}
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
			Name:         jsonName,
			Label:        getFormValue(formConfig, "label", jsonName),
			Placeholder:  getFormValue(formConfig, "placeholder", ""),
			Type:         getFormValue(formConfig, "type", defaultInputType(fieldTypeName)),
			Format:       getFormValue(formConfig, "format", ""),
			Required:     getFormValue(formConfig, "required", "") == "true",
			TableDisplay: getFormValue(formConfig, "display", "true") == "true",
			APIUrl:       getFormValue(formConfig, "apiurl", ""),
		}

		// Handle select fields with foreign key relationships or enum types
		if formField.Type == "select" {
			fkModel := getFormValue(formConfig, "fk", "")
			if fkModel != "" {
				data, err := buildSelectData(db, fkModel, formConfig)
				if err == nil {
					formField.Data = data
				}
			} else {
				// Check if this is an enum type
				data := buildEnumData(field.Type)
				if len(data) > 0 {
					formField.Data = data
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
