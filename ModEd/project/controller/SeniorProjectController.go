package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type SeniorProjectController struct {
	application *core.ModEdApplication
}

func NewSeniorProjectController() *SeniorProjectController {
	controller := &SeniorProjectController{}
	return controller
}

func (controller *SeniorProjectController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("hello yuil")
}

func (controller *SeniorProjectController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/project/seniorproject",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})
	/*routeList = append(routeList, &core.RouteItem{
	// 	Route:   "/info",
	// 	Handler: controller.GetInfo,
	// 	Method:  core.POST,
	})*/
	return routeList
}

func (controller *SeniorProjectController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
