package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type CompanyHandler struct{}

func (controller *CompanyHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Company")
}

func (controller *CompanyHandler) GetCompany(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/company.json"
	CompanyMapper, err := utils.CreateMapper[model.Company](filePath)
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
