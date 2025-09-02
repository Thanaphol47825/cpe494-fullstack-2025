package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestCourseController(t *testing.T) {
	curId := 4
	courseId := 7

	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"name":          "Intro to Programming",
			"description":   "Basic concepts",
			"curriculum_id": curId,
			"optional":      false,
			"course_status": 1,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Course/createCourse", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Course/getCourses", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Course/getCourses/"+strconv.Itoa(courseId), nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"description":   "Updated description",
			"optional":      true,
			"course_status": 2,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/Course/updateCourse/"+strconv.Itoa(courseId), payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/Course/deleteCourse/"+strconv.Itoa(courseId), nil)
	})
}
