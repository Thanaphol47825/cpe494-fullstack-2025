package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type QuizController struct {
	application *core.ModEdApplication
}

func NewQuizController() *QuizController {
	controller := &QuizController{}
	return controller
}

func (controller *QuizController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *QuizController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *QuizController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/create",
		Handler: controller.CreateQuiz,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/getAll",
		Handler: controller.GetAllQuizzes,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/get/:id",
		Handler: controller.GetQuizByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/update",
		Handler: controller.UpdateQuiz,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/delete/:id",
		Handler: controller.DeleteQuiz,
		Method:  core.GET,
	})

	return routeList
}

// Create new quiz
func (controller *QuizController) CreateQuiz(context *fiber.Ctx) error {
	var quiz model.Quiz

	if err := context.BodyParser(&quiz); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&quiz).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quiz,
	})
}

// Get all quizzes
func (controller *QuizController) GetAllQuizzes(context *fiber.Ctx) error {
	var quizzes []model.Quiz

	if err := controller.application.DB.Find(&quizzes).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quizzes,
	})
}

// Get quiz by ID
func (controller *QuizController) GetQuizByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var quiz model.Quiz

	if err := controller.application.DB.First(&quiz, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Quiz not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quiz,
	})
}

// Update existing quiz
func (controller *QuizController) UpdateQuiz(context *fiber.Ctx) error {
	var quiz model.Quiz

	if err := context.BodyParser(&quiz); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&quiz).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quiz,
	})
}

// Delete quiz by ID
func (controller *QuizController) DeleteQuiz(context *fiber.Ctx) error {
	id := context.Params("id")
	var quiz model.Quiz

	if err := controller.application.DB.First(&quiz, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Quiz not found",
		})
	}

	if err := controller.application.DB.Delete(&quiz).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Quiz deleted successfully",
	})
}
