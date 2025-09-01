package handler

import (
	"ModEd/curriculum/model"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CurriculumHandler struct {
	DB *gorm.DB
}

func NewCurriculumHandler() *CurriculumHandler {
	return &CurriculumHandler{}
}

func (h *CurriculumHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Helloo curriculum")
}

func (h *CurriculumHandler) CreateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	if err := h.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to create curriculum",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

func (h *CurriculumHandler) GetCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var result model.Curriculum
	if err := h.DB.Preload("CourseList").Where("id = ?", id).First(&result).Error; err != nil {
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

// Read all
func (h *CurriculumHandler) GetCurriculums(context *fiber.Ctx) error {
	var curriculums []model.Curriculum
	if err := h.DB.Preload("CourseList").Find(&curriculums).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    curriculums,
	})
}

// Update
func (h *CurriculumHandler) UpdateCurriculum(context *fiber.Ctx) error {
	var payload *model.Curriculum
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	result := h.DB.Model(payload).Where("id = ?", payload.ID).Updates(payload)
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

// Delete
func (h *CurriculumHandler) DeleteCurriculum(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	result := h.DB.Where("id = ?", id).Delete(&model.Curriculum{})
	if result.RowsAffected == 0 {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "record not found",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "success",
	})
}

// func (c *CurriculumHandler) CreateSeedCurriculum(context *fiber.Ctx) error {
// 	return context.JSON(fiber.Map{
// 		"isSuccess": true,
// 		"result":    "",
// 	})
// }
