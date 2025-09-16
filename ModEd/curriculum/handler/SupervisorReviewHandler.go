package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type SupervisorReviewHandler struct{
	DB *gorm.DB
}

func NewSupervisorReviewHandler() *SupervisorReviewHandler {
	return &SupervisorReviewHandler{}
}

func (controller *SupervisorReviewHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/SupervisorReview")
}

func (c *SupervisorReviewHandler) GetSupervisorReviews(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/SupervisorReview.csv"
	supervisorReviewMapper, err := core.CreateMapper[model.SupervisorReview](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get supervisor review",
		})
	}
	supervisorReview := supervisorReviewMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    supervisorReview,
	})
}

func (c *SupervisorReviewHandler) CreateSupervisorReview(context *fiber.Ctx) error {
	var newSupervisorReview model.SupervisorReview

	if err := context.BodyParser(&newSupervisorReview); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := c.DB.Create(&newSupervisorReview).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create supervisor review",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newSupervisorReview,
	})
}

func (c *SupervisorReviewHandler) GetSupervisorReviewByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var SupervisorReview model.SupervisorReview

	if err := c.DB.First(&SupervisorReview, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "supervisor review not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    SupervisorReview,
	})
}

func (c *SupervisorReviewHandler) UpdateSupervisorReviewByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var SupervisorReview model.SupervisorReview

	if err := c.DB.First(&SupervisorReview, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "supervisor review not found",
		})
	}

	var updatedData model.SupervisorReview
	if err := context.BodyParser(&updatedData); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}	
	if err := c.DB.Model(&SupervisorReview).Updates(updatedData).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update supervisor review",
		})
	}	
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    SupervisorReview,
	})
}	

func (c *SupervisorReviewHandler) DeleteSupervisorReviewByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var SupervisorReview model.SupervisorReview

	if err := c.DB.First(&SupervisorReview, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "supervisor review not found",
		})
	}

	if err := c.DB.Delete(&SupervisorReview).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete supervisor review",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "supervisor review deleted successfully",
	})
}
