package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipRegistrationHandler struct {
	DB          *gorm.DB
	Application *core.ModEdApplication
}

func NewInternshipRegistrationHandler(db *gorm.DB, app *core.ModEdApplication) *InternshipRegistrationHandler {
	return &InternshipRegistrationHandler{
		DB:          db,
		Application: app,
	}
}

func (controller *InternshipRegistrationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipRegistration")
}

func (controller *InternshipRegistrationHandler) GetInternshipRegistration(context *fiber.Ctx) error {
	var registrations []model.InternshipRegistration

	if err := controller.DB.Preload("Student.Student").Preload("Company").Find(&registrations).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get internship registration",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    registrations,
	})
}

func (controller *InternshipRegistrationHandler) CreateInternshipRegistration(context *fiber.Ctx) error {
	var newRegistration model.InternshipRegistration

	if err := context.BodyParser(&newRegistration); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newRegistration).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create registration",
		})
	}

	// Load related data
	controller.DB.Preload("Student.Student").Preload("Company").First(&newRegistration, newRegistration.ID)

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newRegistration,
	})
}

func (controller *InternshipRegistrationHandler) GetInternshipRegistrationById(context *fiber.Ctx) error {
	id := context.Params("id")
	var registration model.InternshipRegistration

	if err := controller.DB.Preload("Student.Student").Preload("Company").First(&registration, id).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get internship registration",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    registration,
	})
}

func (controller *InternshipRegistrationHandler) UpdateInternshipRegistrationById(context *fiber.Ctx) error {
	id := context.Params("id")
	var registration model.InternshipRegistration

	if err := controller.DB.First(&registration, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship registration not found",
		})
	}

	var updateData model.InternshipRegistration

	if err := context.BodyParser(&updateData); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	// Update only the fields that are sent
	if updateData.StudentId != 0 {
		registration.StudentId = updateData.StudentId
	}
	if updateData.CompanyId != 0 {
		registration.CompanyId = updateData.CompanyId
	}
	if !updateData.TurninDate.IsZero() {
		registration.TurninDate = updateData.TurninDate
	}
	if updateData.ApprovalUniversityStatus != "" {
		registration.ApprovalUniversityStatus = updateData.ApprovalUniversityStatus
	}
	if updateData.ApprovalCompanyStatus != "" {
		registration.ApprovalCompanyStatus = updateData.ApprovalCompanyStatus
	}

	if err := controller.DB.Save(&registration).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update internship registration",
		})
	}

	// Reload with preloaded data
	if err := controller.DB.Preload("Student.Student").Preload("Company").First(&registration, registration.ID).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to reload updated registration",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    registration,
	})
}

func (controller *InternshipRegistrationHandler) DeleteInternshipRegistrationById(context *fiber.Ctx) error {
	id := context.Params("id")
	var registration model.InternshipRegistration

	if err := controller.DB.First(&registration, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship registration not found",
		})
	}

	if err := controller.DB.Delete(&registration).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete internship registration",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "internship registration deleted successfully",
	})
}
