package test

import (
	"fmt"
	"net/http"
	"testing"
)

func TestDepartmentController(t *testing.T) {

	var deptID string

	// CREATE
	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"name":   "TestDepartment",
			"budget": 500000,
		}
		created := req(t, http.MethodPost, "/common/departments", payload)
		if !isSuccess(created) {
			t.Fatalf("create failed: %+v", created["error"])
		}
		deptID = fmt.Sprintf("%.0f", created["ID"].(float64))
	})

	// GET
	t.Run("get", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/departments/"+deptID, nil)
		if !isSuccess(got) {
			t.Fatalf("get failed: %+v", got["error"])
		}
	})

	// UPDATE
	t.Run("update", func(t *testing.T) {
		updatePayload := map[string]any{
			"name":   "Updated Department",
			"budget": 750000,
		}
		updated := req(t, http.MethodPost, "/common/departments/"+deptID, updatePayload)
		if !isSuccess(updated) {
			t.Fatalf("update failed: %+v", updated["error"])
		}
	})

	// GET ALL
	t.Run("get all", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/departments/getall", nil)
		if !isSuccess(got) {
			t.Fatalf("get all failed: %+v", got["error"])
		}
	})

	// DELETE
	t.Run("delete", func(t *testing.T) {
		deleted := req(t, http.MethodGet, "/common/departments/delete/"+deptID, nil)
		if !isSuccess(deleted) {
			t.Fatalf("delete failed: %+v", deleted["error"])
		}
	})
}
