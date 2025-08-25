package handler

import (
	"ModEd/core"
	"ModEd/curriculum/model"

	"github.com/gofiber/fiber/v2"
)

type InternshipMentorHandler struct{}

func (controller *InternshipMentorHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipMentor")
}

func (controller *InternshipMentorHandler) GetInternshipMentor(context *fiber.Ctx) error {
	filePath := "/workspace/ModEd/curriculum/data/internship/internshipMentor.json"
	InternshipMentorMapper, err := core.CreateMapper[model.InternshipMentor](filePath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get company",
		})
	}

	Mentors := InternshipMentorMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    Mentors,
	})
}
