package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"ModEd/core"
	"ModEd/hr/controller"
	"ModEd/hr/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)


func setupResignApp(t *testing.T) (*fiber.App, *controller.ResignationStudentHRController, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	_ = db.Exec("PRAGMA foreign_keys = ON;")

	if err := db.AutoMigrate(&model.RequestResignationStudent{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	appCore := &core.ModEdApplication{DB: db}

	ctl := controller.NewResignationStudentHRController()
	ctl.SetApplication(appCore)

	app := fiber.New()
	for _, r := range ctl.GetRoute() {
		switch r.Method {
		case core.GET:
			app.Get(r.Route, r.Handler)
		case core.POST:
			app.Post(r.Route, r.Handler)
		}
	}
	return app, ctl, db
}

func performReq(app *fiber.App, method, url string, body any) (*http.Response, []byte, error) {
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, url, &buf)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)
	if err != nil {
		return nil, nil, err
	}
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp, nil, err
	}
	_ = resp.Body.Close()
	return resp, b, nil
}

func createResign(app *fiber.App, studentCode, reason string) (uint, map[string]any, error) {
	body := map[string]string{
		"StudentCode": studentCode,
		"Reason":      reason,
	}
	resp, b, err := performReq(app, http.MethodPost, "/hr/resignation-student-requests", body)
	if err != nil {
		return 0, nil, err
	}
	if resp.StatusCode != http.StatusCreated {
		return 0, nil, fmt.Errorf("create status = %d body=%s", resp.StatusCode, string(b))
	}
	var out map[string]any
	if err := json.Unmarshal(b, &out); err != nil {
		return 0, nil, err
	}
	result := out["result"].(map[string]any)
	idFloat, ok := result["ID"].(float64)
	if !ok {
		if alt, ok2 := result["Id"].(float64); ok2 {
			idFloat = alt
		} else {
			return 0, nil, fmt.Errorf("cannot find ID in response: %v", result)
		}
	}
	return uint(idFloat), result, nil
}


func TestResign_HandleListAndGetByID(t *testing.T) {
	app, _, _ := setupResignApp(t)

	id1, _, err := createResign(app, "65070501011", "moving to another city")
	if err != nil {
		t.Fatalf("create1: %v", err)
	}
	_, _, err = createResign(app, "65070501012", "personal reason")
	if err != nil {
		t.Fatalf("create2: %v", err)
	}

	resp, body, err := performReq(app, http.MethodGet, "/hr/resignation-student-requests", nil)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("list status = %d, body=%s", resp.StatusCode, string(body))
	}
	var listResp map[string]any
	_ = json.Unmarshal(body, &listResp)
	if ok, _ := listResp["isSuccess"].(bool); !ok {
		t.Fatalf("isSuccess false, body=%s", string(body))
	}
	rows, ok := listResp["result"].([]any)
	if !ok || len(rows) != 2 {
		t.Fatalf("expect 2 rows, got %v", len(rows))
	}

	resp, body, _ = performReq(app, http.MethodGet, fmt.Sprintf("/hr/resignation-student-requests/%d", id1), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status = %d, body=%s", resp.StatusCode, string(body))
	}
	var getResp map[string]any
	if err := json.Unmarshal(body, &getResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	res := getResp["result"].(map[string]any)
	if sc, _ := res["StudentCode"].(string); sc != "65070501011" {
		t.Fatalf("unexpected StudentCode: %v", sc)
	}
}

func TestResign_HandleCreate_InvalidBody(t *testing.T) {
	app, _, _ := setupResignApp(t)

	body := map[string]string{
		"StudentCode": "65070501099",
	}
	resp, b, _ := performReq(app, http.MethodPost, "/hr/resignation-student-requests", body)
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expect 400, got %d body=%s", resp.StatusCode, string(b))
	}
}

func TestResign_HandleReview_ApproveAndReject(t *testing.T) {
	app, _, _ := setupResignApp(t)

	idA, _, err := createResign(app, "65070501101", "family")
	if err != nil {
		t.Fatalf("create (approve flow): %v", err)
	}
	reviewBody := map[string]string{"action": "approve"}
	resp, b, _ := performReq(app, http.MethodPost, fmt.Sprintf("/hr/resignation-student-requests/%d/review", idA), reviewBody)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("approve status = %d body=%s", resp.StatusCode, string(b))
	}
	var approveResp map[string]any
	_ = json.Unmarshal(b, &approveResp)
	ares := approveResp["result"].(map[string]any)
	if status, _ := ares["Status"].(string); strings.ToLower(status) != "approve" {
		t.Fatalf("expect Status=approve, got %v", status)
	}

	idR, _, err := createResign(app, "65070501102", "job offer")
	if err != nil {
		t.Fatalf("create (reject flow): %v", err)
	}
	rejectBody := map[string]string{"action": "reject", "reason": "incomplete documents"}
	resp, b, _ = performReq(app, http.MethodPost, fmt.Sprintf("/hr/resignation-student-requests/%d/review", idR), rejectBody)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("reject status = %d body=%s", resp.StatusCode, string(b))
	}
	var rejectResp map[string]any
	_ = json.Unmarshal(b, &rejectResp)
	rres := rejectResp["result"].(map[string]any)
	if status, _ := rres["Status"].(string); strings.ToLower(status) != "reject" {
		t.Fatalf("expect Status=reject, got %v", status)
	}
}

func TestResign_HandleDelete(t *testing.T) {
	app, _, db := setupResignApp(t)

	id, _, err := createResign(app, "65070501234", "health reasons")
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	resp, body, _ := performReq(app, http.MethodPost, fmt.Sprintf("/hr/resignation-student-requests/%d/delete", id), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete status = %d, body=%s", resp.StatusCode, string(body))
	}

	var cnt int64
	if err := db.Model(&model.RequestResignationStudent{}).Where("id = ?", id).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}

	resp, body, _ = performReq(app, http.MethodGet, fmt.Sprintf("/hr/resignation-student-requests/%d", id), nil)
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("get after delete: expect 404, got %d body=%s", resp.StatusCode, string(body))
	}
}
