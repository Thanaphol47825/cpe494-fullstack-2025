package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestCoursePlanController(t *testing.T) {
	curId := 5
	delId := 10
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"Week": 3,
			"Date": "2025-05-12T18:07:22.9416553+07:00",    
			"CourseId":1,
			"Topic": "Introduction to Computer Architecture",
			"Description": "Overview of course structure, grading policies, and introduction to basic computer architecture concepts.",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/CoursePlan/createCoursePlan", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/CoursePlan/getCoursePlans", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		id := "4"
		utils.RequestTest(t, http.MethodGet, "/curriculum/CoursePlan/getCoursePlan/"+id, nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"id": curId,
			"week": 4,
			"date": "2025-05-12T18:07:22.9416553+07:00",    
			"course_id":1,
			"topic": "Introduction to Computer Architecture",
			"description": "Overview of course structure, grading policies, and introduction to basic computer architecture concepts.",
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/CoursePlan/updateCoursePlan", payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/CoursePlan/deleteCoursePlan/"+strconv.Itoa(delId), nil)
	})
}
