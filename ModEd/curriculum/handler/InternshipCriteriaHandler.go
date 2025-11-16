package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternshipCriteriaHandler struct {
	DB          *gorm.DB
	Application *core.ModEdApplication
}

func NewInternshipCriteriaHandler() *InternshipCriteriaHandler {
	return &InternshipCriteriaHandler{}
}

func (c *InternshipCriteriaHandler) RenderMain(context *fiber.Ctx) error {
	path := filepath.Join(c.Application.RootPath, "curriculum", "view", "InternshipCriteria.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.SendStatus(http.StatusInternalServerError)
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Internship Criteria Management",
		"RootURL": c.Application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")
	return context.SendString(rendered)
}

func (c *InternshipCriteriaHandler) GetInternshipCriterias(context *fiber.Ctx) error {
	var criterias []model.InternshipCriteria

	if err := c.DB.Preload("InternshipRegistration").Find(&criterias).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get criterias",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criterias,
	})
}

func (c *InternshipCriteriaHandler) GetInternshipCriteriaByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var criteria model.InternshipCriteria
	if err := c.DB.Preload("InternshipRegistration").First(&criteria, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "internship criteria not found",
			})
		}
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get criteria",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criteria,
	})
}

func (c *InternshipCriteriaHandler) CreateInternshipCriteria(context *fiber.Ctx) error {
	var payload model.InternshipCriteria
	if err := context.BodyParser(&payload); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := c.DB.Create(&payload).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create criteria",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    payload,
	})
}

func (c *InternshipCriteriaHandler) UpdateInternshipCriteriaByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var existing model.InternshipCriteria
	if err := c.DB.First(&existing, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "cannot update because this ID does not exist",
		})
	}

	var payload model.InternshipCriteria
	if err := context.BodyParser(&payload); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	existing.Title = payload.Title
	existing.Description = payload.Description
	existing.Score = payload.Score
	if payload.InternshipRegistrationId != 0 {
		existing.InternshipRegistrationId = payload.InternshipRegistrationId
	}

	if err := c.DB.Save(&existing).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update criteria",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existing,
	})
}

func (c *InternshipCriteriaHandler) DeleteInternshipCriteriaByID(context *fiber.Ctx) error {
	id := context.Params("id")
	criteriaID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid criteria id",
		})
	}

	var existing model.InternshipCriteria
	if err := c.DB.First(&existing, criteriaID).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "cannot delete because this ID does not exist",
		})
	}

	if err := c.DB.Delete(&existing).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete criteria",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Deleted successfully",
	})
}
