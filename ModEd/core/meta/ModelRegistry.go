package meta

import (
	"reflect"
	"strings"
)

// Global model registry for foreign key lookups
var ModelRegistry = map[string]interface{}{}

func RegisterModel(name string, slicePtr interface{}) {
	ModelRegistry[name] = slicePtr
}

func AutoRegisterModels(models []interface{}) {
	for _, model := range models {
		modelType := reflect.TypeOf(model)
		if modelType.Kind() == reflect.Ptr {
			modelType = modelType.Elem()
		}

		fullName := modelType.Name()

		sliceType := reflect.SliceOf(modelType)
		slicePtr := reflect.New(sliceType).Interface()

		ModelRegistry[fullName] = slicePtr

		ModelRegistry[strings.ToLower(fullName)] = slicePtr
	}
}
