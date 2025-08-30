package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipApplicationHandler struct {
	DB *gorm.DB
}

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

	Applications := ApplicationMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Applications,
	})
}

func (controller *InternshipApplicationHandler) CreateInternshipApplication(context *fiber.Ctx) error {
	var newApplication model.InternshipApplication

	if err := context.BodyParser(&newApplication); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newApplication).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create application",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newApplication,
	})
}
