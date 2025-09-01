package handler

import (
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CoursePlanHandler struct {
	DB *gorm.DB
}

func NewCoursePlanHandler() *CoursePlanHandler {
	return &CoursePlanHandler{}
}

func (h *CoursePlanHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Course Plan Main Page")
}

func (h *CoursePlanHandler) CreateCoursePlan(context *fiber.Ctx) error {
	var payload *model.CoursePlan
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Create(&payload).Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to create course plan",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    payload,
		})
}

func (h *CoursePlanHandler) GetCoursePlanById(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.CoursePlan
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

func (h *CoursePlanHandler) GetCoursePlans(context *fiber.Ctx) error {
	var coursePlans []model.CoursePlan
	if err := h.DB.Find(&coursePlans).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get course plans",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    coursePlans,
	})

}

func (h *CoursePlanHandler) UpdateCoursePlan(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var payload *model.CoursePlan
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var result = h.DB.Model(&model.CoursePlan{}).Where("id = ?", id).Updates(payload)
	if err := result.Error; err != nil {
		return context.JSON(
			fiber.Map{
				"isSuccess": false,
				"result":    "failed to update course plan",
			})
	}

	return context.JSON(
		fiber.Map{
			"isSuccess": true,
			"result":    result,
		})
}

func (h *CoursePlanHandler) DeleteCoursePlan(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.CoursePlan{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete course plan",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "course plan deleted successfully",
	})
}
