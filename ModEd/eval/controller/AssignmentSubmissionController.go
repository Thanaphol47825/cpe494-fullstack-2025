package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AssignmentSubmissionController struct {
	application *core.ModEdApplication
}

func NewAssignmentSubmissionController() *AssignmentSubmissionController {
	controller := &AssignmentSubmissionController{}
	return controller
}

func (controller *AssignmentSubmissionController) RenderMain(context *fiber.Ctx) error {
	sampleSubmission := model.AssignmentSubmission{
		AssignmentID:   1,
		StudentID:      101,
		SubmittedAt:    time.Now(),
		Content:        "Here you go",
		AttachmentPath: "",
		Score:          nil,
		Feedback:       "",
		IsLate:         false,
		Status:         "submitted",
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Assignment submission data retrieved successfully",
		"data":      sampleSubmission,
	})
}

func (controller *AssignmentSubmissionController) GetModelMeta() []*core.ModelMeta {
	return []*core.ModelMeta{
		{Path: "eval/assignmentsubmission", Model: &model.AssignmentSubmission{}},
	}
}

func (controller *AssignmentSubmissionController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentSubmissionController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment/submission",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
