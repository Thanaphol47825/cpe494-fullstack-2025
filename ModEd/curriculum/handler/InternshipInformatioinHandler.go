package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternshipInformationHandler struct {
	application *core.ModEdApplication
	DB          *gorm.DB
}

func NewInternshipInformationHandler(app *core.ModEdApplication) *InternshipInformationHandler {
	return &InternshipInformationHandler{
		application: app,
		DB:          app.DB,
	}
}

func (handler *InternshipInformationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipInformation")
}

// GET all internship informations
func (handler *InternshipInformationHandler) GetInternshipInformations(context *fiber.Ctx) error {
	var informations []model.InternshipInformation

	if err := handler.DB.Preload("InternStudent").Preload("InternshipCompany").Preload("InternshipMentor").Find(&informations).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get internship informations",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    informations,
	})
}

// GET internship information by ID
func (handler *InternshipInformationHandler) GetInternshipInformationByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var information model.InternshipInformation

	if err := handler.DB.Preload("InternStudent").Preload("InternshipCompany").Preload("InternshipMentor").First(&information, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "internship information not found",
			})
		}
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get internship information",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    information,
	})
}

// GET internship information by student ID
func (handler *InternshipInformationHandler) GetInternshipInformationByStudentID(context *fiber.Ctx) error {
	studentID := context.Params("student_id")
	var informations []model.InternshipInformation

	if err := handler.DB.Preload("InternStudent").Preload("InternshipCompany").Preload("InternshipMentor").Where("intern_student_id = ?", studentID).Find(&informations).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to get internship information for student",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    informations,
	})
}

// CREATE internship information
func (handler *InternshipInformationHandler) CreateInternshipInformation(context *fiber.Ctx) error {
	var newInformation model.InternshipInformation

	if err := context.BodyParser(&newInformation); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	// Validate required fields
	if newInformation.InternStudentID == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern_student_id is required",
		})
	}
	if newInformation.CompanyId == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "company_id is required",
		})
	}
	if newInformation.InternshipMentorID == 0 {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship_mentor_id is required",
		})
	}

	// Validate foreign key relationships
	var internStudent model.InternStudent
	if err := handler.DB.First(&internStudent, newInformation.InternStudentID).Error; err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern student not found",
		})
	}

	var company model.Company
	if err := handler.DB.First(&company, newInformation.CompanyId).Error; err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "company not found",
		})
	}

	var mentor model.InternshipMentor
	if err := handler.DB.First(&mentor, newInformation.InternshipMentorID).Error; err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "internship mentor not found",
		})
	}

	if err := handler.DB.Create(&newInformation).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create internship information",
		})
	}

	// Reload with relationships
	var createdInformation model.InternshipInformation
	if err := handler.DB.Preload("InternStudent").Preload("InternshipCompany").Preload("InternshipMentor").First(&createdInformation, newInformation.ID).Error; err != nil {
		return context.Status(fiber.StatusCreated).JSON(fiber.Map{
			"isSuccess": true,
			"result":    newInformation,
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    createdInformation,
	})
}

// UPDATE internship information by ID
func (handler *InternshipInformationHandler) UpdateInternshipInformationByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var existing model.InternshipInformation

	if err := handler.DB.First(&existing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "internship information not found",
			})
		}
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to retrieve internship information",
		})
	}

	var updatedData model.InternshipInformation
	if err := context.BodyParser(&updatedData); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	// Validate relationships if being updated
	if updatedData.InternStudentID != 0 && updatedData.InternStudentID != existing.InternStudentID {
		var internStudent model.InternStudent
		if err := handler.DB.First(&internStudent, updatedData.InternStudentID).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "intern student not found",
			})
		}
		existing.InternStudentID = updatedData.InternStudentID
	}

	if updatedData.CompanyId != 0 && updatedData.CompanyId != existing.CompanyId {
		var company model.Company
		if err := handler.DB.First(&company, updatedData.CompanyId).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "company not found",
			})
		}
		existing.CompanyId = updatedData.CompanyId
	}

	if updatedData.InternshipMentorID != 0 && updatedData.InternshipMentorID != existing.InternshipMentorID {
		var mentor model.InternshipMentor
		if err := handler.DB.First(&mentor, updatedData.InternshipMentorID).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "internship mentor not found",
			})
		}
		existing.InternshipMentorID = updatedData.InternshipMentorID
	}

	if err := handler.DB.Save(&existing).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update internship information",
		})
	}

	// Reload with relationships
	var updatedInformation model.InternshipInformation
	if err := handler.DB.Preload("InternStudent").Preload("InternshipCompany").Preload("InternshipMentor").First(&updatedInformation, existing.ID).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    existing,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    updatedInformation,
	})
}

// DELETE internship information by ID
func (handler *InternshipInformationHandler) DeleteInternshipInformationByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var information model.InternshipInformation

	if err := handler.DB.First(&information, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "internship information not found",
			})
		}
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to retrieve internship information",
		})
	}

	if err := handler.DB.Delete(&information).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete internship information",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "internship information deleted successfully",
	})
}
