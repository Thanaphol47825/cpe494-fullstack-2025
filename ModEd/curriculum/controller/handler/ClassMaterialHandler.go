package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type ClassMaterialHandler struct{}

func NewClassMaterialHandler() *ClassMaterialHandler {
	return &ClassMaterialHandler{}
}

func (h *ClassMaterialHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Class Material Main Page")
}

func (h *ClassMaterialHandler) GetClassMaterials(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/classMaterial.json"

	classMaterialsMapper, err := utils.CreateMapper[model.ClassMaterial](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums",
		})
	}

	classMaterials := classMaterialsMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    classMaterials,
	})
}
