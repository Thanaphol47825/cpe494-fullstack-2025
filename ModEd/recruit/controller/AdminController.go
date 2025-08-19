package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type AdminController struct {
	application *core.ModEdApplication
}

func (controller *AdminController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Recruit Admin")
}

func (controller *AdminController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/Admin",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
func (controller *AdminController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}