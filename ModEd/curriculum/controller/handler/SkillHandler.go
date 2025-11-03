package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/http"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type SkillHandler struct {
	// DB       *gorm.DB
	Application *core.ModEdApplication
}

func NewSkillHandler() *SkillHandler {
	return &SkillHandler{}
}

func (h *SkillHandler) RenderCreateForm(c *fiber.Ctx) error {
	path := filepath.Join(h.Application.RootPath, "skill", "view", "Skill.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to load template",
		})
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Create Skill",
		"RootURL": h.Application.RootURL,
	})
	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(rendered)
}

func (h *SkillHandler) CreateSkill(context *fiber.Ctx) error {
	var payload *model.Skill
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to create skill",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

func (h *SkillHandler) GetSkill(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.Skill
	if err := h.Application.DB.Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get skill",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

// Read all
func (h *SkillHandler) GetSkills(context *fiber.Ctx) error {
	var skills []model.Skill
	if err := h.Application.DB.Find(&skills).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get skills",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    skills,
	})
}

// Update
func (h *SkillHandler) UpdateSkill(context *fiber.Ctx) error {
	var payload *model.Skill
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	result := h.Application.DB.Model(payload).Where("id = ?", payload.ID).Updates(payload)
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

// Delete
func (h *SkillHandler) DeleteSkill(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	result := h.Application.DB.Where("id = ?", id).Delete(&model.Skill{})
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}
