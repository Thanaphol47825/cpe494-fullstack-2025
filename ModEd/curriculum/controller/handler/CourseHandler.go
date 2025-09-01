package handler

import (
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CourseHandler struct {
	DB *gorm.DB
}

func NewCourseHandler() *CourseHandler {
	return &CourseHandler{}
}

func (controller *CourseHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Course")
}

func (h *CourseHandler) CreateCourse(context *fiber.Ctx) error {
	var payload *model.Course
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := h.DB.Create(payload).Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to create course",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    "Success",
		})
}

func (h *CourseHandler) GetCourseById(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.Course
	if err := h.DB.Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculum",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

func (h *CourseHandler) GetCourses(context *fiber.Ctx) error {
	var Courses []model.Course
	if err := h.DB.Find(&Courses).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get courses",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Courses,
	})

}

func (h *CourseHandler) UpdateCourse(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}
	var payload *model.Course
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	var result = h.DB.Model(&model.Course{}).Where("id = ?", id).Updates(payload)
	if err := result.Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to update course",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    "Course updated successfully",
		})
}

func (h *CourseHandler) DeleteCourse(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.Course{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete course",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "course deleted successfully",
	})
}
