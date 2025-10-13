package controller

import (
	"ModEd/core"
	"ModEd/eval/model"

	"github.com/gofiber/fiber/v2"
)

type SubmissionController struct {
	application *core.ModEdApplication
}

func NewSubmissionController() *SubmissionController {
	controller := &SubmissionController{}
	return controller
}

func (controller *SubmissionController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/submission", Model: &model.Submission{}},
	}
}

func (controller *SubmissionController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *SubmissionController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission/create",
		Handler: controller.CreateSubmission,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission/getAll",
		Handler: controller.GetAllSubmissions,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission/get/:id",
		Handler: controller.GetSubmissionByID,
		Method:  core.GET,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission/update",
		Handler: controller.UpdateSubmission,
		Method:  core.POST,
	})

	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission/delete/:id",
		Handler: controller.DeleteSubmission,
		Method:  core.GET,
	})

	return routeList
}

// Create new submission
func (controller *SubmissionController) CreateSubmission(context *fiber.Ctx) error {
	var submission model.Submission

	if err := context.BodyParser(&submission); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Create(&submission).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submission,
	})
}

// Get all submissions
func (controller *SubmissionController) GetAllSubmissions(context *fiber.Ctx) error {
	var submissions []model.Submission

	if err := controller.application.DB.Find(&submissions).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submissions,
	})
}

// Get submission by ID
func (controller *SubmissionController) GetSubmissionByID(context *fiber.Ctx) error {
	id := context.Params("id")
	var submission model.Submission

	if err := controller.application.DB.First(&submission, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "Submission not found",
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submission,
	})
}

// Update existing submission
func (controller *SubmissionController) UpdateSubmission(context *fiber.Ctx) error {
	var submission model.Submission

	if err := context.BodyParser(&submission); err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    "cannot parse JSON",
		})
	}

	if err := controller.application.DB.Save(&submission).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    submission,
	})
}

// Delete submission by ID
func (controller *SubmissionController) DeleteSubmission(context *fiber.Ctx) error {
	id := context.Params("id")

	if err := controller.application.DB.Delete(&model.Submission{}, id).Error; err != nil {
		return context.JSON(fiber.Map{
			"isSuccess": false,
			"result":    err.Error(),
		})
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"result":    "Submission deleted successfully",
	})
}
