package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type EvaluationController struct {
	application *core.ModEdApplication
}

func NewEvaluationController() *EvaluationController {
	controller := &EvaluationController{}
	return controller
}

func (controller *EvaluationController) RenderMain(context *fiber.Ctx) error {
	sampleEvaluation := model.Evaluation{
		SubmissionID:   1,
		SubmissionType: "assignment",
		InstructorID:   1,
		Score:          95,
		MaxScore:       100,
		Feedback:       "Excellent work",
		EvaluatedAt:    time.Now(),
		Criteria:       "",
		Status:         "final",
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Evaluation data retrieved successfully",
		"data":      sampleEvaluation,
	})
}

func (controller *EvaluationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *EvaluationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
