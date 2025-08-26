package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AssignmentProgressController struct {
	application *core.ModEdApplication
}

func NewAssignmentProgressController() *AssignmentProgressController {
	controller := &AssignmentProgressController{}
	return controller
}

func (controller *AssignmentProgressController) RenderMain(context *fiber.Ctx) error {
	// Create a sample assignment progress using the model
	sampleProgress := model.AssignmentProgress{
		AssignmentID:      1,
		TotalStudents:     25,
		SubmittedCount:    18,
		NotSubmittedCount: 7,
		GradedCount:       15,
		NotGradedCount:    3,
		AverageScore:      87.5,
		SubmissionRate:    "72%",
		LastUpdated:       time.Now(),
		Status:            "active",
	}

	// Return the progress data as JSON
	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Assignment progress data retrieved successfully",
		"data":      sampleProgress,
	})
}

func (controller *AssignmentProgressController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentProgressController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/progress",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
