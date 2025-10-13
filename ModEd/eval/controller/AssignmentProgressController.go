package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type AssignmentProgressController struct {
	application *core.ModEdApplication
}

func NewAssignmentProgressController() *AssignmentProgressController {
	controller := &AssignmentProgressController{}
	return controller
}

func (controller *AssignmentProgressController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/assignmentprogress", Model: &model.AssignmentProgress{}},
	}
}

func (controller *AssignmentProgressController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentProgressController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress/create",
		Handler: controller.CreateAssignmentProgress,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress/getAll",
		Handler: controller.GetAllAssignmentProgresses,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress/get/:id",
		Handler: controller.GetAssignmentProgressByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress/update",
		Handler: controller.UpdateAssignmentProgress,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress/delete/:id",
		Handler: controller.DeleteAssignmentProgress,
		Method:  core.GET,
	})

	return routeList
}

// Create new assignment progress
func (controller *AssignmentProgressController) CreateAssignmentProgress(context *fiber.Ctx) error {
	var progress model.AssignmentProgress

	if err := context.BodyParser(&progress); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&progress).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    progress,
	})
}

// Get all assignment progress records
func (controller *AssignmentProgressController) GetAllAssignmentProgresses(context *fiber.Ctx) error {
	var progressList []model.AssignmentProgress

	if err := controller.application.DB.Find(&progressList).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    progressList,
	})
}

// Get assignment progress by ID
func (controller *AssignmentProgressController) GetAssignmentProgressByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var progress model.AssignmentProgress

	if err := controller.application.DB.First(&progress, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Assignment progress not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    progress,
	})
}

// Update existing assignment progress
func (controller *AssignmentProgressController) UpdateAssignmentProgress(context *fiber.Ctx) error {
	var progress model.AssignmentProgress

	if err := context.BodyParser(&progress); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&progress).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    progress,
	})
}

// Delete assignment progress by ID
func (controller *AssignmentProgressController) DeleteAssignmentProgress(context *fiber.Ctx) error {
	id := context.Params("id")
	var progress model.AssignmentProgress

	if err := controller.application.DB.First(&progress, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Assignment progress not found",
		})
	}

	if err := controller.application.DB.Delete(&progress).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Assignment progress deleted successfully",
	})
}
