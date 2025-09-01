package handler

import (
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ClassHandler struct {
	DB *gorm.DB
}

func NewClassHandler() *ClassHandler {
	return &ClassHandler{}
}

func (h *ClassHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Class")
}

func (h *ClassHandler) CreateClass(context *fiber.Ctx) error {
	var payload *model.Class
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Create(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class created successfully",
	})
}

func (h *ClassHandler) GetClassById(context *fiber.Ctx) error {
	id := context.Params("id")
	var class model.Class
	if err := h.DB.First(&class, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    class,
	})
}

func (h *ClassHandler) GetClasses(context *fiber.Ctx) error {
	var classes []model.Class
	if err := h.DB.Find(&classes).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classes,
	})
}

func (h *ClassHandler) UpdateClass(context *fiber.Ctx) error {
	var payload *model.Class
	if err := context.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := h.DB.Save(payload).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to update class material",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class updated successfully",
	})
}

func (h *ClassHandler) DeleteClass(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.Class{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete class",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class deleted successfully",
	})
}
