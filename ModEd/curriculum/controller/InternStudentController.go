package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InternStudentController struct {
	application *core.ModEdApplication
}

func NewInternStudentController() *InternStudentController {
	controller := &InternStudentController{}
	return controller
}

func (controller *InternStudentController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello curriculum/InternStudent")
}

func (controller *InternStudentController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum/InternStudent",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *InternStudentController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
