package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type InstructorController struct {
	application *core.ModEdApplication
}

func (controller *InstructorController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello common/Instructor")
}

func NewInstructorController() *InstructorController {
	controller := &InstructorController{}
	return controller
}

func (controller *InstructorController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/Instructor",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InstructorController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
