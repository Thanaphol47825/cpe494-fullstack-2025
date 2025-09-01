package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestInstructorController(t *testing.T) {
	curId := 5
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"name":          "Computer Engineering 2565",
			"start_year":    2565,
			"end_year":      2569,
			"department_id": 1,
			"program_type":  0,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Curriculum/createCurriculum", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Curriculum/getCurriculums", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		id := "5"
		utils.RequestTest(t, http.MethodGet, "/curriculum/Curriculum/getCurriculum/"+id, nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"id":   curId,
			"name": "Mechanical Engineering 2565",
			// "start_year":      2565,
			// "end_year":        2569,
			"department_id": 2,
			// "program_type":    0,
			// "created_at":      "2024-01-01T08:00:00Z",
			// "updated_at":      "2024-01-01T08:00:00Z",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Curriculum/updateCurriculum", payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Curriculum/deleteCurriculum/"+strconv.Itoa(curId), nil)
	})
}
