package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type QuizController struct {
	application *core.ModEdApplication
}

func NewQuizController() *QuizController {
	controller := &QuizController{}
	return controller
}

func (controller *QuizController) RenderMain(context *fiber.Ctx) error {
	sampleQuiz := model.Quiz{
		Title:        "Basic Quiz",
		Description:  "Test your knowledge",
		DueDate:      time.Now().AddDate(0, 0, 3),
		StartDate:    time.Now(),
		TimeLimit:    45,
		MaxScore:     100,
		InstructorID: 1,
		CourseID:     101,
		IsReleased:   true,
		IsActive:     true,
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Quiz data retrieved successfully",
		"data":      sampleQuiz,
	})
}

func (controller *QuizController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *QuizController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
