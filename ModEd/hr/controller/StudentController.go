package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (controller *StudentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello World")
}

func (controller *StudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/hr/Student",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *StudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
