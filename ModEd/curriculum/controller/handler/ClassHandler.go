package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type ClassHandler struct{}

func NewClassHandler() *ClassHandler {
	return &ClassHandler{}
}

func (h *ClassHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Class")
}

func (h *ClassHandler) GetClasses(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/curriculum/class.json"
	classMapper, err := utils.CreateMapper[model.Class](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get classes",
		})
	}

	classes := classMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classes,
	})
}
