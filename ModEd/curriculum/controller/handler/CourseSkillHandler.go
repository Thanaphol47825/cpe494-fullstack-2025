package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type CourseSkillHandler struct {
	// DB       *gorm.DB
	Application *core.ModEdApplication
}

func NewCourseSkillHandler() *CourseSkillHandler {
	return &CourseSkillHandler{}
}

func (h *CourseSkillHandler) RenderCreateForm(c *fiber.Ctx) error {
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

func (h *CourseSkillHandler) CreateCourseSkill(context *fiber.Ctx) error {
	var payload *model.CourseSkill
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to create course skill",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

func (h *CourseSkillHandler) CreateMultipleCourseSkill(context *fiber.Ctx) error {
	var payload []model.CourseSkill
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to create course skill",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

func (h *CourseSkillHandler) GetCourseSkill(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.CourseSkill
	if err := h.Application.DB.Preload("Course").Preload("Skill").Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get course skill",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

// Read all
func (h *CourseSkillHandler) GetCourseSkills(context *fiber.Ctx) error {
	var courseSkills []model.CourseSkill
	if err := h.Application.DB.Preload("Course").Preload("Skill").Find(&courseSkills).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get course skills",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    courseSkills,
	})
}

func (h *CourseSkillHandler) GetSkillsByCourse(c *fiber.Ctx) error {
	courseId, err := c.ParamsInt("courseId")
	if err != nil || courseId <= 0 {
		return c.JSON(fiber.Map{"isSuccess": false, "result": "invalid courseId"})
	}

	type Row struct{ Name string }
	var rows []Row

	if err := h.Application.DB.
		Table("skills").
		Select("skills.name AS name").
		Joins("JOIN course_skills cs ON cs.skill_id = skills.id").
		Where("cs.course_id = ? AND cs.deleted_at IS NULL AND skills.deleted_at IS NULL", courseId).
		Order("skills.name ASC").
		Scan(&rows).Error; err != nil {
		return c.JSON(fiber.Map{"isSuccess": false, "result": "failed to query skills"})
	}

	names := make([]string, 0, len(rows))
	for _, r := range rows {
		names = append(names, r.Name)
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result": fiber.Map{
			"CourseId":   courseId,
			"SkillNames": names,
			"SkillLabel": strings.Join(names, ", "),
		},
	})
}

// Update
func (h *CourseSkillHandler) UpdateCourseSkill(context *fiber.Ctx) error {
	var payload *model.CourseSkill
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
func (h *CourseSkillHandler) DeleteCourseSkill(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	result := h.Application.DB.Where("id = ?", id).Delete(&model.CourseSkill{})
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
