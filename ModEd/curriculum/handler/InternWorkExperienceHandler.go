package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
	"gorm.io/gorm"
)

type InternWorkExperienceHandler struct {
	DB          *gorm.DB
	Application *core.ModEdApplication
}

func NewInternWorkExperienceHandler(db *gorm.DB, app *core.ModEdApplication) *InternWorkExperienceHandler {
	return &InternWorkExperienceHandler{
		DB:          db,
		Application: app,
	}
}

func (controller *InternWorkExperienceHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternWorkExperience")
}

func (controller *InternWorkExperienceHandler) GetAllInternWorkExperience(context *fiber.Ctx) error {
	var internWorkExperiences []model.InternWorkExperience

	if err := controller.DB.Find(&internWorkExperiences).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get intern work experiences",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internWorkExperiences,
	})
}

func (controller *InternWorkExperienceHandler) CreateInternWorkExperience(context *fiber.Ctx) error {
	var newInternWorkExperience model.InternWorkExperience

	if err := context.BodyParser(&newInternWorkExperience); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newInternWorkExperience).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create intern work experience",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newInternWorkExperience,
	})
}

func (controller *InternWorkExperienceHandler) RenderCreateInternWorkExperience(context *fiber.Ctx) error {
	fmt.Print(controller.Application)
	fmt.Print("\n===========================\n")
	// fmt.Print(controller.Application.RootPath)
	fmt.Print("\n========================\n\n\n")
	if controller.Application == nil {
		return context.SendStatus(fiber.StatusInternalServerError)
	}
	path := filepath.Join(controller.Application.RootPath, "curriculum", "view", "Company.tpl")
	template, err := mustache.ParseFile(path)
	if err != nil {
		return context.SendStatus(http.StatusInternalServerError)
	}
	rendered := template.Render(map[string]string{
		"title":   "ModEd Company",
		"RootURL": controller.Application.RootURL,
	})
	context.Set("Content-Type", "text/html")
	return context.SendString(rendered)
}

func (controller *InternWorkExperienceHandler) GetInternWorkExperienceByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var internWorkExperience model.InternWorkExperience

	if err := controller.DB.First(&internWorkExperience, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern work experience not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internWorkExperience,
	})
}

func (controller *InternWorkExperienceHandler) UpdateInternWorkExperienceByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var internWorkExperience model.InternWorkExperience

	if err := controller.DB.First(&internWorkExperience, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern work experience not found",
		})
	}

	var updateInternWorkExperience model.InternWorkExperience

	if err := context.BodyParser(&updateInternWorkExperience); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	internWorkExperience.CompanyId = updateInternWorkExperience.CompanyId
	internWorkExperience.Detail = updateInternWorkExperience.Detail
	internWorkExperience.StartDate = updateInternWorkExperience.StartDate
	internWorkExperience.EndDate = updateInternWorkExperience.EndDate

	if err := controller.DB.Save(&internWorkExperience).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update intern work experience",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internWorkExperience,
	})
}

func (controller *InternWorkExperienceHandler) DeleteInternWorkExperienceByID(context *fiber.Ctx) error {
	id := context.Params("id")
	fmt.Println(id)

	var internWorkExperience model.InternWorkExperience

	if err := controller.DB.First(&internWorkExperience, id).Error; err != nil {
		fmt.Print(err)
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern work experience not found",
		})
	}

	if err := controller.DB.Delete(&internWorkExperience, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete intern work experience",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "successfully deleted intern work experience",
	})
}
