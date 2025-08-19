package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type CurriculumController struct {
	application *core.ModEdApplication
}

func NewCurriculumController() *CurriculumController {
	controller := &CurriculumController{}
	return controller
}

func (controller *CurriculumController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Helloo curriculum")
}

func (controller *CurriculumController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/curriculum",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}

func (controller *CurriculumController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
