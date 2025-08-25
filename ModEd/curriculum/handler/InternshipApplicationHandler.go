package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type InternshipApplicationHandler struct{}

func (controller *InternshipApplicationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipApplication")
}

func (controller *InternshipApplicationHandler) GetInternshipApplication(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/Application.csv"
	ApplicationMapper, err := core.CreateMapper[model.InternshipApplication](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get application",
		})
	}

	Companies := ApplicationMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Companies,
	})
}
