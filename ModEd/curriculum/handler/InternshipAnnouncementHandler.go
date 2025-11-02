package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternshipAnnouncementHandler struct {
	DB          *gorm.DB
	application *core.ModEdApplication
}

func NewInternshipAnnouncementHandler(app *core.ModEdApplication) *InternshipAnnouncementHandler {
	return &InternshipAnnouncementHandler{
		DB:          app.DB,
		application: app,
	}
}

func (h *InternshipAnnouncementHandler) RenderMain(ctx *fiber.Ctx) error {
	return ctx.SendString("Hello curriculum/InternshipAnnouncement")
}

func (h *InternshipAnnouncementHandler) GetInternshipAnnouncement(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	if id == "" {
		var items []model.InternshipAnnouncement
		if err := h.DB.Order("date_start desc, id desc").Find(&items).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch internship announcements",
			})
		}
		return ctx.JSON(fiber.Map{
			"isSuccess": true,
			"result":    items,
		})
	}

	var item model.InternshipAnnouncement
	if err := h.DB.First(&item, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship announcement not found",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    item,
	})
}

func (h *InternshipAnnouncementHandler) CreateInternshipAnnouncementRender(ctx *fiber.Ctx) error {
	path := filepath.Join(h.application.RootPath, "curriculum", "view", "InternshipAnnouncement.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to parse template",
		})
	}
	rendered := template.Render(map[string]string{
		"title":   "ModEd - Internship Announcement",
		"RootURL": h.application.RootURL,
	})
	ctx.Set("Content-Type", "text/html")
	return ctx.SendString(rendered)
}

func (h *InternshipAnnouncementHandler) CreateInternshipAnnouncement(ctx *fiber.Ctx) error {
	var body model.InternshipAnnouncement
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	// validation
	if body.Topic == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "topic is required",
		})
	}
	if body.AuthorId <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "author_id must be positive",
		})
	}
	body.DateStart = toDateOnly(body.DateStart)
	body.DateEnd = toDateOnly(body.DateEnd)

	if body.DateStart.IsZero() || body.DateEnd.IsZero() {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "date_start and date_end are required",
		})
	}
	if body.DateEnd.Before(body.DateStart) {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "date_end must be on/after date_start",
		})
	}

	if err := h.DB.Create(&body).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create internship announcement",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    body,
	})
}

func (h *InternshipAnnouncementHandler) UpdateInternshipAnnouncement(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var patch model.InternshipAnnouncement

	if err := ctx.BodyParser(&patch); err != nil {
		return ctx.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	var item model.InternshipAnnouncement
	if err := h.DB.First(&item, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	// selective updates
	if patch.Topic != "" {
		item.Topic = patch.Topic
	}
	if patch.Description != "" {
		item.Description = patch.Description
	}
	if !patch.DateStart.IsZero() {
		item.DateStart = toDateOnly(patch.DateStart)
	}
	if !patch.DateEnd.IsZero() {
		item.DateEnd = toDateOnly(patch.DateEnd)
	}
	if patch.AuthorId > 0 {
		item.AuthorId = patch.AuthorId
	}

	if !item.DateStart.IsZero() && !item.DateEnd.IsZero() && item.DateEnd.Before(item.DateStart) {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "date_end must be on/after date_start",
		})
	}

	if err := h.DB.Save(&item).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update internship announcement",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    item,
	})
}

func (h *InternshipAnnouncementHandler) DeleteInternshipAnnouncement(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := h.DB.Delete(&model.InternshipAnnouncement{}, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete internship announcement",
		})
	}
	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "internship announcement deleted successfully",
	})
}

func toDateOnly(t time.Time) time.Time {
	if t.IsZero() {
		return t
	}
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, t.Location())
}
