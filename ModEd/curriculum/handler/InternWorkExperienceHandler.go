package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"fmt"

	"github.com/gofiber/fiber/v2"
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

	// Resolve company name to ID if provided
	if err := newInternWorkExperience.ResolveCompanyName(controller.DB); err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to resolve company: " + err.Error(),
		})
	}

	if err := controller.DB.Create(&newInternWorkExperience).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create intern work experience",
		})
	}

	controller.DB.Preload("Company").First(&newInternWorkExperience, newInternWorkExperience.ID)

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newInternWorkExperience,
	})
}

func (controller *InternWorkExperienceHandler) GetInternWorkExperienceByID(context *fiber.Ctx) error {
	id := context.Params("id")

	var internWorkExperience model.InternWorkExperience

	if err := controller.DB.Preload("Company").First(&internWorkExperience, id).Error; err != nil {
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

	// Resolve company name to ID if provided
	if err := updateInternWorkExperience.ResolveCompanyName(controller.DB); err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to resolve company: " + err.Error(),
		})
	}

	// Update fields
	if updateInternWorkExperience.CompanyId != 0 {
		internWorkExperience.CompanyId = updateInternWorkExperience.CompanyId
	}
	if updateInternWorkExperience.Detail != "" {
		internWorkExperience.Detail = updateInternWorkExperience.Detail
	}
	if !updateInternWorkExperience.StartDate.IsZero() {
		internWorkExperience.StartDate = updateInternWorkExperience.StartDate
	}
	if !updateInternWorkExperience.EndDate.IsZero() {
		internWorkExperience.EndDate = updateInternWorkExperience.EndDate
	}

	if err := controller.DB.Save(&internWorkExperience).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update intern work experience",
		})
	}

	// Load with company data for response
	controller.DB.Preload("Company").First(&internWorkExperience, internWorkExperience.ID)

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

func (controller *InternWorkExperienceHandler) GetInternWorkExperienceByStudentID(context *fiber.Ctx) error {
	studentId := context.Params("student_id")

	var internWorkExperiences []model.InternWorkExperience

	if err := controller.DB.Where("student_id = ?", studentId).Preload("Company").Find(&internWorkExperiences).Error; err != nil {
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
