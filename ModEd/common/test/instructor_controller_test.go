package test

import (
	"fmt"
	"net/http"
	"testing"
)

func TestInstructorController(t *testing.T) {
	var instID string

	// CREATE
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"name":    "Test Instructor",
			"surname": "Lastname",
			"email":   "test@example.com",
		}
		created := req(t, http.MethodPost, "/common/instructors", payload)
		if !isSuccess(created) {
			t.Fatalf("create failed: %+v", created["error"])
		}
		instID = fmt.Sprintf("%.0f", created["ID"].(float64))
	})

	// GET
	t.Run("get", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/instructors/"+instID, nil)
		if !isSuccess(got) {
			t.Fatalf("get failed: %+v", got["error"])
		}
	})

	// UPDATE
	t.Run("update", func(t *testing.T) {
		updatePayload := map[string]any{
			"name":    "Updated Instructor",
			"surname": "New Lastname",
			"email":   "updated@example.com",
		}
		updated := req(t, http.MethodPost, "/common/instructors/"+instID, updatePayload)
		if !isSuccess(updated) {
			t.Fatalf("update failed: %+v", updated["error"])
		}
	})

	// GET ALL
	t.Run("get all", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/instructors/getall", nil)
		if !isSuccess(got) {
			t.Fatalf("get all failed: %+v", got["error"])
		}
	})

	// DELETE
	t.Run("delete", func(t *testing.T) {
		deleted := req(t, http.MethodGet, "/common/instructors/delete/"+instID, nil)
		if !isSuccess(deleted) {
			t.Fatalf("delete failed: %+v", deleted["error"])
		}
	})
}
