package test

import (
	"fmt"
	"net/http"
	"testing"
)

func TestFacultyController(t *testing.T) {
	var facultyID string

	// CREATE
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"name": "TestFaculty",
			"budget": 1000000,
		}
		created := req(t, http.MethodPost, "/common/faculties", payload)
		if !isSuccess(created) {
			t.Fatalf("create failed: %+v", created["error"])
		}
		facultyID = fmt.Sprintf("%.0f", created["result"].(map[string]any)["ID"].(float64))
	})

	// GET
	t.Run("get", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/faculties/"+facultyID, nil)
		if !isSuccess(got) {
			t.Fatalf("get failed: %+v", got["error"])
		}
	})

	// UPDATE
	t.Run("update", func(t *testing.T) {
		updatePayload := map[string]any{
			"name": "Updated Faculty",
			"budget": 1500000,
		}
		updated := req(t, http.MethodPost, "/common/faculties/"+facultyID, updatePayload)
		if !isSuccess(updated) {
			t.Fatalf("update failed: %+v", updated["error"])
		}
	})

	// DELETE
	t.Run("delete", func(t *testing.T) {
		deleted := req(t, http.MethodGet, "/common/faculties/delete/"+facultyID, nil)
		if !isSuccess(deleted) {
			t.Fatalf("delete failed: %+v", deleted["error"])
		}
	})
}
