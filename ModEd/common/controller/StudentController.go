package controller

import (
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type StudentController struct {
	application *core.ModEdApplication
}

func (controller *StudentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Student")
}

func (controller *StudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Student",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *StudentControllers) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
