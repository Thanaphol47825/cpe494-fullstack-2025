package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternStudentSkillHandler struct {
	DB *gorm.DB
}

func NewInternStudentSkillHandler(app *core.ModEdApplication) *InternStudentSkillHandler {
	return &InternStudentSkillHandler{DB: app.DB}
}

func (h *InternStudentSkillHandler) GetInternStudentSkill(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		var list []model.InternStudentSkill
		if err := h.DB.Preload("Student").Preload("Skill").Find(&list).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch student skills",
			})
		}
		return c.JSON(fiber.Map{"isSuccess": true, "result": list})
	}

	var item model.InternStudentSkill
	if err := h.DB.Preload("Student").Preload("Skill").First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student skill not found",
		})
	}

	return c.JSON(fiber.Map{"isSuccess": true, "result": item})
}

// POST /curriculum/CreateInternStudentSkill
func (h *InternStudentSkillHandler) CreateInternStudentSkill(c *fiber.Ctx) error {
	var body model.InternStudentSkill
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"isSuccess": false, "error": "invalid body"})
	}

	// ป้องกันซ้ำ StudentID + SkillID
	var exists model.InternStudentSkill
	if err := h.DB.Where("student_id = ? AND skill_id = ?", body.StudentID, body.SkillID).First(&exists).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student skill already exists",
		})
	}

	if err := h.DB.Create(&body).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"isSuccess": false, "error": "create failed"})
	}

	var result model.InternStudentSkill
	h.DB.Preload("Student").Preload("Skill").First(&result, body.ID)
	return c.Status(201).JSON(fiber.Map{"isSuccess": true, "result": result})
}

// POST /curriculum/UpdateInternStudentSkill/:id
func (h *InternStudentSkillHandler) UpdateInternStudentSkill(c *fiber.Ctx) error {
	id := c.Params("id")

	var input model.InternStudentSkill
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"isSuccess": false, "error": "invalid body"})
	}

	var existing model.InternStudentSkill
	if err := h.DB.First(&existing, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"isSuccess": false, "error": "not found"})
	}

	data := map[string]interface{}{}
	if input.StudentID != 0 {
		data["student_id"] = input.StudentID
	}
	if input.SkillID != 0 {
		data["skill_id"] = input.SkillID
	}
	if input.Level != 0 {
		data["level"] = input.Level
	}

	if err := h.DB.Model(&existing).Updates(data).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"isSuccess": false, "error": "update failed"})
	}

	var updated model.InternStudentSkill
	h.DB.Preload("Student").Preload("Skill").First(&updated, id)
	return c.JSON(fiber.Map{"isSuccess": true, "result": updated})
}

// POST /curriculum/DeleteInternStudentSkill/:id
func (h *InternStudentSkillHandler) DeleteInternStudentSkill(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.InternStudentSkill
	if err := h.DB.First(&existing, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"isSuccess": false, "error": "not found"})
	}

	if err := h.DB.Delete(&existing).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"isSuccess": false, "error": "delete failed"})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result": fiber.Map{
			"message": "deleted successfully",
			"id":      existing.ID,
		},
	})
}
