package test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"ModEd/core"
	"ModEd/hr/controller"
	"ModEd/hr/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

/********** helpers **********/

type apiResp[T any] struct {
	IsSuccess bool `json:"isSuccess"`
	Result    T    `json:"result"`
}

func setupInstructorApp(t *testing.T) (*fiber.App, *controller.LeaveInstructorHRController, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	if err := db.AutoMigrate(&model.RequestLeaveInstructor{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	appCore := &core.ModEdApplication{DB: db}

	ctl := controller.NewLeaveInstructorHRController()
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

func performInstr(app *fiber.App, method, url string, body any) (*http.Response, []byte, error) {
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

/********** tests **********/

func TestInstructor_Create(t *testing.T) {
	app, _, _ := setupInstructorApp(t)

	dto := map[string]any{
		"InstructorCode": "INS001",
		"LeaveType":      "Sick",
		"Reason":         "fever",
		"DateStr":        "2025-08-30",
	}
	resp, body, _ := performInstr(app, http.MethodPost, "/hr/leave-instructor-requests", dto)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create failed: %d %s", resp.StatusCode, string(body))
	}
}

func TestInstructor_Read(t *testing.T) {
	app, _, db := setupInstructorApp(t)

	// seed record
	db.Create(&model.RequestLeaveInstructor{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeSick,
			Reason:    "flu",
			LeaveDate: time.Date(2025, 8, 30, 0, 0, 0, 0, time.UTC),
		},
		InstructorCode: "INS001",
	})

	resp, body, _ := performInstr(app, http.MethodGet, "/hr/leave-instructor-requests", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("read failed: %d %s", resp.StatusCode, string(body))
	}
	var gotAll apiResp[[]model.RequestLeaveInstructor]
	if err := json.Unmarshal(body, &gotAll); err != nil {
		t.Fatalf("unmarshal read: %v", err)
	}
	if len(gotAll.Result) == 0 {
		t.Fatalf("expected >=1 record, got 0")
	}
}

func TestInstructor_Update(t *testing.T) {
	app, _, db := setupInstructorApp(t)

	// seed record
	rec := &model.RequestLeaveInstructor{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeSick,
			Reason:    "flu",
			LeaveDate: time.Now(),
		},
		InstructorCode: "INS002",
	}
	db.Create(rec)

	dto := map[string]any{
		"id":         rec.ID,
		"status":     "Approved",
		"reason":     "approved",
		"leave_type": "Personal",
	}
	resp, body, _ := performInstr(app, http.MethodPost, "/hr/leave-instructor-requests/update", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update failed: %d %s", resp.StatusCode, string(body))
	}
}

func TestInstructor_Delete(t *testing.T) {
	app, _, db := setupInstructorApp(t)

	// seed record
	rec := &model.RequestLeaveInstructor{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeSick,
			Reason:    "flu",
			LeaveDate: time.Now(),
		},
		InstructorCode: "INS003",
	}
	db.Create(rec)

	dto := map[string]any{"id": rec.ID}
	resp, body, _ := performInstr(app, http.MethodPost, "/hr/leave-instructor-requests/delete", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete failed: %d %s", resp.StatusCode, string(body))
	}

	// ตรวจสอบจริง ๆ ว่าหาย
	var cnt int64
	db.Model(&model.RequestLeaveInstructor{}).Where("id = ?", rec.ID).Count(&cnt)
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
