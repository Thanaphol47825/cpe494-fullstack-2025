package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestClassController(t *testing.T) {
	classId := 1
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"course_id": 1,
			"section":   1,
			"schedule":  "2024-05-15T09:00:00Z",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Class/createClass", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Class/getClasses", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		id := "1"
		utils.RequestTest(t, http.MethodGet, "/curriculum/Class/getClass/"+id, nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"id":        classId,
			"course_id": 1,
			"section":   1,
			"schedule":  "2024-05-15T09:00:00Z",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Class/updateClass", payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Class/deleteClass/"+strconv.Itoa(classId), nil)
	})
}
