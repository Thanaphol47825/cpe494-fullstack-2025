package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type CoursePlanHandler struct{}

func NewCoursePlanHandler() *CoursePlanHandler {
	return &CoursePlanHandler{}
}

func (h *CoursePlanHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Course Plan Main Page")
}

func (h *CoursePlanHandler) GetCoursePlan(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/curriculum/coursePlan.json"

	CoursePlansMapper, err := utils.CreateMapper[model.CoursePlan](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums course plan",
		})
	}

	CoursePlans := CoursePlansMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    CoursePlans,
	})
}
