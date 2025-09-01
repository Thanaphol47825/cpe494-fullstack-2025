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

func setupAdminApp(t *testing.T) (*fiber.App, *gorm.DB) {
	t.Helper()

	db := openTestDB(t)

	if err := db.AutoMigrate(&recruitModel.Admin{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	truncateTable(t, db, "admins")
	t.Cleanup(func() { truncateTable(t, db, "admins") })

	appCore := &core.ModEdApplication{DB: db}
	ctl := controller.NewAdminController()
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

func performAdminTest(app *fiber.App, method, url string, body any) (*http.Response, []byte) {
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

func TestAdmin_Create(t *testing.T) {
	app, db := setupAdminApp(t)

	dto := map[string]any{
		"Username": "alice",
		"Password": "secret",
	}

	resp, body := performAdminTest(app, http.MethodPost, "/recruit/CreateAdmin", dto)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create status=%d body=%s", resp.StatusCode, string(body))
	}

	var created recruitModel.Admin
	if err := json.Unmarshal(body, &created); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if created.Username != "alice" {
		t.Fatalf("unexpected create resp: %+v", created)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Admin{}).Where("username = ?", "alice").Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 1 {
		t.Fatalf("expected alice inserted, got %d", cnt)
	}
}

func TestAdmin_GetAll_And_GetByID(t *testing.T) {
	app, db := setupAdminApp(t)

	a1 := &recruitModel.Admin{Username: "bob", Password: "p1"}
	a2 := &recruitModel.Admin{Username: "charlie", Password: "p2"}
	if err := db.Create(a1).Error; err != nil {
		t.Fatalf("seed a1: %v", err)
	}
	if err := db.Create(a2).Error; err != nil {
		t.Fatalf("seed a2: %v", err)
	}

	resp, body := performAdminTest(app, http.MethodGet, "/recruit/GetAllAdmin", nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get all status=%d body=%s", resp.StatusCode, string(body))
	}
	var list []recruitModel.Admin
	if err := json.Unmarshal(body, &list); err != nil {
		t.Fatalf("unmarshal list: %v", err)
	}
	if len(list) != 2 {
		t.Fatalf("expected 2 admins, got %d", len(list))
	}

	resp, body = performAdminTest(app, http.MethodGet, fmt.Sprintf("/recruit/GetAdmin/%d", a1.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("get by id status=%d body=%s", resp.StatusCode, string(body))
	}
	var one recruitModel.Admin
	if err := json.Unmarshal(body, &one); err != nil {
		t.Fatalf("unmarshal one: %v", err)
	}
	if one.Username != "bob" {
		t.Fatalf("expected bob, got %+v", one)
	}
}

func TestAdmin_Update(t *testing.T) {
	app, db := setupAdminApp(t)

	seed := &recruitModel.Admin{Username: "david", Password: "old"}
	if err := db.Create(seed).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	dto := map[string]any{
		"ID":       seed.ID,
		"Username": "david",
		"Password": "newpass",
	}
	resp, body := performAdminTest(app, http.MethodPost, "/recruit/UpdateAdmi", dto)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("update status=%d body=%s", resp.StatusCode, string(body))
	}
	var updated recruitModel.Admin
	if err := json.Unmarshal(body, &updated); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if updated.Password != "newpass" {
		t.Fatalf("unexpected update resp: %+v", updated)
	}

	var after recruitModel.Admin
	if err := db.First(&after, seed.ID).Error; err != nil {
		t.Fatalf("fetch after: %v", err)
	}
	if after.Password != "newpass" {
		t.Fatalf("update failed: %+v", after)
	}
}

func TestAdmin_Delete(t *testing.T) {
	app, db := setupAdminApp(t)

	seed := &recruitModel.Admin{Username: "eve", Password: "tmp"}
	if err := db.Create(seed).Error; err != nil {
		t.Fatalf("seed: %v", err)
	}

	resp, body := performAdminTest(app, http.MethodGet, fmt.Sprintf("/recruit/DeleteAdmin/%d", seed.ID), nil)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("delete status=%d body=%s", resp.StatusCode, string(body))
	}

	var msg struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(body, &msg); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if msg.Message != "Admin deleted successfully" {
		t.Fatalf("unexpected delete message: %+v", msg)
	}

	var cnt int64
	if err := db.Model(&recruitModel.Admin{}).Where("id = ?", seed.ID).Count(&cnt).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	if cnt != 0 {
		t.Fatalf("record not deleted, count=%d", cnt)
	}
}
