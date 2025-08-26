package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type SupervisorReviewHandler struct{}

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
