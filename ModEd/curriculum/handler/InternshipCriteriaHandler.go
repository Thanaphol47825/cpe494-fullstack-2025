package handler

import (
	"ModEd/curriculum/model"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipCriteriaHandler struct {
	DB *gorm.DB
}

func NewInternshipCriteriaHandler() *InternshipCriteriaHandler {
	return &InternshipCriteriaHandler{}
}

func (controller *InternshipCriteriaHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipCriteria")
}

func (c *InternshipCriteriaHandler) GetInternshipCriterias(context *fiber.Ctx) error {
	var criterias []model.InternshipCriteria

	if err := c.DB.Preload("InternshipApplication").Find(&criterias).Error; err != nil {
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
	if err := c.DB.Preload("InternshipApplication").First(&criteria, id).Error; err != nil {
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
	if payload.InternshipApplicationId != 0 {
		existing.InternshipApplicationId = payload.InternshipApplicationId
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
