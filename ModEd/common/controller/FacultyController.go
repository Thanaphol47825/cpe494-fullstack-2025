package controller

import (
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type FacultyController struct {
	application *core.ModEdApplication
}

func (controller *FacultyController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *FacultyController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/faculty",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	
	return routeList
}

func (controller *FacultyController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Faculty")
}