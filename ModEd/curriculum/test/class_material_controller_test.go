package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestClassMaterialController(t *testing.T) {
	classMaterialId := 1
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"class_id":  1,
			"file_name": "Week1_Syllabus.pdf",
			"file_path": "/materials/class_1/Week1_Syllabus.pdf",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/ClassMaterial/createClassMaterial", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/ClassMaterial/getClassMaterials", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		id := "1"
		utils.RequestTest(t, http.MethodGet, "/curriculum/ClassMaterial/getClassMaterial/"+id, nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"id": classMaterialId,
			"class_id":  1,
			"file_name": "Week1_Syllabus.pdf",
			"file_path": "/materials/class_1/Week1_Syllabus.pdf",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/ClassMaterial/updateClassMaterial", payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/ClassMaterial/deleteClassMaterial/"+strconv.Itoa(classMaterialId), nil)
	})
}
