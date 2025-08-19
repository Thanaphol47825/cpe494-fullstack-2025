package controller

import (
	"ModEd/core"

	"github.com/gofiber/fiber/v2"
)

type InterviewController struct {
	application *core.ModEdApplication
}

func NewBackOfficeController() *InterviewController {
	controller := &InterviewController{}
	return controller
}

func (controller *InterviewController) RenderMain(context *fiber.Ctx) error {
	return context.SendString("hello common/Interview")
}

func (controller *InterviewController) GetRoute() []*core.RouteItem {
	routeList := []*core.RouteItem{}
	routeList = append(routeList, &core.RouteItem{
		Route:   "/common/InterviewController",
		Handler: controller.RenderMain,
		Method:  core.GET,
	})

	return routeList
}

func (controller *InterviewController) SetApplication(application *core.ModEdApplication) {
	controller.application = application
}
