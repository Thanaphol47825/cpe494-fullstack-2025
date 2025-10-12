package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/http"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	// "gorm.io/gorm"
)

type CoursePlanHandler struct {
	// DB *gorm.DB
	Application *core.ModEdApplication
}

func NewCoursePlanHandler() *CoursePlanHandler {
	return &CoursePlanHandler{}
}

// func (h *CoursePlanHandler) RenderMain(context *fiber.Ctx) error {
// 	return context.SendString("Course Plan Main Page")
// }

func (h *CoursePlanHandler) RenderCreateCoursePlan(c *fiber.Ctx) error {
	path := filepath.Join(h.Application.RootPath, "curriculum", "view", "CoursePlan.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.SendStatus(http.StatusInternalServerError)
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Course Plan",
		"RootURL": h.Application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (h *CoursePlanHandler) CreateCoursePlan(context *fiber.Ctx) error {
	var payload *model.CoursePlan
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// ensure any client-supplied ID is ignored so DB will assign an auto-increment value
	payload.ID = 0

	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to create course plan",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    payload,
		})
}

func (h *CoursePlanHandler) GetCoursePlanById(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.CoursePlan
	if err := h.Application.DB.Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculum",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

func (h *CoursePlanHandler) GetCoursePlans(context *fiber.Ctx) error {
	var coursePlans []model.CoursePlan
	if err := h.Application.DB.Find(&coursePlans).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get course plans",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    coursePlans,
	})

}

func (h *CoursePlanHandler) UpdateCoursePlan(context *fiber.Ctx) error {
	var payload *model.CoursePlan
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	var result = h.Application.DB.Model(payload).Where("id = ?", payload.ID).Updates(payload)
	if err := result.Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to update course plan",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    payload,
		})
}

func (h *CoursePlanHandler) DeleteCoursePlan(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.Application.DB.Delete(&model.CoursePlan{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete course plan",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "course plan deleted successfully",
	})
}
