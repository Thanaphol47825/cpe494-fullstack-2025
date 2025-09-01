package handler

import (
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ClassMaterialHandler struct {
	DB *gorm.DB
}

func NewClassMaterialHandler() *ClassMaterialHandler {
	return &ClassMaterialHandler{}
}

func (h *ClassMaterialHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Class Material Main Page")
}

func (h *ClassMaterialHandler) CreateClassMaterial(context *fiber.Ctx) error {
	var payload *model.ClassMaterial
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
		"result":    "Class material created successfully",
	})
}

func (h *ClassMaterialHandler) GetClassMaterialById(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	var classMaterial model.ClassMaterial
	if err := h.DB.First(&classMaterial, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classMaterial,
	})
}

func (h *ClassMaterialHandler) GetClassMaterials(context *fiber.Ctx) error {
	var classMaterials []model.ClassMaterial
	if err := h.DB.Find(&classMaterials).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get class materials",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classMaterials,
	})
}

func (h *ClassMaterialHandler) UpdateClassMaterial(context *fiber.Ctx) error {
	var payload *model.ClassMaterial
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
		"result":    "Class material updated successfully",
	})
}

func (h *ClassMaterialHandler) DeleteClassMaterial(context *fiber.Ctx) error {
	id, err := context.ParamsInt("id")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "invalid id",
		})
	}

	if err := h.DB.Delete(&model.ClassMaterial{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to delete class material",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Class material deleted successfully",
	})
}
