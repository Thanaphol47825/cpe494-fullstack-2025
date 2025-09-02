package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestInternshipCriteriaController(t *testing.T) {
	id := 1
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"title":                     "Communication Skills Assessment",
			"description":               "Evaluate student's ability to communicate effectively with team members and supervisors",
			"score":                     85,
			"internship_application_id": 1,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/InternshipCriteria/create", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipCriteria/GetInternshipCriterias", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipCriteria/"+strconv.Itoa(id), nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"title":                     "Advanced Communication Skills Assessment",
			"description":               "Enhanced evaluation of student's communication abilities including presentation skills",
			"score":                     90,
			"internship_application_id": 1,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/InternshipCriteria/update/"+strconv.Itoa(id), payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipCriteria/delete/"+strconv.Itoa(id), nil)
	})
}
