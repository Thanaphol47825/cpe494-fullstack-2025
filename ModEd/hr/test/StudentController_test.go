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

func studentBaseURL() string {
	if v := os.Getenv("BASE_URL"); v != "" {
		return v
	}
	return "http://localhost:8080"
}

func sreq(t *testing.T, method, path string, body any) map[string]any {
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
	r, err := http.NewRequest(method, studentBaseURL()+path, buf)
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

func sOK(resp map[string]any) bool {
	ok, _ := resp["isSuccess"].(bool)
	return ok
}
func sResult(resp map[string]any) map[string]any {
	m, _ := resp["result"].(map[string]any)
	return m
}

func TestStudentController(t *testing.T) {
	code := fmt.Sprintf("ST%v", time.Now().UnixNano())
	start := time.Now().UTC().Format(time.RFC3339)
	birth := time.Date(2004, 1, 15, 0, 0, 0, 0, time.UTC).Format(time.RFC3339)

	t.Run("create", func(t *testing.T) {
		payload := map[string]any{
			"student_code": code,
			"first_name":   "Jarukit",
			"last_name":    "Pan-Iam",
			"email":        "jarukit@example.com",
			"start_date":   start,
			"birth_date":   birth,
			"program":      0,
			"department":   "CPE",
			"status":       nil,
			"Gender":       "M",
			"CitizenID":    "1130701234567",
			"PhoneNumber":  "0812345678",
			"AdvisorCode":  "INS001",
		}
		res := sreq(t, http.MethodPost, "/hr/students", payload)
		if !sOK(res) {
			t.Fatalf("create failed: %+v", res["error"])
		}
	})

	t.Run("list", func(t *testing.T) {
		res := sreq(t, http.MethodGet, "/hr/students?limit=50&offset=0", nil)
		if !sOK(res) {
			t.Fatalf("list failed: %+v", res["error"])
		}
	})

	t.Run("get", func(t *testing.T) {
		res := sreq(t, http.MethodGet, "/hr/students/"+code, nil)
		if !sOK(res) {
			t.Fatalf("get failed: %+v", res["error"])
		}
	})

	t.Run("update", func(t *testing.T) {
		payload := map[string]any{
			"first_name":  "Jarukit",
			"last_name":   "Pan-Iam-Updated",
			"email":       "jarukit.updated@example.com",
			"department":  "CS",
			"Gender":      "M",
			"PhoneNumber": "0899999999",
			"CitizenID":   "1130701234568",
		}
		res := sreq(t, http.MethodPost, "/hr/students/"+code+"/update", payload)
		if !sOK(res) {
			t.Fatalf("update failed: %+v", res["error"])
		}
		verify := sreq(t, http.MethodGet, "/hr/students/"+code, nil)
		if !sOK(verify) {
			t.Fatalf("verify get failed: %+v", verify["error"])
		}
		vres := sResult(verify)
		if ln, _ := vres["last_name"].(string); ln != "Pan-Iam-Updated" {
			t.Fatalf("last_name not updated: %v", ln)
		}
		if em, _ := vres["email"].(string); em != "jarukit.updated@example.com" {
			t.Fatalf("email not updated: %v", em)
		}
	})

	t.Run("delete by code", func(t *testing.T) {
		res := sreq(t, http.MethodPost, "/hr/students/"+code+"/delete", nil)
		if !sOK(res) {
			t.Fatalf("delete by code failed: %+v", res["error"])
		}
	})

	t.Run("recreate and delete by id", func(t *testing.T) {
		payload := map[string]any{
			"student_code": code + "X",
			"first_name":   "AA",
			"last_name":    "BB",
			"email":        "aa.bb@example.com",
			"start_date":   start,
			"birth_date":   birth, // เปลี่ยนเป็น RFC3339 เช่นกัน
			"program":      0,
			"department":   "IT",
		}
		created := sreq(t, http.MethodPost, "/hr/students", payload)
		if !sOK(created) {
			t.Fatalf("recreate failed: %+v", created["error"])
		}
		cr := sResult(created)
		idFloat, _ := cr["ID"].(float64)
		id := int(idFloat)

		res := sreq(t, http.MethodPost, fmt.Sprintf("/hr/students/id/%d/delete", id), nil)
		if !sOK(res) {
			t.Fatalf("delete by id failed: %+v", res["error"])
		}

		after := sreq(t, http.MethodGet, "/hr/students/"+payload["student_code"].(string), nil)
		if sOK(after) {
			t.Fatal("expected not found after delete by id")
		}
	})
}
