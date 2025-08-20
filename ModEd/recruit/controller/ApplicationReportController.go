package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type ApplicationReportController struct {
	application *core.ModEdApplication
}

func NewApplicationReportController() *ApplicationReportController {
	controller := &ApplicationReportController{}
	return controller
}

func (controller *ApplicationReportController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Recruit ApplicationReport")
}

func (controller *ApplicationReportController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ApplicationReport",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
func (controller *ApplicationReportController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}