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
			"name":         "John Doe",
			"age":          20,
			"email":        fmt.Sprintf("john%v@example.com", time.Now().UnixNano()),
			"intern_id":    1,
			"advisor_code": "A001",
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
			"name":  "John Updated",
			"age":   21,
			"email": "john.updated@example.com",
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
