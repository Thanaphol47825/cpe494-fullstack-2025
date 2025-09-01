package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"
)

func baseURL() string {
	if v := os.Getenv("BASE_URL"); v != "" {
		return v
	}
	return "http://localhost:8080"
}

func req(t *testing.T, method, path string, body any) map[string]any {
	t.Helper()
	var buf *bytes.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			t.Fatal(err)
		}
		buf = bytes.NewReader(b)
	} else {
		buf = bytes.NewReader(nil)
	}
	r, err := http.NewRequest(method, baseURL()+path, buf)
	if err != nil {
		t.Fatal(err)
	}
	r.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(r)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	var out map[string]any
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	return out
}

func isSuccess(resp map[string]any) bool {
	ok, _ := resp["isSuccess"].(bool)
	return ok
}

func TestStudentController(t *testing.T) {
	studentID := ""

	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"student_code": fmt.Sprintf("STU%v", time.Now().UnixNano()),
			"first_name":   "John",
			"last_name":    "Doe",
			"email":        fmt.Sprintf("john%v@example.com", time.Now().UnixNano()),
			"department":   "Computer Engineering",
			"program":      1,
			"advisor_code": "A001",
			"start_date":   time.Now().Format(time.RFC3339),
			"birth_date":   "2000-01-01T00:00:00Z",
		}
		created := req(t, http.MethodPost, "/common/students", payload)
		if !isSuccess(created) {
			t.Fatalf("create failed: %+v", created["error"])
		}
		studentID = fmt.Sprintf("%.0f", created["result"].(map[string]any)["ID"].(float64))
	})

	t.Run("get", func(t *testing.T) {
		got := req(t, http.MethodGet, "/common/students/"+studentID, nil)
		if !isSuccess(got) {
			t.Fatalf("get failed: %+v", got["error"])
		}
	})

	t.Run("update", func(t *testing.T) {
		updatePayload := map[string]any{
			"first_name": "John Updated",
			"last_name":  "Doe Updated",
			"email":      "john.updated@example.com",
			"department": "Software Engineering",
		}
		updated := req(t, http.MethodPost, "/common/students/"+studentID, updatePayload)
		if !isSuccess(updated) {
			t.Fatalf("update failed: %+v", updated["error"])
		}
	})

	t.Run("delete", func(t *testing.T) {
		deleted := req(t, http.MethodGet, "/common/students/delete/"+studentID, nil)
		if !isSuccess(deleted) {
			t.Fatalf("delete failed: %+v", deleted["error"])
		}
	})
}
