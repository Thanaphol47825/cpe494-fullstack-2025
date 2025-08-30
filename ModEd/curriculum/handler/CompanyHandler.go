package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CompanyHandler struct {
	DB *gorm.DB
}

func (controller *CompanyHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Company")
}

func (controller *CompanyHandler) GetCompany(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/company.csv"
	CompanyMapper, err := core.CreateMapper[model.Company](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get company",
		})
	}

	Companies := CompanyMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Companies,
	})
}

func (controller *CompanyHandler) CreateCompany(context *fiber.Ctx) error {
	var newCompany model.Company

	if err := context.BodyParser(&newCompany); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newCompany).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create company",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newCompany,
	})
}
