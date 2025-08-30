package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CompanyHandler struct {
	DB *gorm.DB
}

func (controller *CompanyHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Company")
}

func (controller *CompanyHandler) GetAllCompany(context *fiber.Ctx) error {
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

func (controller *CompanyHandler) GetCompanyByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var company model.Company

	if err := controller.DB.First(&company, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "company not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    company,
	})
}

func (controller *CompanyHandler) UpdateCompanyByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var company model.Company

	if err := controller.DB.First(&company, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "company not found",
		})
	}

	var updateCompany model.Company

	if err := context.BodyParser(&updateCompany); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	company.CompanyName = updateCompany.CompanyName
	company.CompanyAddress = updateCompany.CompanyAddress

	if err := controller.DB.Save(&company).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update company",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    company,
	})
}

func (controller *CompanyHandler) DeleteCompanyByID(context *fiber.Ctx) error {
	id := context.Params("id")
	fmt.Println(id)

	var company model.Company

	if err := controller.DB.First(&company, id).Error; err != nil {
		fmt.Print(err)
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "company not found",
		})
	}

	if err := controller.DB.Delete(&company, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete company",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "successfully deleted company",
	})
}
