package controller

import (
	"ModEd/core"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/hoisie/mustache"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func (controller *DepartmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *DepartmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/department",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	
	return routeList
}

func (controller *FacultyController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Department")
}