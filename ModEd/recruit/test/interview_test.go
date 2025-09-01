package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"ModEd/core"
	"ModEd/recruit/controller"
	recruitModel "ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupInterviewApp(t *testing.T) (*fiber.App, *gorm.DB) {
	t.Helper()

	dsn := os.Getenv("DSN")
	if dsn == "" {
		dsn = "host= user= password= dbname= port="
		fmt.Printf("Using DSN: %s\n", dsn)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(&recruitModel.Interview{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	appCore := &core.ModEdApplication{DB: db}
	ctl := controller.NewInterviewController()
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
	return app, db
}

func performInterviewTest(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, url, &buf)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req, -1)
	if err != nil {
		panic(err)
	}
	b, _ := io.ReadAll(resp.Body)
	_ = resp.Body.Close()
	return resp, b
}

func TestCreateInterview(t *testing.T) {
	app, db := setupInterviewApp(t)

	dto := map[string]any{
		"instructor_id":         1,
		"application_report_id": 1,
		"scheduled_appointment": "2025-11-20T10:00:00Z",
		"criteria_scores":       `{"communication": 7.5, "technical": 8.0, "motivation": 7.0}`,
		"total_score":           7.5,
		"evaluated_at":          "2025-11-20T11:00:00Z",
		"interview_status":      "Evaluated",
	}

	resp, body := performInterviewTest(app, http.MethodPost, "/recruit/CreateInterview", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var createResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Interview `json:"result"`
	}
	if err := json.Unmarshal(body, &createResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !createResp.IsSuccess {
		t.Fatalf("unexpected response: %+v", createResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Interview{}).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt < 1 {
		t.Fatalf("expected interview inserted, got %d", cnt)
	}
}

func TestInterviewGetAllAndGetByID(t *testing.T) {
	app, db := setupInterviewApp(t)

	interview := &recruitModel.Interview{
		InstructorID:         1,
		ApplicationReportID:  1,
		ScheduledAppointment: time.Date(2025, 10, 15, 14, 0, 0, 0, time.UTC),
		CriteriaScores:       `{"communication": 8.5, "technical": 9.0, "motivation": 8.0}`,
		TotalScore:           8.5,
		EvaluatedAt:          time.Date(2025, 10, 15, 15, 0, 0, 0, time.UTC),
		InterviewStatus:      "Evaluated",
	}

	if err := db.Create(interview).Error; err != nil {
		t.Fatalf("failed to create test interview: %v", err)
	}

	resp, body := performInterviewTest(app, http.MethodGet, "/recruit/GetInterviews", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}

	var listResp struct {
		IsSuccess bool                      `json:"isSuccess"`
		Result    []*recruitModel.Interview `json:"result"`
	}
	if err := json.Unmarshal(body, &listResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !listResp.IsSuccess || len(listResp.Result) < 1 {
		t.Fatalf("expected at least 1 interview, got %+v", listResp)
	}

	resp, body = performInterviewTest(app, http.MethodGet, fmt.Sprintf("/recruit/GetInterview/%d", interview.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}

	var singleResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Interview `json:"result"`
	}
	if err := json.Unmarshal(body, &singleResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !singleResp.IsSuccess || singleResp.Result.ID != interview.ID {
		t.Fatalf("expected interview with id %d, got %+v", interview.ID, singleResp)
	}
}

func TestUpdateInterview(t *testing.T) {
	app, db := setupInterviewApp(t)

	interview := &recruitModel.Interview{
		InstructorID:         1,
		ApplicationReportID:  1,
		ScheduledAppointment: time.Date(2025, 10, 15, 14, 0, 0, 0, time.UTC),
		CriteriaScores:       `{"communication": 8.5, "technical": 9.0, "motivation": 8.0}`,
		TotalScore:           8.5,
		EvaluatedAt:          time.Date(2025, 10, 15, 15, 0, 0, 0, time.UTC),
		InterviewStatus:      "Evaluated",
	}

	if err := db.Create(interview).Error; err != nil {
		t.Fatalf("failed to create test interview: %v", err)
	}

	dto := map[string]any{
		"total_score":      9.0,
		"interview_status": "Accepted",
		"criteria_scores":  `{"communication": 9.0, "technical": 9.5, "motivation": 8.5}`,
		"evaluated_at":     "2025-10-16T10:00:00Z",
	}

	resp, body := performInterviewTest(app, http.MethodPost, fmt.Sprintf("/recruit/UpdateInterview/%d", interview.ID), dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}

	var updateResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Interview `json:"result"`
	}
	if err := json.Unmarshal(body, &updateResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !updateResp.IsSuccess || updateResp.Result.TotalScore != 9.0 {
		t.Fatalf("unexpected response: %+v", updateResp)
	}

	var after recruitModel.Interview
	if err := db.First(&after, interview.ID).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.TotalScore != 9.0 || after.InterviewStatus != "Accepted" {
		t.Fatalf("update failed: %+v", after)
	}
}

func TestDeleteInterview(t *testing.T) {
	app, db := setupInterviewApp(t)

	interview := &recruitModel.Interview{
		InstructorID:         1,
		ApplicationReportID:  1,
		ScheduledAppointment: time.Date(2025, 10, 15, 14, 0, 0, 0, time.UTC),
		CriteriaScores:       `{"communication": 8.5, "technical": 9.0, "motivation": 8.0}`,
		TotalScore:           8.5,
		EvaluatedAt:          time.Date(2025, 10, 15, 15, 0, 0, 0, time.UTC),
		InterviewStatus:      "Evaluated",
	}

	if err := db.Create(interview).Error; err != nil {
		t.Fatalf("failed to create test interview: %v", err)
	}

	resp, body := performInterviewTest(app, http.MethodPost, fmt.Sprintf("/recruit/DeleteInterview/%d", interview.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete status=%d body=%s", resp.StatusCode, string(body))
	}

	var deleteResp struct {
		IsSuccess bool   `json:"isSuccess"`
		Result    string `json:"result"`
	}
	if err := json.Unmarshal(body, &deleteResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !deleteResp.IsSuccess || deleteResp.Result != "Interview deleted successfully" {
		t.Fatalf("unexpected response: %+v", deleteResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Interview{}).Where("id = ?", interview.ID).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
