package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type InternStudentHandler struct{}

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
