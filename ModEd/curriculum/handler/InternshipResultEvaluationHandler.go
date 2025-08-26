package handler

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipResultEvaluationHandler struct {
	application *core.ModEdApplication
}

func NewInternshipResultEvaluationHandler() *InternshipResultEvaluationHandler {
	return &InternshipResultEvaluationHandler{}
}

func (handler *InternshipResultEvaluationHandler) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipResultEvaluation")
}

func (handler *InternshipResultEvaluationHandler) GetInternshipResultEvaluation(context *fiber.Ctx) error {
	filepath := "/workspace/ModEd/curriculum/data/curriculum/ResultEvaluation.csv"
	resultEvaluationMapper, err := core.CreateMapper[string](filepath)
	if err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "failed to get result evaluation",
		})
	}
	resultEvaluation := resultEvaluationMapper.Deserialize()
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    resultEvaluation,
	})
}
