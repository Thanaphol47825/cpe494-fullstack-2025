package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type QuizSubmissionController struct {
	application *core.ModEdApplication
}

func NewQuizSubmissionController() *QuizSubmissionController {
	controller := &QuizSubmissionController{}
	return controller
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
		Route:   "/eval/quiz/submission/create",
		Handler: controller.CreateQuizSubmission,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/submission/getAll",
		Handler: controller.GetAllQuizSubmissions,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/submission/get/:id",
		Handler: controller.GetQuizSubmissionByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/submission/update",
		Handler: controller.UpdateQuizSubmission,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/quiz/submission/delete/:id",
		Handler: controller.DeleteQuizSubmission,
		Method:  core.GET,
	})

	return routeList
}

// Create new quiz submission
func (controller *QuizSubmissionController) CreateQuizSubmission(context *fiber.Ctx) error {
	var quizSubmission model.QuizSubmission

	if err := context.BodyParser(&quizSubmission); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&quizSubmission).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quizSubmission,
	})
}

// Get all quiz submissions
func (controller *QuizSubmissionController) GetAllQuizSubmissions(context *fiber.Ctx) error {
	var quizSubmissions []model.QuizSubmission

	if err := controller.application.DB.Find(&quizSubmissions).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quizSubmissions,
	})
}

// Get quiz submission by ID
func (controller *QuizSubmissionController) GetQuizSubmissionByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var quizSubmission model.QuizSubmission

	if err := controller.application.DB.First(&quizSubmission, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Quiz submission not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quizSubmission,
	})
}

// Update existing quiz submission
func (controller *QuizSubmissionController) UpdateQuizSubmission(context *fiber.Ctx) error {
	var quizSubmission model.QuizSubmission

	if err := context.BodyParser(&quizSubmission); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&quizSubmission).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    quizSubmission,
	})
}

// Delete quiz submission by ID
func (controller *QuizSubmissionController) DeleteQuizSubmission(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.QuizSubmission{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Quiz submission deleted successfully",
	})
}
