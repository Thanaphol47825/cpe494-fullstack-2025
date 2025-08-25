package handler

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipInformationHandler struct {
	application *core.ModEdApplication
}

func NewInternshipInformationHandler() *InternshipInformationHandler {
	return &InternshipInformationHandler{}
}

func (handler *InternshipInformationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipInformation")
}

func (handler *InternshipInformationHandler) GetInternshipInformations(context *fiber.Ctx) error {
	filepath := "/workspace/ModEd/curriculum/data/curriculum/Information.csv"
	informationMapper, err := core.CreateMapper[string](filepath + "InternshipInformation.json")
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get internship informations",
		})
	}
	informations := informationMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    informations,
	})
}
