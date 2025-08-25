package handler

import (
	"ModEd/curriculum/model"
	"ModEd/curriculum/utils"

	"github.com/gofiber/fiber/v2"
)

type CurriculumHandler struct{}

func NewCurriculumHandler() *CurriculumHandler {
	return &CurriculumHandler{}
}

func (h *CurriculumHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Helloo curriculum")
}

func (controller *CurriculumHandler) GetCurriculum(context *fiber.Ctx) error {
	// id := context.Query("id")

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "",
	})
}

// Read all
func (c *CurriculumHandler) GetCurriculums(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/curriculum/curriculum.json"
	curriculumsMapper, err := utils.CreateMapper[model.Curriculum](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get curriculums",
		})
	}

	curriculums := curriculumsMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    curriculums,
	})
}
