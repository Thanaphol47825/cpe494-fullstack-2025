package handler

import (
	"ModEd/project/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type SeniorProjectHandler struct {
	DB *gorm.DB
}

func NewSeniorProjectHandler() *SeniorProjectHandler {
	return &SeniorProjectHandler{}
}

func (h *SeniorProjectHandler) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Hello project/seniorproject")
}

// POST /project/seniorproject/createProject
func (h *SeniorProjectHandler) CreateProject(c *fiber.Ctx) error {
	var payload *model.SeniorProject
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Create(payload).Error; err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "SeniorProject created successfully",
	})
}

// GET /project/seniorproject/getProject/:id
func (h *SeniorProjectHandler) GetProjectById(c *fiber.Ctx) error {
	id := c.Params("id")
	var sp model.SeniorProject
	// Preload relations if you want full detail; remove Preload(...) if you prefer minimal
	if err := h.DB.
		Preload("AdvisorAjarn").
		Preload("Members").
		Preload("Committees").
		Preload("Assignments").
		Preload("Presentations").
		Preload("Reports").
		Preload("Assessment").
		First(&sp, id).Error; err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}
	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    sp,
	})
}

// GET /project/seniorproject/getProjects
func (h *SeniorProjectHandler) GetProjects(c *fiber.Ctx) error {
	var list []model.SeniorProject
	if err := h.DB.Find(&list).Error; err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    list,
	})
}

// POST /project/seniorproject/updateProject
// Expect body with ID set (same pattern as your friend’s UpdateClass)
func (h *SeniorProjectHandler) UpdateProject(c *fiber.Ctx) error {
	var payload *model.SeniorProject
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Save(payload).Error; err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to update senior project",
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "SeniorProject updated successfully",
	})
}

// GET /project/seniorproject/deleteProject/:id
func (h *SeniorProjectHandler) DeleteProject(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.SeniorProject{}, id).Error; err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete senior project",
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "SeniorProject deleted successfully",
	})
}
