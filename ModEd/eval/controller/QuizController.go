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

func (controller *QuizController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/quiz", Model: &model.Quiz{}},
	}
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
		Method:  core.POST,
	})

	return routeList
}

// Create new quiz
func (controller *QuizController) CreateQuiz(context *fiber.Ctx) error {
	var requestData struct {
		Quiz      model.Quiz           `json:"quiz"`
		Questions []model.QuizQuestion `json:"questions"`
	}

	if err := context.BodyParser(&requestData); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	// Create quiz first
	if err := controller.application.DB.Create(&requestData.Quiz).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	// Create questions if provided
	if len(requestData.Questions) > 0 {
		for i := range requestData.Questions {
			requestData.Questions[i].QuizID = requestData.Quiz.ID
			requestData.Questions[i].OrderIndex = uint(i)
		}
		if err := controller.application.DB.Create(&requestData.Questions).Error; err != nil {
			return context.JSON(fiber.Map{
				"isSuccess": false,
				"result":    "failed to create questions: " + err.Error(),
			})
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    requestData.Quiz,
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

	// Add computed Active field to each quiz
	now := time.Now()
	result := make([]map[string]interface{}, len(quizzes))
	for i, quiz := range quizzes {
		result[i] = map[string]interface{}{
			"ID":          quiz.ID,
			"title":       quiz.Title,
			"description": quiz.Description,
			"dueDate":     quiz.DueDate,
			"startDate":   quiz.StartDate,
			"timeLimit":   quiz.TimeLimit,
			"maxScore":    quiz.MaxScore,
			"createdAt":   quiz.CreatedAt,
			"updatedAt":   quiz.UpdatedAt,
			"active":      now.After(quiz.StartDate) && now.Before(quiz.DueDate),
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
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

	// Get questions for this quiz
	var questions []model.QuizQuestion
	controller.application.DB.Where("quiz_id = ?", quiz.ID).Order("order_index ASC").Find(&questions)

	// Return in same format as GetAllQuizzes with questions
	now := time.Now()
	result := map[string]interface{}{
		"ID":          quiz.ID,
		"title":       quiz.Title,
		"description": quiz.Description,
		"dueDate":     quiz.DueDate,
		"startDate":   quiz.StartDate,
		"timeLimit":   quiz.TimeLimit,
		"maxScore":    quiz.MaxScore,
		"createdAt":   quiz.CreatedAt,
		"updatedAt":   quiz.UpdatedAt,
		"active":      now.After(quiz.StartDate) && now.Before(quiz.DueDate),
		"questions":   questions,
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    result,
	})
}

// Update existing quiz
func (controller *QuizController) UpdateQuiz(context *fiber.Ctx) error {
	var requestData struct {
		Quiz      model.Quiz           `json:"quiz"`
		Questions []model.QuizQuestion `json:"questions"`
	}

	if err := context.BodyParser(&requestData); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	// Update quiz
	if err := controller.application.DB.Model(&model.Quiz{}).Where("id = ?", requestData.Quiz.ID).Updates(&requestData.Quiz).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	// Delete existing questions and create new ones
	if len(requestData.Questions) > 0 {
		// Delete old questions
		controller.application.DB.Where("quiz_id = ?", requestData.Quiz.ID).Delete(&model.QuizQuestion{})

		// Create new questions
		for i := range requestData.Questions {
			requestData.Questions[i].QuizID = requestData.Quiz.ID
			requestData.Questions[i].OrderIndex = uint(i)
		}
		if err := controller.application.DB.Create(&requestData.Questions).Error; err != nil {
			return context.JSON(fiber.Map{
				"isSuccess": false,
				"result":    "failed to update questions: " + err.Error(),
			})
		}
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    requestData.Quiz,
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
