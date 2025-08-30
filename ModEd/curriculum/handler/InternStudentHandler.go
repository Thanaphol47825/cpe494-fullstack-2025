package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type InternStudentHandler struct {
	DB *gorm.DB
}

func (controller *InternStudentHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternStudent")
}

func (controller *InternStudentHandler) GetInternStudent(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/Student.csv"
	StudentMapper, err := core.CreateMapper[model.InternStudent](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get student",
		})
	}

	Students := StudentMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Students,
	})
}

func (controller *InternStudentHandler) CreateInternStudent(context *fiber.Ctx) error {
	var newStudent model.InternStudent

	if err := context.BodyParser(&newStudent); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	if err := controller.DB.Create(&newStudent).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to create student",
		})
	}

	return context.Status(fiber.StatusCreated).JSON(fiber.Map{
		"isSuccess": true,
		"result":    newStudent,
	})
}

func (controller *InternStudentHandler) UpdateInternStudent(context *fiber.Ctx) error {
	var updatedStudent model.InternStudent

	if err := context.BodyParser(&updatedStudent); err != nil {
		return context.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "invalid request body",
		})
	}

	var existingStudent model.InternStudent
	if err := controller.DB.First(&existingStudent, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "id not found",
		})
	}

	existingStudent.InternStatus = updatedStudent.InternStatus

	if err := controller.DB.Save(&existingStudent).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to update student",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    existingStudent,
	})
}

func (controller *InternStudentHandler) DeleteInternStudent(context *fiber.Ctx) error {

	if err := controller.DB.Delete(&model.InternStudent{}, "id = ?", context.Params("id")).Error; err != nil {
		return context.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"isSuccess": false,
			"error":     "failed to delete student",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "student deleted successfully",
	})
}
