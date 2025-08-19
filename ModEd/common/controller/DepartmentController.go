package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type DepartmentController struct {
	application *core.ModEdApplication
}

func NewDepartmentController() *DepartmentController {
	controller := &DepartmentController{}
	return controller
}

func (controller *DepartmentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}

func (controller *DepartmentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Department",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	return routeList
}

func (controller *DepartmentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Department")
}
