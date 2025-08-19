package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type ApplicationStatusController struct {
	application *core.ModEdApplication
}

func NewApplicationStatusController() *ApplicationStatusController {
	controller := &ApplicationStatusController{}
	return controller
}


func (controller *ApplicationStatusController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/ApplicationStatusController")
}

func (controller *ApplicationStatusController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ApplicationStatusController",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ApplicationStatusController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
