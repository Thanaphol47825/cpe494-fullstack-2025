package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type SubmissionController struct {
	application *core.ModEdApplication
}

func NewSubmissionController() *SubmissionController {
	controller := &SubmissionController{}
	return controller
}

func (controller *SubmissionController) RenderMain(context *fiber.Ctx) error {
	sampleSubmissions := []model.Submission{
		{
			Type:         "assignment",
			Title:        "Introduction to course",
			StudentID:    101,
			StudentName:  "Nameless 1",
			SubmittedAt:  time.Now().Add(-2 * time.Hour),
			Status:       "submitted",
			Score:        nil,
			MaxScore:     100,
			IsLate:       false,
			Feedback:     "",
			LastModified: time.Now().Add(-2 * time.Hour),
		},
		{
			Type:         "quiz",
			Title:        "Basic Quiz",
			StudentID:    102,
			StudentName:  "Nameless 2",
			SubmittedAt:  time.Now().Add(-4 * time.Hour),
			Status:       "graded",
			Score:        &[]uint{85}[0],
			MaxScore:     100,
			IsLate:       false,
			Feedback:     "Good job",
			LastModified: time.Now().Add(-1 * time.Hour),
		},
	}

	return context.JSON(fiber.Map{
		"isSuccess":  true,
		"message":    "Submission data retrieved successfully",
		"data":       sampleSubmissions,
		"totalCount": len(sampleSubmissions),
	})
}

func (controller *SubmissionController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *SubmissionController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/submission",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
