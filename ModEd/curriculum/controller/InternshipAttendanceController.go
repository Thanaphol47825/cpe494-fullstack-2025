package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipAttendanceController struct {
	application *core.ModEdApplication
}

func NewInternshipAttendanceController() *InternshipAttendanceController {
	controller := &InternshipAttendanceController{}
	return controller
}

func (controller *InternshipAttendanceController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipAttendance")
}

func (controller *InternshipAttendanceController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipAttendance",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipAttendanceController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
