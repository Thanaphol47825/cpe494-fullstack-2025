package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type CourseHandler struct {
	// DB *gorm.DB
	Application *core.ModEdApplication
}

func NewCourseHandler() *CourseHandler {
	return &CourseHandler{}
}

func (h *CourseHandler) RenderCreateForm(context *fiber.Ctx) error {
	path := filepath.Join(h.Application.RootPath, "curriculum", "view", "Course.tpl")
	tmpl, err := mustache.ParseFile(path)
	if err != nil {
		return context.JSON(fiber.Map{"isSuccess": false, "result": "failed to load template"})
	}
	rendered := tmpl.Render(map[string]any{
		"title":   "Add Course",
		"RootURL": h.Application.RootURL,
	})
	context.Set("Content-Type", "text/html; charset=utf-8")

	return context.SendString(rendered)
}

func (h *CourseHandler) CreateCourse(context *fiber.Ctx) error {
	var payload *model.Course
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := h.Application.DB.Create(payload).Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to create course",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    "Successfully created course",
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
	if err := h.Application.DB.Where("id = ?", id).First(&result).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get course",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

func (h *CourseHandler) GetCourses(context *fiber.Ctx) error {
	var Courses []model.Course
	if err := h.Application.DB.Find(&Courses).Error; err != nil {
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
	var payload *model.Course
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	var result = h.Application.DB.Model(&model.Course{}).Where("id = ?", payload.ID).Updates(payload)
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
			"result":    result,
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

	if err := h.Application.DB.Delete(&model.Course{}, id).Error; err != nil {
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
