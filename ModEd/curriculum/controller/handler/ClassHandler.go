package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type ClassHandler struct {
	Application *core.ModEdApplication
}

func NewClassHandler() *ClassHandler {
	return &ClassHandler{}
}

func (h *ClassHandler) RenderClassForm(c *fiber.Ctx) error {
	path := filepath.Join(h.Application.RootPath, "curriculum", "view", "Class.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to load template",
		})
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Curriculum",
		"RootURL": h.Application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (h *ClassHandler) CreateClass(context *fiber.Ctx) error {
	var payload *model.Class
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class created successfully",
	})
}

func (h *ClassHandler) GetClassById(context *fiber.Ctx) error {
	id := context.Params("id")
	var class model.Class
	if err := h.Application.DB.Preload("Course").First(&class, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    class,
	})
}

func (h *ClassHandler) GetClasses(context *fiber.Ctx) error {
	var classes []model.Class
	if err := h.Application.DB.Preload("Course.Curriculum.Department").Order("id ASC").Find(&classes).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classes,
	})
}

func (h *ClassHandler) UpdateClass(context *fiber.Ctx) error {
	var payload *model.Class
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.Application.DB.Save(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to update class material",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class updated successfully",
	})
}

func (h *ClassHandler) DeleteClass(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.Application.DB.Delete(&model.Class{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete class",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class deleted successfully",
	})
}

func (h *ClassHandler) GetClassOptions(context *fiber.Ctx) error {
	var classes []model.Class
	var results []map[string]any
	if err := h.Application.DB.Preload("Course").Order("id ASC").Find(&classes).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get classes",
		})
	}
	for _, class := range classes {
		results = append(results, map[string]any{
			"value": class.ID,
			"label": class.Course.Name[:6] + " | " + class.Schedule.Format("2006-01-02 15:04"),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    results,
	})
}
