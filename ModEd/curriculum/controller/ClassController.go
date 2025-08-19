package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type ClassController struct {
	application *core.ModEdApplication
}

func (controller *ClassController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/Class")
}
func (controller *ClassController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/Class",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *ClassController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
