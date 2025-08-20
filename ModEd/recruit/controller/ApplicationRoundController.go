package controller

import (
	"ModEd/core"
	"github.com/gofiber/fiber/v2"
)

type ApplicationRoundController struct {
	application *core.ModEdApplication
}

func NewApplicationRoundController() *ApplicationRoundController {
	controller := &ApplicationRoundController{}
	return controller
}

func (controller *ApplicationRoundController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("Hello Recruit ApplicationRound")
}

func (controller *ApplicationRoundController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/recruit/ApplicationRound",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	return routeList
}
func (controller *ApplicationRoundController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}