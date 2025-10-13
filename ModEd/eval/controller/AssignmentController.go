package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type AssignmentController struct {
	application *core.ModEdApplication
}

func NewAssignmentController() *AssignmentController {
	controller := &AssignmentController{}
	return controller
}

func (controller *AssignmentController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/assignment", Model: &model.Assignment{}},
	}
}

func (controller *AssignmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/create",
		Handler: controller.CreateAssignment,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/getAll",
		Handler: controller.GetAllAssignments,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/get/:id",
		Handler: controller.GetAssignmentByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/update",
		Handler: controller.UpdateAssignment,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/delete/:id",
		Handler: controller.DeleteAssignment,
		Method:  core.POST,
	})

	return routeList
}

// Create new assignment
func (controller *AssignmentController) CreateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	if err := context.BodyParser(&assignment); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&assignment).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Get all assignments
func (controller *AssignmentController) GetAllAssignments(context *fiber.Ctx) error {
	var assignments []model.Assignment

	if err := controller.application.DB.Find(&assignments).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignments,
	})
}

// Get assignment by ID
func (controller *AssignmentController) GetAssignmentByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var assignment model.Assignment

	if err := controller.application.DB.First(&assignment, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Assignment not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Update existing assignment
func (controller *AssignmentController) UpdateAssignment(context *fiber.Ctx) error {
	var assignment model.Assignment

	if err := context.BodyParser(&assignment); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&assignment).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    assignment,
	})
}

// Delete assignment by ID
func (controller *AssignmentController) DeleteAssignment(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.Assignment{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Assignment deleted successfully",
	})
}
