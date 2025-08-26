package controller

import (
	"ModEd/core"
	"ModEd/eval/model"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AssignmentController struct {
	application *core.ModEdApplication
}

func NewAssignmentController() *AssignmentController {
	controller := &AssignmentController{}
	return controller
}

func (controller *AssignmentController) RenderMain(context *fiber.Ctx) error {
	sampleAssignment := model.Assignment{
		Title:        "Introduction to course",
		Description:  "Answer the questions",
		DueDate:      time.Now().AddDate(0, 0, 7),
		StartDate:    time.Now(),
		MaxScore:     100,
		InstructorID: 1,
		CourseID:     101,
		IsReleased:   true,
		IsActive:     true,
	}

	return context.JSON(fiber.Map{
		"isSuccess": true,
		"message":   "Assignment data retrieved successfully",
		"data":      sampleAssignment,
	})
}

func (controller *AssignmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *AssignmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/eval/assignment",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
