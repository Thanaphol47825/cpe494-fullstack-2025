package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternSkillHandler struct {
	DB          *gorm.DB
	application *core.ModEdApplication
}

func NewInternSkillHandler(app *core.ModEdApplication) *InternSkillHandler {
	return &InternSkillHandler{
		DB:          app.DB,
		application: app,
	}
}

func (h *InternSkillHandler) RenderMain(ctx *fiber.Ctx) error {
	return ctx.SendString("Hello curriculum/InternSkill")
}

func (h *InternSkillHandler) GetInternSkill(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	if id == "" {
		var skills []model.InternSkill
		if err := h.DB.Find(&skills).Error; err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch intern skills",
			})
		}
		return ctx.JSON(fiber.Map{
			"isSuccess": true,
			"result":    skills,
		})
	}

	var skill model.InternSkill
	if err := h.DB.First(&skill, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern skill not found",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    skill,
	})
}

func (h *InternSkillHandler) CreateInternSkillRender(ctx *fiber.Ctx) error {
	path := filepath.Join(h.application.RootPath, "curriculum", "view", "InternSkill.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to parse template",
		})
	}
	rendered := template.Render(map[string]string{
		"title":   "ModEd - Intern Skill",
		"RootURL": h.application.RootURL,
	})
	ctx.Set("Content-Type", "text/html")
	return ctx.SendString(rendered)
}

func (h *InternSkillHandler) CreateInternSkill(ctx *fiber.Ctx) error {
	var body model.InternSkill
	if err := ctx.BodyParser(&body); err != nil {
		return ctx.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}
	if body.SkillName == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "skill_name is required",
		})
	}

	var dup model.InternSkill
	if err := h.DB.Where("skill_name = ?", body.SkillName).First(&dup).Error; err == nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "skill_name already exists",
		})
	}

	if err := h.DB.Create(&body).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create intern skill",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    body,
	})
}

func (h *InternSkillHandler) UpdateInternSkill(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var patch model.InternSkill

	if err := ctx.BodyParser(&patch); err != nil {
		return ctx.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to parse request body",
		})
	}

	var skill model.InternSkill
	if err := h.DB.First(&skill, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	if patch.SkillName != "" {
		// (ถ้าต้องการ unique) กันชื่อชน
		var exists model.InternSkill
		if err := h.DB.Where("skill_name = ? AND id <> ?", patch.SkillName, skill.ID).First(&exists).Error; err == nil {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "skill_name already exists",
			})
		}
		skill.SkillName = patch.SkillName
	}

	if err := h.DB.Save(&skill).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update intern skill",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    skill,
	})
}

func (h *InternSkillHandler) DeleteInternSkill(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	if err := h.DB.Delete(&model.InternSkill{}, "id = ?", id).Error; err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete intern skill",
		})
	}

	return ctx.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "intern skill deleted successfully",
	})
}
