package handler

import (
	commonModel "ModEd/common/model"
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternStudentHandler struct {
	DB *gorm.DB
}

func NewInternStudentHandler(app *core.ModEdApplication) *InternStudentHandler {
	return &InternStudentHandler{
		DB: app.DB,
	}
}

func (controller *InternStudentHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternStudent")
}

func (controller *InternStudentHandler) GetInternStudent(context *fiber.Ctx) error {
	id := context.Params("id")

	if id == "" {
		// Return all intern students with preloaded Student data
		var internStudents []model.InternStudent
		if err := controller.DB.Preload("Student").Find(&internStudents).Error; err != nil {
			return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "failed to fetch intern students",
			})
		}

		// If preload didn't work, manually load student data
		for i := range internStudents {
			if internStudents[i].Student.ID == 0 && internStudents[i].StudentID != 0 {
				var student commonModel.Student
				if err := controller.DB.First(&student, "id = ?", internStudents[i].StudentID).Error; err == nil {
					internStudents[i].Student = student
				}
			}
		}

		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    internStudents,
		})
	}

	// Return specific intern student with preloaded Student data
	var internStudent model.InternStudent
	if err := controller.DB.Preload("Student").First(&internStudent, id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern student not found",
		})
	}

	// If preload didn't work, manually load student data
	if internStudent.Student.ID == 0 && internStudent.StudentID != 0 {
		var student commonModel.Student
		if err := controller.DB.First(&student, "id = ?", internStudent.StudentID).Error; err == nil {
			internStudent.Student = student
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    internStudent,
	})
}
func (controller *InternStudentHandler) CreateInternStudent(context *fiber.Ctx) error {
	// Parse the request body to get student_code
	var requestBody map[string]interface{}
	if err := context.BodyParser(&requestBody); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	// Extract student_code from request
	studentCode, ok := requestBody["student_code"].(string)
	if !ok || studentCode == "" {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "student_code is required",
		})
	}

	// Find the student by student_code and get their ID
	var student commonModel.Student
	if err := controller.DB.First(&student, "student_code = ?", studentCode).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "student with code '" + studentCode + "' not found",
			})
		}
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to lookup student",
		})
	}

	// Create InternStudent model with the mapped StudentID
	var newStudent model.InternStudent
	newStudent.StudentID = student.ID

	// Set other fields from request body
	if internStatus, ok := requestBody["intern_status"].(string); ok {
		newStudent.InternStatus = model.InternStatus(internStatus)
	}
	if overview, ok := requestBody["overview"].(string); ok {
		newStudent.Overview = overview
	}

	// Check if intern student already exists for this Student
	var existingInternStudent model.InternStudent
	if err := controller.DB.First(&existingInternStudent, "student_id = ?", student.ID).Error; err == nil {
		return context.Status(fiber.StatusConflict).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern student already exists for student code: " + studentCode,
		})
	}

	// Create the intern student
	if err := controller.DB.Create(&newStudent).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create intern student",
		})
	}

	// Reload with Student data for complete response
	var createdInternStudent model.InternStudent
	if err := controller.DB.Preload("Student").First(&createdInternStudent, newStudent.ID).Error; err != nil {
		// If preload fails, return without Student data
		return context.Status(fiber.StatusCreated).JSON(fiber.Map{
			"isSuccess": true,
			"result":    newStudent,
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    createdInternStudent,
	})
}

func (controller *InternStudentHandler) UpdateInternStudent(context *fiber.Ctx) error {
	id := context.Params("id")

	var updatedStudent model.InternStudent
	if err := context.BodyParser(&updatedStudent); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	// Check if intern student exists
	var existingStudent model.InternStudent
	if err := controller.DB.First(&existingStudent, "id = ?", id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern student not found",
		})
	}

	// If StudentID is being changed, validate the new Student exists
	if updatedStudent.StudentID != 0 && updatedStudent.StudentID != existingStudent.StudentID {
		var student commonModel.Student
		if err := controller.DB.First(&student, "id = ?", updatedStudent.StudentID).Error; err != nil {
			return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "referenced student not found",
			})
		}

		// Check if another intern student already exists for this StudentID
		var conflictCheck model.InternStudent
		if err := controller.DB.Where("student_id = ? AND id != ?", updatedStudent.StudentID, id).First(&conflictCheck).Error; err == nil {
			return context.Status(fiber.StatusConflict).JSON(fiber.Map{
				"isSuccess": false,
				"error":     "intern student already exists for this student",
			})
		}
	}

	// Update only provided fields
	updateData := map[string]interface{}{}
	if updatedStudent.InternStatus != "" {
		updateData["intern_status"] = updatedStudent.InternStatus
	}
	if updatedStudent.StudentID != 0 {
		updateData["student_id"] = updatedStudent.StudentID
	}
	if updatedStudent.Overview != "" {
		updateData["overview"] = updatedStudent.Overview
	}

	if err := controller.DB.Model(&existingStudent).Updates(updateData).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update intern student",
		})
	}

	// Reload with Student data for complete response
	var resultInternStudent model.InternStudent
	if err := controller.DB.Preload("Student").First(&resultInternStudent, id).Error; err != nil {
		// If preload fails, return existing data
		return context.JSON(fiber.Map{
			"isSuccess": true,
			"result":    existingStudent,
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    resultInternStudent,
	})
}

func (controller *InternStudentHandler) DeleteInternStudent(context *fiber.Ctx) error {
	id := context.Params("id")

	// Check if intern student exists before deletion
	var existingStudent model.InternStudent
	if err := controller.DB.First(&existingStudent, "id = ?", id).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "intern student not found",
		})
	}

	// Delete the intern student
	if err := controller.DB.Delete(&existingStudent).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete intern student",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result": fiber.Map{
			"message":    "intern student deleted successfully",
			"deleted_id": existingStudent.ID,
			"student_id": existingStudent.StudentID,
		},
	})
}
