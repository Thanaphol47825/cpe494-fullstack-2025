package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"ModEd/core"
	"ModEd/recruit/controller"
	recruitModel "ModEd/recruit/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func setupApplicationRoundApp(t *testing.T) (*fiber.App, *gorm.DB) {
	t.Helper()
	db := openTestDB(t)
	if err := db.AutoMigrate(&recruitModel.ApplicationRound{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	truncateTable(t, db, "application_rounds")
	t.Cleanup(func() { truncateTable(t, db, "application_rounds") })

	appCore := &core.ModEdApplication{DB: db}
	ctl := controller.NewApplicationRoundController()
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

func performAppRoundTest(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
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

func TestApplicationRoundCreate(t *testing.T) {
	app, _ := setupApplicationRoundApp(t)
	createDTO := map[string]any{
		"round_name": "First Round",
	}
	resp, body := performAppRoundTest(app, http.MethodPost, "/recruit/CreateApplicationRound", createDTO)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var createResp struct {
		IsSuccess bool                        `json:"isSuccess"`
		Result    recruitModel.ApplicationRound `json:"result"`
	}
	if err := json.Unmarshal(body, &createResp); err != nil {
		t.Fatalf("unmarshal create: %v", err)
	}
	if !createResp.IsSuccess || createResp.Result.RoundName != "First Round" {
		t.Fatalf("unexpected create resp: %+v", createResp)
	}
}

func TestApplicationRoundGet(t *testing.T) {
	app, db := setupApplicationRoundApp(t)
	round := recruitModel.ApplicationRound{RoundName: "Round A"}
	if err := db.Create(&round).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	resp, body := performAppRoundTest(app, http.MethodGet, "/recruit/GetApplicationRounds", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}
	var getAllResp struct {
		IsSuccess bool                          `json:"isSuccess"`
		Result    []recruitModel.ApplicationRound `json:"result"`
	}
	if err := json.Unmarshal(body, &getAllResp); err != nil {
		t.Fatalf("unmarshal getAll: %v", err)
	}
	if !getAllResp.IsSuccess || len(getAllResp.Result) != 1 {
		t.Fatalf("unexpected getAll resp: %+v", getAllResp)
	}

	resp, body = performAppRoundTest(app, http.MethodGet, fmt.Sprintf("/recruit/GetApplicationRound/%d", round.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}
	var getByIDResp struct {
		IsSuccess bool                        `json:"isSuccess"`
		Result    recruitModel.ApplicationRound `json:"result"`
	}
	if err := json.Unmarshal(body, &getByIDResp); err != nil {
		t.Fatalf("unmarshal getByID: %v", err)
	}
	if !getByIDResp.IsSuccess || getByIDResp.Result.ID != round.ID {
		t.Fatalf("unexpected getByID resp: %+v", getByIDResp)
	}
}

func TestApplicationRoundUpdate(t *testing.T) {
	app, db := setupApplicationRoundApp(t)
	round := recruitModel.ApplicationRound{RoundName: "Old Round"}
	if err := db.Create(&round).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	updateDTO := map[string]any{
		"id":         round.ID,
		"round_name": "Updated Round",
	}
	resp, body := performAppRoundTest(app, http.MethodPost, "/recruit/UpdateApplicationRound", updateDTO)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}
	var updateResp struct {
		IsSuccess bool                        `json:"isSuccess"`
		Result    recruitModel.ApplicationRound `json:"result"`
	}
	if err := json.Unmarshal(body, &updateResp); err != nil {
		t.Fatalf("unmarshal update: %v", err)
	}
	if !updateResp.IsSuccess || updateResp.Result.RoundName != "Updated Round" {
		t.Fatalf("unexpected update resp: %+v", updateResp)
	}
}

func TestApplicationRoundDelete(t *testing.T) {
	app, db := setupApplicationRoundApp(t)
	round := recruitModel.ApplicationRound{RoundName: "To Delete"}
	if err := db.Create(&round).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	deleteDTO := map[string]any{"id": round.ID}
	resp, body := performAppRoundTest(app, http.MethodPost, "/recruit/DeleteApplicationRound", deleteDTO)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete status=%d body=%s", resp.StatusCode, string(body))
	}
	var deleteResp struct {
		IsSuccess bool   `json:"isSuccess"`
		Result    string `json:"result"`
	}
	if err := json.Unmarshal(body, &deleteResp); err != nil {
		t.Fatalf("unmarshal delete: %v", err)
	}
	if !deleteResp.IsSuccess || deleteResp.Result != "Delete successful" {
		t.Fatalf("unexpected delete resp: %+v", deleteResp)
	}

	var cnt int64
	if err := db.Model(&recruitModel.ApplicationRound{}).Where("id = ?", round.ID).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
