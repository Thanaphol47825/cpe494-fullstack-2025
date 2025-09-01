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
	"ModEd/recruit/controller"
	recruitModel "ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func setupApplicantApp(t *testing.T) (*fiber.App, *gorm.DB) {
	t.Helper()

	db := openTestDB(t)

	if err := db.AutoMigrate(&recruitModel.Applicant{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	truncateTable(t, db, "applicants")
	t.Cleanup(func() { truncateTable(t, db, "applicants") })

	appCore := &core.ModEdApplication{DB: db}
	ctl := controller.NewApplicantController()
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

func performApplicantTest(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
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

func TestCreateApplicant(t *testing.T) {
	app, db := setupApplicantApp(t)

	dto := map[string]any{
		"first_name":          "Alice",
		"last_name":           "Smith",
		"email":               "alice@example.com",
		"birth_date":          "2000-01-01T00:00:00Z",
		"address":             "123 Street",
		"phone_number":        "111",
		"gpax":                3.5,
		"high_school_program": "Science",
		"portfolio_url":       "http://alice.com",
		"family_income":       20000,
	}

	resp, body := performApplicantTest(app, http.MethodPost, "/recruit/CreateApplicant", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var createResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &createResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !createResp.IsSuccess || createResp.Result.FirstName != "Alice" {
		t.Fatalf("unexpected response: %+v", createResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Applicant{}).Where("first_name = ?", "Alice").Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 1 {
		t.Fatalf("expected Alice inserted, got %d", cnt)
	}
}

func TestGetAllAndGetByIDApplicant(t *testing.T) {
	app, db := setupApplicantApp(t)

	applicant := &recruitModel.Applicant{
		FirstName:          "Bob",
		LastName:           "Lee",
		Email:              "bob@example.com",
		BirthDate:          time.Date(2001, 2, 2, 0, 0, 0, 0, time.UTC),
		Address:            "456 Road",
		Phonenumber:        "222",
		GPAX:               3.2,
		HighSchool_Program: "Arts",
		PortfolioURL:       "http://bob.com",
		FamilyIncome:       15000,
	}
	if err := db.Create(applicant).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	resp, body := performApplicantTest(app, http.MethodGet, "/recruit/GetApplicants", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}

	var listResp struct {
		IsSuccess bool                      `json:"isSuccess"`
		Result    []*recruitModel.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &listResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !listResp.IsSuccess || len(listResp.Result) < 1 {
		t.Fatalf("expected at least 1 applicant, got %+v", listResp)
	}

	resp, body = performApplicantTest(app, http.MethodGet, fmt.Sprintf("/recruit/GetApplicant/%d", applicant.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}

	var singleResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &singleResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !singleResp.IsSuccess || singleResp.Result.ID != applicant.ID {
		t.Fatalf("expected applicant with id %d, got %+v", applicant.ID, singleResp)
	}
}

func TestUpdateApplicant(t *testing.T) {
	app, db := setupApplicantApp(t)

	applicant := &recruitModel.Applicant{
		FirstName:          "Charlie",
		LastName:           "Old",
		Email:              "charlie@old.com",
		Address:            "Old Street",
		Phonenumber:        "333",
		HighSchool_Program: "Math",
		PortfolioURL:       "http://old.com",
		FamilyIncome:       12000,
	}
	if err := db.Create(applicant).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	dto := map[string]any{
		"id":                  applicant.ID,
		"first_name":          "Charlie",
		"last_name":           "New",
		"email":               "charlie@new.com",
		"address":             "New Street",
		"phone_number":        "444",
		"high_school_program": "Science",
		"portfolio_url":       "http://new.com",
		"family_income":       13000,
	}

	resp, body := performApplicantTest(app, http.MethodPost, "/recruit/UpdateApplicant", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}

	var updateResp struct {
		IsSuccess bool                   `json:"isSuccess"`
		Result    recruitModel.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &updateResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !updateResp.IsSuccess || updateResp.Result.LastName != "New" {
		t.Fatalf("unexpected response: %+v", updateResp)
	}

	var after recruitModel.Applicant
	if err := db.First(&after, applicant.ID).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.LastName != "New" || after.Email != "charlie@new.com" {
		t.Fatalf("update failed: %+v", after)
	}
}

func TestDeleteApplicant(t *testing.T) {
	app, db := setupApplicantApp(t)

	applicant := &recruitModel.Applicant{
		FirstName:          "David",
		LastName:           "Temp",
		Email:              "david@temp.com",
		Address:            "Temp Street",
		Phonenumber:        "555",
		HighSchool_Program: "History",
		PortfolioURL:       "http://david.com",
		FamilyIncome:       9000,
	}
	if err := db.Create(applicant).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	dto := map[string]any{"id": applicant.ID}
	resp, body := performApplicantTest(app, http.MethodPost, "/recruit/DeleteApplicant", dto)
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
	if !deleteResp.IsSuccess || deleteResp.Result != "Delete successful" {
		t.Fatalf("unexpected response: %+v", deleteResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Applicant{}).Where("id = ?", applicant.ID).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
