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

type apiResp struct {
	IsSuccess bool            `json:"isSuccess"`
	Result    json.RawMessage `json:"result"`
	Error     *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func baseURL() string {
	if v := os.Getenv("BASE_URL"); v != "" {
		return v
	}
	return "http://localhost:8080"
}

func req(t *testing.T, method, path string, body any) *apiResp {
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
	var out apiResp
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	return &out
}

func TestInstructorController(t *testing.T) {
	code := fmt.Sprintf("INS%v", time.Now().UnixNano())
	now := time.Now().UTC().Format(time.RFC3339)

	t.Run("health", func(t *testing.T) {
		health := req(t, http.MethodGet, "/hr/Instructor", nil)
		if !health.IsSuccess {
			t.Fatalf("health failed: %+v", health.Error)
		}
	})

	t.Run("create", func(t *testing.T) {
		createPayload := map[string]any{
			"instructor_code":    code,
			"first_name":         "Somchai",
			"last_name":          "Jaidee",
			"email":              "somchai.jaidee@example.com",
			"department":         "CS",
			"start_date":         now,
			"Gender":             "M",
			"PhoneNumber":        "0812345678",
			"Salary":             42000,
			"AcademicPosition":   1,
			"DepartmentPosition": 1,
		}
		created := req(t, http.MethodPost, "/hr/instructors", createPayload)
		if !created.IsSuccess {
			t.Fatalf("create failed: %+v", created.Error)
		}
	})

	t.Run("get", func(t *testing.T) {
		got := req(t, http.MethodGet, "/hr/instructors/"+code, nil)
		if !got.IsSuccess {
			t.Fatalf("get failed: %+v", got.Error)
		}
	})

	t.Run("update", func(t *testing.T) {
		updatePayload := map[string]any{
			"first_name":         "Somchai",
			"last_name":          "Deejai",
			"email":              "somchai.deejai@example.com",
			"department":         "IT",
			"Gender":             "M",
			"PhoneNumber":        "0899999999",
			"Salary":             48000,
			"AcademicPosition":   "associate",
			"DepartmentPosition": "head",
		}
		updated := req(t, http.MethodPost, "/hr/instructors/"+code+"/update", updatePayload)
		if !updated.IsSuccess {
			t.Fatalf("update failed: %+v", updated.Error)
		}
	})

	t.Run("delete", func(t *testing.T) {
		deleted := req(t, http.MethodPost, "/hr/instructors/"+code+"/delete", nil)
		if !deleted.IsSuccess {
			t.Fatalf("delete failed: %+v", deleted.Error)
		}
	})
}
