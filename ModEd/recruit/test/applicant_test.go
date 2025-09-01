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
	"ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupApp(t *testing.T) (*fiber.App, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	_ = db.Exec("PRAGMA foreign_keys = ON;")

	if err := db.AutoMigrate(&model.Applicant{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

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

func mustCreate(t *testing.T, db *gorm.DB, a *model.Applicant) uint {
	t.Helper()
	if err := db.Create(a).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}
	return a.ID
}

func perform(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
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

func TestGetAllAndGetByID(t *testing.T) {
	app, db := setupApp(t)

	id1 := mustCreate(t, db, &model.Applicant{
		FirstName:          "Alice",
		LastName:           "Smith",
		Email:              "alice@example.com",
		BirthDate:          time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC),
		Address:            "123 Street",
		Phonenumber:        "111",
		GPAX:               3.5,
		HighSchool_Program: "Science",
		PortfolioURL:       "http://alice.com",
		FamilyIncome:       20000,
	})
	_ = mustCreate(t, db, &model.Applicant{
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
	})

	resp, body := perform(app, http.MethodGet, "/recruit/GetApplicants", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}
	var listResp struct {
		IsSuccess bool              `json:"isSuccess"`
		Result    []model.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &listResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !listResp.IsSuccess || len(listResp.Result) != 2 {
		t.Fatalf("expected 2 applicants, got %+v", listResp)
	}

	resp, body = perform(app, http.MethodGet, fmt.Sprintf("/recruit/GetApplicant/%d", id1), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}
	var singleResp struct {
		IsSuccess bool            `json:"isSuccess"`
		Result    model.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &singleResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !singleResp.IsSuccess || singleResp.Result.FirstName != "Alice" {
		t.Fatalf("expected Alice, got %+v", singleResp)
	}
}

func TestCreateApplicant(t *testing.T) {
	app, db := setupApp(t)

	dto := map[string]any{
		"first_name":          "Charlie",
		"last_name":           "Brown",
		"email":               "charlie@example.com",
		"birth_date":          "2002-03-03T00:00:00Z",
		"address":             "789 Ave",
		"phone_number":        "333",
		"gpax":                3.8,
		"high_school_program": "Math",
		"portfolio_url":       "http://charlie.com",
		"family_income":       18000,
	}
	resp, body := perform(app, http.MethodPost, "/recruit/CreateApplicant", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var createResp struct {
		IsSuccess bool            `json:"isSuccess"`
		Result    model.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &createResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !createResp.IsSuccess || createResp.Result.FirstName != "Charlie" {
		t.Fatalf("unexpected response: %+v", createResp)
	}

	var cnt int64
	if err := db.Model(&model.Applicant{}).Where("first_name = ?", "Charlie").Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 1 {
		t.Fatalf("expected Charlie inserted, got %d", cnt)
	}
}

func TestUpdateApplicant(t *testing.T) {
	app, db := setupApp(t)

	id := mustCreate(t, db, &model.Applicant{
		FirstName:          "David",
		LastName:           "Old",
		Email:              "david@old.com",
		Address:            "Old Street",
		Phonenumber:        "444",
		HighSchool_Program: "History",
		PortfolioURL:       "http://old.com",
		FamilyIncome:       10000,
	})

	dto := map[string]any{
		"id":                  id,
		"first_name":          "David",
		"last_name":           "New",
		"email":               "david@new.com",
		"address":             "New Street",
		"phone_number":        "555",
		"high_school_program": "Math",
		"portfolio_url":       "http://new.com",
		"family_income":       12000,
	}
	resp, body := perform(app, http.MethodPost, "/recruit/UpdateApplicant", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}

	var updateResp struct {
		IsSuccess bool            `json:"isSuccess"`
		Result    model.Applicant `json:"result"`
	}
	if err := json.Unmarshal(body, &updateResp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !updateResp.IsSuccess || updateResp.Result.LastName != "New" {
		t.Fatalf("unexpected response: %+v", updateResp)
	}

	var after model.Applicant
	if err := db.First(&after, id).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.LastName != "New" || after.Email != "david@new.com" {
		t.Fatalf("update failed: %+v", after)
	}
}

func TestDeleteApplicant(t *testing.T) {
	app, db := setupApp(t)

	id := mustCreate(t, db, &model.Applicant{
		FirstName:          "Eve",
		LastName:           "Temp",
		Email:              "eve@temp.com",
		Address:            "Temp Street",
		Phonenumber:        "666",
		HighSchool_Program: "Science",
		PortfolioURL:       "http://eve.com",
		FamilyIncome:       9000,
	})

	resp, body := perform(app, http.MethodGet, fmt.Sprintf("/recruit/DeleteApplicant/%d", id), nil)
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
	if !deleteResp.IsSuccess || deleteResp.Result != "Applicant deleted successfully" {
		t.Fatalf("unexpected response: %+v", deleteResp)
	}

	var cnt int64
	if err := db.Model(&model.Applicant{}).Where("id = ?", id).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
