package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type EvaluationController struct {
	application *core.ModEdApplication
}

func NewEvaluationController() *EvaluationController {
	controller := &EvaluationController{}
	return controller
}

func (controller *EvaluationController) GetModelMeta() []*core.ModelMeta {
	modelMetaList := []*core.ModelMeta{}
	return modelMetaList
}

func (controller *EvaluationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *EvaluationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation/create",
		Handler: controller.CreateEvaluation,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation/getAll",
		Handler: controller.GetAllEvaluations,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation/get/:id",
		Handler: controller.GetEvaluationByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation/update",
		Handler: controller.UpdateEvaluation,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/evaluation/delete/:id",
		Handler: controller.DeleteEvaluation,
		Method:  core.GET,
	})

	return routeList
}

// Create new evaluation
func (controller *EvaluationController) CreateEvaluation(context *fiber.Ctx) error {
	var evaluation model.Evaluation

	if err := context.BodyParser(&evaluation); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&evaluation).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    evaluation,
	})
}

// Get all evaluations
func (controller *EvaluationController) GetAllEvaluations(context *fiber.Ctx) error {
	var evaluations []model.Evaluation

	if err := controller.application.DB.Find(&evaluations).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    evaluations,
	})
}

// Get evaluation by ID
func (controller *EvaluationController) GetEvaluationByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var evaluation model.Evaluation

	if err := controller.application.DB.First(&evaluation, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Evaluation not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    evaluation,
	})
}

// Update existing evaluation
func (controller *EvaluationController) UpdateEvaluation(context *fiber.Ctx) error {
	var evaluation model.Evaluation

	if err := context.BodyParser(&evaluation); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&evaluation).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    evaluation,
	})
}

// Delete evaluation by ID
func (controller *EvaluationController) DeleteEvaluation(context *fiber.Ctx) error {
	id := context.Params("id")
	var evaluation model.Evaluation

	if err := controller.application.DB.First(&evaluation, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Evaluation not found",
		})
	}

	if err := controller.application.DB.Delete(&evaluation).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Evaluation deleted successfully",
	})
}
