package test

import (
	"ModEd/curriculum/utils"
	"net/http"
	"strconv"
	"testing"
)

func TestInternshipAttendanceController(t *testing.T) {
	id := 1
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"date":                      "2025-09-16",
			"checkInTime":               "08:00:00",
			"checkOutTime":              "17:00:00",
			"checkInStatus":             true,
			"assingWork":                "Completed",
			"studentInfoID":             1,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/InternshipAttendance/create", payload)
	})

	t.Run("get all", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipAttendance/GetInternshipAttendances", nil)
	})

	t.Run("get by id", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipAttendance/"+strconv.Itoa(id), nil)
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"date":                      "2025-09-16",
			"checkInTime":               "08:00:00",
			"checkOutTime":              "17:00:00",
			"checkInStatus":             true,
			"assingWork":                "Pending",
			"studentInfoID":             1,
		}
		utils.RequestTest(t, http.MethodPost, "/curriculum/InternshipAttendance/update/"+strconv.Itoa(id), payload)
	})

	t.Run("delete", func(t *testing.T) {
		utils.RequestTest(t, http.MethodGet, "/curriculum/InternshipAttendance/delete/"+strconv.Itoa(id), nil)
	})
}
