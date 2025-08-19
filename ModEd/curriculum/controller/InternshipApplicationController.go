package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternshipApplicationController struct {
	application *core.ModEdApplication
}

func NewInternshipApplicationController() *InternshipApplicationController {
	controller := &InternshipApplicationController{}
	return controller
}

func (controller *InternshipApplicationController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternshipApplication")
}

func (controller *InternshipApplicationController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternshipApplication",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternshipApplicationController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
