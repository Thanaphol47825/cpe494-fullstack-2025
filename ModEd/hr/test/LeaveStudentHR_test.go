package test

import (
	"bytes"
	"encoding/json"
	"fmt"
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

// helpers
func setupApp(t *testing.T) (*fiber.App, *controller.LeaveStudentHRController, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	_ = db.Exec("PRAGMA foreign_keys = ON;")

	if err := db.AutoMigrate(&model.RequestLeaveStudent{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	appCore := &core.ModEdApplication{DB: db}

	ctl := controller.NewLeaveStudentHRController()
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

func mustCreate(t *testing.T, db *gorm.DB, r *model.RequestLeaveStudent) uint {
	t.Helper()
	if err := db.Create(r).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}
	var count int64
	if err := db.Model(&model.RequestLeaveStudent{}).Count(&count).Error; err != nil {
		t.Fatalf("count after insert: %v", err)
	}
	if count == 0 {
		t.Fatalf("record not inserted")
	}
	return r.ID
}

func perform(app *fiber.App, method, url string, body any) (*http.Response, []byte, error) {
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

// tests
func TestHandleGetAllAndGetByID(t *testing.T) {
	app, _, db := setupApp(t)

	id1 := mustCreate(t, db, &model.RequestLeaveStudent{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeSick,
			Reason:    "flu",
			LeaveDate: time.Date(2025, 8, 20, 0, 0, 0, 0, time.UTC),
		},
		StudentCode: "65070501001",
	})
	_ = mustCreate(t, db, &model.RequestLeaveStudent{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeVacation,
			Reason:    "family trip",
			LeaveDate: time.Date(2025, 8, 21, 0, 0, 0, 0, time.UTC),
		},
		StudentCode: "65070501002",
	})

	resp, body, err := perform(app, http.MethodGet, "/hr/leave-student-requests", nil)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status = %d, body=%s", resp.StatusCode, string(body))
	}
	var arr []model.RequestLeaveStudent
	if err := json.Unmarshal(body, &arr); err != nil {
		t.Fatalf("unmarshal: %v, body=%s", err, string(body))
	}
	if len(arr) != 2 {
		t.Fatalf("expect 2, got %d", len(arr))
	}

	resp, body, _ = perform(app, http.MethodGet, fmt.Sprintf("/hr/leave-student-requests/%d", id1), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status = %d, body=%s", resp.StatusCode, string(body))
	}
	var got model.RequestLeaveStudent
	if err := json.Unmarshal(body, &got); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if got.StudentCode != "65070501001" || got.LeaveType != model.LeaveTypeSick {
		t.Fatalf("unexpected record: %+v", got)
	}
}

func TestHandleEditRequest(t *testing.T) {
	app, _, db := setupApp(t)

	id := mustCreate(t, db, &model.RequestLeaveStudent{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeSick,
			Reason:    "flu",
			LeaveDate: time.Date(2025, 8, 20, 0, 0, 0, 0, time.UTC),
		},
		StudentCode: "65070501001",
	})

	dto := map[string]string{
		"student_code": "65070501004",
		"leave_type":   string(model.LeaveTypeVacation),
		"reason":       "family",
		"leave_date":   "2025-08-22",
	}
	resp, body, _ := perform(app, http.MethodPost, fmt.Sprintf("/hr/leave-student-requests/%d/edit", id), dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("edit status = %d, body=%s", resp.StatusCode, string(body))
	}

	var after model.RequestLeaveStudent
	if err := db.First(&after, id).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.StudentCode != "65070501004" || after.LeaveType != model.LeaveTypeVacation || after.Reason != "family" {
		t.Fatalf("update failed: %+v", after)
	}
	if after.LeaveDate.Format("2006-01-02") != "2025-08-22" {
		t.Fatalf("date not updated: %v", after.LeaveDate)
	}
}

func TestHandleDeleteRequest(t *testing.T) {
	app, _, db := setupApp(t)

	id := mustCreate(t, db, &model.RequestLeaveStudent{
		BaseLeaveRequest: model.BaseLeaveRequest{
			Status:    "Pending",
			LeaveType: model.LeaveTypeOther,
			Reason:    "personal",
			LeaveDate: time.Date(2025, 8, 23, 0, 0, 0, 0, time.UTC),
		},
		StudentCode: "65070501003",
	})

	resp, body, _ := perform(app, http.MethodPost, fmt.Sprintf("/hr/leave-student-requests/%d/delete", id), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete status = %d, body=%s", resp.StatusCode, string(body))
	}

	var cnt int64
	if err := db.Model(&model.RequestLeaveStudent{}).Where("id = ?", id).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}

func TestHandleSubmitRequest_InvalidLeaveType(t *testing.T) {
	app, _, _ := setupApp(t)

	dto := map[string]string{
		"student_code": "65070501004",
		"leave_type":   "InvalidType",
		"reason":       "x",
		"leave_date":   "2025-08-24",
	}
	resp, body, _ := perform(app, http.MethodPost, "/hr/leave-student-requests", dto)
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expect 400 on invalid leave type, got %d body=%s", resp.StatusCode, string(body))
	}
}
