package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type AdvisorHandler struct{}

func (controller *AdvisorHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Advisor")
}

func (controller *AdvisorHandler) GetAdvisor(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/Advisor.json"
	AdvisorMapper, err := utils.CreateMapper[model.Advisor](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get advisor",
		})
	}

	Advisors := AdvisorMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Advisors,
	})
}
