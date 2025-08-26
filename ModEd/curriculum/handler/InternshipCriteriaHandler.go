package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type InternshipCriteriaHandler struct{}

func NewInternshipCriteriaHandler() *InternshipCriteriaHandler {
	return &InternshipCriteriaHandler{}
}

func (controller *InternshipCriteriaHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipCriteria")
}

func (c *InternshipCriteriaHandler) GetInternshipCriterias(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/curriculum/InternshipCriteria.json"
	criteriaMapper, err := core.CreateMapper[model.InternshipCriteria](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get criteria",
		})
	}
	criteria := criteriaMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    criteria,
	})
}
