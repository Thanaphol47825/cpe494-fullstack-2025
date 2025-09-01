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

	commonModel "ModEd/common/model"
	"ModEd/core"
	"ModEd/recruit/controller"
	recruitModel "ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupApplicationReportApp(t *testing.T) (*fiber.App, *gorm.DB) {
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

	if err := db.AutoMigrate(&recruitModel.ApplicationReport{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	appCore := &core.ModEdApplication{DB: db}
	ctl := controller.NewApplicationReportController()
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

func performApplicationReportTest(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
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

func TestCreateApplicationReport(t *testing.T) {
	app, db := setupApplicationReportApp(t)

	dto := map[string]any{
		"applicant_id":          1,
		"application_rounds_id": 1,
		"faculty_id":            1,
		"department_id":         1,
		"program":               "Regular",
		"application_statuses":  "Pending",
	}

	resp, body := performApplicationReportTest(app, http.MethodPost, "/recruit/CreateApplicationReport", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var createResp struct {
		IsSuccess bool                           `json:"isSuccess"`
		Result    recruitModel.ApplicationReport `json:"result"`
	}
	if err := json.Unmarshal(body, &createResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !createResp.IsSuccess {
		t.Fatalf("unexpected response: %+v", createResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.ApplicationReport{}).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt < 1 {
		t.Fatalf("expected application report inserted, got %d", cnt)
	}
}

func TestApplicationReportGetAllAndGetByID(t *testing.T) {
	app, db := setupApplicationReportApp(t)

	program := commonModel.REGULAR
	applicationReport := &recruitModel.ApplicationReport{
		ApplicantID:         1,
		ApplicationRoundsID: 1,
		FacultyID:           1,
		DepartmentID:        1,
		Program:             &program,
		ApplicationStatuses: "Pending",
	}

	if err := db.Create(applicationReport).Error; err != nil {
		t.Fatalf("failed to create test application report: %v", err)
	}

	resp, body := performApplicationReportTest(app, http.MethodGet, "/recruit/GetApplicationReports", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}

	var listResp struct {
		IsSuccess bool                              `json:"isSuccess"`
		Result    []*recruitModel.ApplicationReport `json:"result"`
	}
	if err := json.Unmarshal(body, &listResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !listResp.IsSuccess || len(listResp.Result) < 1 {
		t.Fatalf("expected at least 1 application report, got %+v", listResp)
	}

	resp, body = performApplicationReportTest(app, http.MethodGet, fmt.Sprintf("/recruit/GetApplicationReport/%d", applicationReport.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}

	var singleResp struct {
		IsSuccess bool                           `json:"isSuccess"`
		Result    recruitModel.ApplicationReport `json:"result"`
	}
	if err := json.Unmarshal(body, &singleResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !singleResp.IsSuccess || singleResp.Result.ID != applicationReport.ID {
		t.Fatalf("expected application report with id %d, got %+v", applicationReport.ID, singleResp)
	}
}

func TestUpdateApplicationReport(t *testing.T) {
	app, db := setupApplicationReportApp(t)

	program := commonModel.REGULAR
	applicationReport := &recruitModel.ApplicationReport{
		ApplicantID:         1,
		ApplicationRoundsID: 1,
		FacultyID:           1,
		DepartmentID:        1,
		Program:             &program,
		ApplicationStatuses: "Pending",
	}

	if err := db.Create(applicationReport).Error; err != nil {
		t.Fatalf("failed to create test application report: %v", err)
	}

	dto := map[string]any{
		"application_statuses": "Accepted",
		"program":              "International",
	}

	resp, body := performApplicationReportTest(app, http.MethodPost, fmt.Sprintf("/recruit/UpdateApplicationReport/%d", applicationReport.ID), dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}

	var updateResp struct {
		IsSuccess bool                           `json:"isSuccess"`
		Result    recruitModel.ApplicationReport `json:"result"`
	}
	if err := json.Unmarshal(body, &updateResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !updateResp.IsSuccess {
		t.Fatalf("unexpected response: %+v", updateResp)
	}

	var after recruitModel.ApplicationReport
	if err := db.First(&after, applicationReport.ID).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.ApplicationStatuses != "Accepted" {
		t.Fatalf("update failed: %+v", after)
	}
}

func TestDeleteApplicationReport(t *testing.T) {
	app, db := setupApplicationReportApp(t)

	program := commonModel.REGULAR
	applicationReport := &recruitModel.ApplicationReport{
		ApplicantID:         1,
		ApplicationRoundsID: 1,
		FacultyID:           1,
		DepartmentID:        1,
		Program:             &program,
		ApplicationStatuses: "Pending",
	}

	if err := db.Create(applicationReport).Error; err != nil {
		t.Fatalf("failed to create test application report: %v", err)
	}

	resp, body := performApplicationReportTest(app, http.MethodPost, fmt.Sprintf("/recruit/DeleteApplicationReport/%d", applicationReport.ID), nil)
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
	if !deleteResp.IsSuccess || deleteResp.Result != "ApplicationReport deleted successfully" {
		t.Fatalf("unexpected response: %+v", deleteResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.ApplicationReport{}).Where("id = ?", applicationReport.ID).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
