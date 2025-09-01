package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipResultEvaluationHandler struct {
	DB *gorm.DB
}

func (controller *InternshipResultEvaluationHandler) RenderMain(c *fiber.Ctx) error {
	return c.SendString("Hello curriculum/InternshipResultEvaluation")
}

func (controller *InternshipResultEvaluationHandler) GetAllInternshipResultEvaluation(c *fiber.Ctx) error {
	
	filePath := "/workspace/ModEd/curriculum/data/internship/ResultEvaluation.csv"

	mapper, err := core.CreateMapper[model.InternshipResultEvaluation](filePath)
	if err != nil {
		return c.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get result evaluation",
		})
	}

	items := mapper.Deserialize()
	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    items,
	})
}

func (controller *InternshipResultEvaluationHandler) CreateInternshipResultEvaluation(c *fiber.Ctx) error {
	var payload model.InternshipResultEvaluation
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if payload.Score > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "score must be between 0-100",
		})
	}
	if payload.InternshipInformationId == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "InternshipInformationId is required",
		})
	}

	if err := controller.DB.Create(&payload).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create result evaluation",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    payload,
	})
}

func (controller *InternshipResultEvaluationHandler) GetInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var item model.InternshipResultEvaluation
	if err := controller.DB.Preload("InternshipInformation").First(&item, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "result evaluation not found",
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    item,
	})
}

func (controller *InternshipResultEvaluationHandler) UpdateInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.InternshipResultEvaluation
	if err := controller.DB.First(&existing, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "result evaluation not found",
		})
	}

	var payload model.InternshipResultEvaluation
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	existing.Comment = payload.Comment
	existing.Score = payload.Score
	if payload.InternshipInformationId != 0 {
		existing.InternshipInformationId = payload.InternshipInformationId
	}

	if existing.Score > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "score must be between 0-100",
		})
	}

	if err := controller.DB.Save(&existing).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update result evaluation",
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existing,
	})
}

func (controller *InternshipResultEvaluationHandler) DeleteInternshipResultEvaluationByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var item model.InternshipResultEvaluation
	if err := controller.DB.First(&item, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "result evaluation not found",
		})
	}

	if err := controller.DB.Delete(&item, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete result evaluation",
		})
	}

	return c.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "successfully deleted result evaluation",
	})
}
