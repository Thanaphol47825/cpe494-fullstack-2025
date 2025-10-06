package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type QuizSubmissionController struct {
	application *core.ModEdApplication
}

func NewQuizSubmissionController() *QuizSubmissionController {
	controller := &QuizSubmissionController{}
	return controller
}

func (controller *QuizSubmissionController) RenderMain(context *fiber.Ctx) error {
	sampleSubmission := model.QuizSubmission{
		QuizID:      1,
		StudentID:   101,
		StartedAt:   time.Now().Add(-30 * time.Minute),
		SubmittedAt: time.Now(),
		Answers:     `{"q1": "A", "q2": "B", "q3": "C"}`,
		Score:       nil,
		TimeSpent:   1800,
		IsLate:      false,
		Status:      "submitted",
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Quiz submission data retrieved successfully",
		"data":      sampleSubmission,
	})
}

func (controller *QuizSubmissionController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *QuizSubmissionController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *QuizSubmissionController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/submission",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
