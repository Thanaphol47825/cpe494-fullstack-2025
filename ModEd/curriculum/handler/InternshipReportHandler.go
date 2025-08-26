package handler

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipReportHandler struct {
	application *core.ModEdApplication
}

func NewInternshipReportHandler() *InternshipReportHandler {
	return &InternshipReportHandler{}
}

func (handler *InternshipReportHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipReport")
}

func (handler *InternshipReportHandler) GetInternshipReports(context *fiber.Ctx) error {
	filepath := "/workspace/ModEd/curriculum/data/curriculum/Report.csv"
	reportMapper, err := core.CreateMapper[string](filepath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get report",
		})
	}
	report := reportMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    report,
	})
}
